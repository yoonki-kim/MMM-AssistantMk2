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
    if (this.config.responseVoice) {
      this.play(file, com, option, ()=>{
        fs.unlink(file, (err) => {
          if (err) {
            console.log("[AMK2] Clearing response file error:", err)
          }
        })
        cb()
      })
    } else {
      cb()
    }
  },

  clearTmp: function() {
    var dir = path.resolve(__dirname, "tmp")
    var cmd = "cd " + dir + "; rm *.mp3; rm *.html"
    exec(cmd, (e,so,se)=>{
      console.log("[AMK2] Temporal storage directory is clearing.")
    })
  },

  initializeAfterLoading: function (config, cb) {
    console.log("[AMK2] MMM-AssistantMk2 Version:", require('./package.json').version)
    this.config = config
    if (!this.config.verbose) {
      console.log = function() {}
    }
    this.clearTmp()
    this.snowboy = new Snowboy(this.config.snowboy, this.config.record, (detected) => { this.hotwordDetect(detected) } , this.config.verbose )
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

  prepareActivate: function(pObj) {
    var textQuery = pObj.textQuery
    var id = pObj.id

    var cb = ()=>{
      if (textQuery) {
        this.sendSocketNotification("TRANSCRIPTION", {done:true, transcription:textQuery})
      }
      this.activate(textQuery)
    };
    this.playChime(cb)
  },

  activate: function(textQuery=null) {
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
          isOn: this.config.responseScreen
        },
      },
    }

    if (textQuery) {
      cfgInstance.conversation.textQuery = textQuery
    }

    var startConversation = (conversation) => {
      console.log("[AMK2] Conversation starts.")
      if (textQuery) {
        console.log("[AMK2] Started with text query:", textQuery)
      }

      let foundTextResponse = ""
      let finalTranscription = ""
      let audioError = null
      let spoken = null
      let screenOutput = null

      let audioBuffer = 0

      var mp3Key = Date.now()
      var mp3FileName = mp3Key + ".mp3"
      var mp3FilePath = "tmp/" + mp3FileName

      var mp3File = path.resolve(__dirname, mp3FilePath)
      var b2m = new B2M ({debug:this.config.verbose, file:mp3File, verbose: false})

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
        console.log("[AMK2] end-of-utterance")
        mic.stop()
        this.sendSocketNotification("MIC_OFF")
      })
      .on("transcription", (data) => {
        console.log("[AMK2] Transcription:", data.transcription, " --- Done:", data.done)
        this.sendSocketNotification("TRANSCRIPTION", data)
        if (data.done) {
          finalTranscription = data.transcription
          spoken = true
        }
      })

      .on("response", (text) => {
        if (text) console.log("[AMK2] Assistant Text Response:", text)
        foundTextResponse = text
      })
      .on("screen-data", (screen) => {
        var file = require("fs")
        var filePath = path.resolve(__dirname, "tmp", "temp.html")
        screenOutput = "temp.html"
        var str = screen.data.toString("utf8")
        str = str.replace("html,body{", "html,body{zoom:" + this.config.screenZoom + ";")
        var contents = file.writeFile(filePath, str, (error) => {
          if (error) {
            console.error("[AMK2] - temporal HTML creation fails. E: " + error);
            screenOutput = null
          }
        })
      })

      .on("ended", (error, continueConversation) => {
        if (continueConversation) {
          this.continueConversation = continueConversation
        } else {
          var tr = (textQuery) ? textQuery : finalTranscription
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
            "screenOutput": screenOutput,
            "foundTextResponse" : foundTextResponse,
            "finalTranscription" : finalTranscription,
            "spoken": spoken,
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
            this.sendSocketNotification("RESPONSE_START", conversationResult)
            this.playResponse(mp3File, ()=>{
              console.log("[AMK2] Conversation Completed")
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
      if (!textQuery) {
        var defaultOption = {
          device: null,
          recorder: "arecord",
          threshold: 0,
          sampleRate: 16000,
          verbose: false,
          debug: this.config.verbose
        }
        let recordConf = Object.assign({}, defaultOption, this.config.record)
        mic = new Record(recordConf,conversation, (err)=>{ if (err) console.log("[AMK2] Recorder Error: " + err) })
        this.sendSocketNotification("MIC_ON")
        mic.start()
      }
    }

    var assistant = new GoogleAssistant(cfgInstance.auth)
    assistant
    .on("ready", () => {
      console.log("[AMK2] Assistant READY")
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
