/** node_helper - Module : MMM-AssistantMk2 v3.5 **/

"use strict"

const path = require("path")
const Record = require("@bugsounet/node-lpcm16")
const B2M = require("@bugsounet/node-buffertomp3")
const Snowboy = require("@bugsounet/snowboy").Snowboy
const GoogleAssistant = require("google-assistant")
const exec = require("child_process").exec
const fs = require("fs")
var NodeHelper = require("node_helper")
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
    this.continueConversation = false
    this.speaker = null
  },

  play: function(file, command, option, cb=()=>{}) {
    const player = require('play-sound')()
    this.sendSocketNotification("SPEAKER_ON")
    var co = {}
    co[command] = option
    this.speaker = player.play(file, co, (err)=>{
      if (err && !err.killed) {
        console.log("Speaker error:", err)
        throw err
      }
      this.sendSocketNotification("SPEAKER_OFF")
      cb()
    })
  },

  playChime: function (cb) {
    var com = this.config.play.playProgram
    var option = this.config.play.playOption
    var file = path.resolve(__dirname, "resources", this.config.startChime)
    this.play(file, com, option, ()=>{cb()})
  },

  playResponse: function (file, cb) {
    this.sendSocketNotification("RESPONSING")
    var com = this.config.play.playProgram
    var option = this.config.play.playOption
    this.play(file, com, option, ()=>{
      fs.unlink(file, (err) => {
        if (err) {
          console.log("[AMK2] Clearing response file error:", err)
        }
      })
      cb()
    })
  },

  clearTmp: function() {
    var dir = path.resolve(__dirname, "tmp")
    var cmd = "cd " + dir + "; rm *.mp3; rm *.html"
    exec(cmd, (e,so,se)=>{
      log("Temporal storage directory is clearing.")
    })
  },

  initializeAfterLoading: function (config, cb) {
    console.log("[AMK2] MMM-AssistantMk2 Version:", require('./package.json').version)
    this.config = config
    if (this.config.debug) {
      log = (...args) => { console.log("[AMK2]", ...args) }
    }
    this.clearTmp()
    this.snowboy = new Snowboy(this.config.snowboy, this.config.record, (detected) => { this.hotwordDetect(detected) } , this.config.debug )
    this.snowboy.init()
    console.log ("[AMK2] AssistantMk2 is initialized.")
    cb()
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.initializeAfterLoading(payload, ()=>{
          this.sendSocketNotification("INITIALIZED")
        })
        break
      case "START":
        this.prepareActivate(payload)
        break
      case "SNOWBOY_START":
        this.snowboy.start()
        break
      case "SNOWBOY_STOP":
        this.snowboy.stop()
        break
    }
  },

  prepareActivate: function() {
    this.playChime(()=>{ this.activate() })
  },

  activate: function() {
    var mic
    var cfgInstance = {
      auth:{
        keyFilePath : path.resolve(__dirname, "./credentials.json"),
        savedTokensPath : path.resolve(__dirname, "./token.json"),
      },
      conversation : {
        audio : {
          encodingIn: "LINEAR16",
          sampleRateIn: 16000,
          encodingOut: "MP3",
          sampleRateOut: 24000,
        },
        lang : this.config.lang,
        deviceLocation : {
          coordinates: this.config.coordinates
        },
        screen : {
          isOn: false
        },
      },
    }

    var startConversation = (conversation) => {
      log("Conversation starts.")

      let finalTranscription = ""
      let audioError = null

      let audioBuffer = 0

      var mp3Key = Date.now()
      var mp3FileName = mp3Key + ".mp3"
      var mp3FilePath = "tmp/" + mp3FileName

      var mp3File = path.resolve(__dirname, mp3FilePath)
      var b2m = new B2M ({debug:this.config.debug, file:mp3File, verbose: false})

      conversation
      .on("audio-data", (data) => {
        audioBuffer += b2m.getAudioLength()
        try {
          if (data.length > 0) {
            b2m.add(data)
          }
        } catch (error) {
          audioError = error
          console.error("[AMK2] E:", error)
          console.log("[AMK2] Some error happens. Try again.")
        }
      })
      .on("end-of-utterance", () => {
        log("end-of-utterance")
        mic.stop()
        this.sendSocketNotification("MIC_OFF")
      })
      .on("transcription", (data) => {
        log("Transcription:", data.transcription, " --- Done:", data.done)
        this.sendSocketNotification("TRANSCRIPTION", data)
        if (data.done) {
          finalTranscription = data.transcription
        }
      })

      .on("ended", (error, continueConversation) => {
        if (continueConversation) {
          this.continueConversation = continueConversation
        } else {
          var tr = finalTranscription
        }

        if (error) {
          console.error("[AMK2] Conversation Error:", error)
          this.sendSocketNotification("CONVERSATION_ERROR", error)
          return
        } else {
          error = null
        }

        setTimeout(()=>{
          b2m.close()
          var conversationResult = {
            "finalTranscription" : finalTranscription,
            "audioSize" : audioBuffer,
            "audioError" : audioError,
            "responseFile" : mp3FileName,
            "continueConversation": continueConversation,
            "error" : error
          }
          if (conversationResult.audioSize <= 0) {
            conversationResult.audioError = "NO RESPONSE AUDIO IS RETURNED."
            conversationResult.error = conversationResult.audioError
            console.log("[AMK2]", conversationResult.audioError)
            this.sendSocketNotification("CONVERSATION_ERROR",conversationResult.error)
            this.sendSocketNotification("CONVERSATION_END", conversationResult)
          } else {
            this.playResponse(mp3File, ()=>{
              log("Conversation Completed")
              this.sendSocketNotification("RESPONSE_END", conversationResult)
              setTimeout(()=>{
                this.sendSocketNotification("CONVERSATION_END", conversationResult)
              }, 10)
            })
          }
        }, 100)
      })

      .on("error", (error) => {
        b2m.close()
        console.error("[AMK2] Conversation Error:", error)
        this.sendSocketNotification("CONVERSATION_ERROR", error)
      })
      var defaultOption = {
        device: null,
        recorder: "arecord",
        threshold: 0,
        sampleRate: 16000,
        verbose: false,
        debug: this.config.debug
      }
      let recordConf = Object.assign({}, defaultOption, this.config.record)
      mic = new Record(recordConf,conversation, (err)=>{ if (err) console.log("[AMK2] Recorder Error: " + err) })
      this.sendSocketNotification("MIC_ON")
      mic.start()
    }

    var assistant = new GoogleAssistant(cfgInstance.auth)
    assistant
    .on("ready", () => {
      log("Assistant READY")
      assistant.start(cfgInstance.conversation)
    })
    .on("started", startConversation)
    .on("error", (error) => {
      mic.stop()
      this.sendSocketNotification("MIC_OFF")
      console.error("[AMK2] Assistant Error:", error)
      this.sendSocketNotification("ASSISTANT_ERROR", error)
    })
  },
  /** Snowboy Callback **/
  hotwordDetect: function(detected) {
    if (detected) this.sendSocketNotification("ASSISTANT_ACTIVATE")
  }
})
