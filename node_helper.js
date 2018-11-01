//
// Module : MMM-AssistantMk2
//

"use strict"

const path = require("path")
const record = require("node-record-lpcm16")
const GoogleAssistant = require("google-assistant")
const exec = require("child_process").exec
const fs = require("fs")



var NodeHelper = require("node_helper")


module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
    this.continueConversation = false
    this.currentPayload = null
  },

  playChime: function (cb) {
    var com = ""
    var file = path.resolve(__dirname, "resources", this.config.startChime)
    if(this.config.mp3PlayCommand.match("%FILE%")) {
      com = this.config.mp3PlayCommand.replace("%FILE%", file)
    } else {
      com = this.config.mp3mp3PlayCommand + " " + file
    }
    exec(com, (e,so,se)=>{
      if (e) {
        console.log("[AMK2] Playing chime error:", e)
      }
      cb()
    })
  },

  playResponse: function (file, cb) {
    var com = ""
    if(this.config.mp3PlayCommand.match("%FILE%")) {
      com = this.config.mp3PlayCommand.replace("%FILE%", file)
    } else {
      com = this.config.mp3mp3PlayCommand + " " + file
    }
    exec(com, (e,so,se)=>{
      if (e) {
        console.log("[AMK2] Speaking response error:", e)
      }
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
    var cmd = "cd " + dir + "; rm *.mp3"
    exec(cmd, (e,so,se)=>{
      console.log("[AMK2] Temporal storage directory is clearing.")
      //if (e) console.log(e)
    })
  },

  initializeAfterLoading: function (config) {
    this.config = config
    if (!this.config.verbose) {
      console.log = function() {}
    }
    this.clearTmp()
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
    case "INIT":
      this.initializeAfterLoading(payload)
      this.sendSocketNotification("INITIALIZED")
      break
    case "START":
      this.prepareActivate(payload)
      break
    }
  },

  prepareActivate: function(pObj) {
    var payload = pObj.profile
    var textQuery = pObj.textQuery
    var sender = pObj.sender
    var id = pObj.id

    if (this.continueConversation) {
      payload = this.currentPayload
    }
    this.playChime(()=>{
      this.sendSocketNotification("STARTED")
      if (textQuery) {
        this.sendSocketNotification("TRANSCRIPTION", {done:true, transcription:textQuery})
      }
      this.activate(payload, textQuery, sender)
    })
  },

  activate: function(payload, textQuery=null, sender=null) {
    console.log(payload, textQuery, sender)
    var transcriptionHook = this.config.transcriptionHook

    var cfgInstance = {
      auth:{
        keyFilePath : path.resolve(__dirname, this.config.auth.keyFilePath),
        savedTokensPath : path.resolve(__dirname, "profiles/" + payload.profileFile),
      },
      conversation : {
        audio : {
          encodingIn: "LINEAR16",
          sampleRateIn: 16000,
          encodingOut: "MP3",
          sampleRateOut: 24000,
        },
        lang : payload.lang,
        deviceModelId : this.config.deviceModelId,
        deviceId : this.config.deviceInstanceId,
        deviceLocation : this.config.deviceLocation,
        screen : {
          isOn: this.config.useScreen
        },
      },
    }

    if (textQuery) {
      cfgInstance.conversation.textQuery = textQuery

    }

    this.currentPayload = payload

    var startConversation = (conversation) => {
      console.log("[AMK2] Conversation starts.")
      if (textQuery) {
        console.log("[AMK2] Started with text query:", textQuery)
      }

      let foundHook = []
      let foundAction = null
      let foundVideo = null
      let foundVideoList = null
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
      var wstream = fs.createWriteStream(mp3File)

      // setup the conversation
      conversation
      .on("audio-data", (data) => {
        audioBuffer += data.length;
        try {
          if (data.length > 0) {
            wstream.write(data)
          }
        } catch (error) {
          wstream.end()
          audioError = error
          console.error("[AMK2] E:", error)
          console.log("[AMK2] Some error happens. Try again.")
        }
      })
      // done speaking, close the mic
      .on("end-of-utterance", () => {
        console.log("[AMK2] end-of-utterance")
        record.stop()
      })
      // just to spit out to the console what was said (as we say it)
      .on("transcription", (data) => {
        console.log("[AMK2] Transcription:", data.transcription, " --- Done:", data.done)
        this.sendSocketNotification("TRANSCRIPTION", data)
        if (data.done) {
          finalTranscription = data.transcription
          spoken = true
        }
      })

      // what the assistant said back. But currently, GAS doesn"t return text response with screenOut at same time (maybe.)
      .on("response", (text) => {
        console.log("[AMK2] Assistant Text Response:", text)
        foundTextResponse = text
      })
      // if we"ve requested a volume level change, get the percentage of the new level
      // But I"ll not support this feature.
      .on("volume-percent", (percent) => {
        console.log("[AMK2] Volume control... Not yet supported")
      })
      // the device needs to complete an action
      .on("device-action", (action) => {
        console.log("[AMK2] Device Action:", action)
        if (typeof action["inputs"] !== "undefined") {
          var intent = action.inputs[0].payload.commands
          console.log("[AMK2] execution", action.inputs[0].payload.commands[0].execution[0])
          foundAction = action.inputs[0].payload.commands
        }
      })
      .on("screen-data", (screen) => {
        var self = this
        var file = require("fs")
        var filePath = path.resolve(__dirname, "temp.html")
        screenOutput = "temp.html"
        var str = screen.data.toString("utf8")
        str = str.replace("html,body{", "html,body{zoom:" + this.config.screenZoom + ";")


        /*
        // TODO:I'll put some code here for web scrapping for contents reading.
        //For Image Search
        //https://www.google.com/search?tbm=isch

        var re = new RegExp("(tbm=isch[^<]*)", "ig")
        var isch = re.exec(str)
        //console.log("image:", isch)
        if (isch) {
          this.sendSocketNotification("IMAGE_OUTPUT", isch)
        }
        */
        var contents = file.writeFile(filePath, str,
          (error) => {
            if (error) {
             console.error("[AMK2] - temporal HTML creation fails. E: " + error);
             screenOutput = null
            }
          }
        )

        var re = new RegExp("youtube\.com\/watch\\?v\=([0-9a-zA-Z\-\_]+)", "ig")
        var youtubeVideo = re.exec(str)
        if (youtubeVideo) {
          console.log("[AMK2] video found:", youtubeVideo[1])
          foundVideo = youtubeVideo[1]
        }

        var re = new RegExp("youtube\.com\/playlist\\?list\=([a-zA-Z0-9\-\_]+)", "ig")
        var youtubeList = re.exec(str)
        if (youtubeList) {
          console.log("[AMK2] video list found:", youtubeList[1])
          foundVideoList = youtubeList[1]
        }
      })

      // once the conversation is ended, see if we need to follow up
      .on("ended", (error, continueConversation) => {
        if (continueConversation) {
          this.continueConversation = continueConversation
          foundHook = []
          foundVideo = null
          foundVideoList = null
        } else {
          var tr = (textQuery) ? textQuery : finalTranscription
          foundHook = this.findHook(transcriptionHook, tr)
        }

        if (error) {
          console.error("[AMK2] Conversation Ended Error:", error)
          console.error("[AMK2] Conversation Error:", error)
          this.sendSocketNotification("CONVERSATION_ERROR", error)
          return
        } else {
          error = null
        }

        setTimeout(()=>{
          wstream.end()
          var conversationResult = {
            "screenOutput": screenOutput,
            "foundHook": foundHook,
            "foundAction": foundAction,
            "foundVideo": foundVideo,
            "foundVideoList": foundVideoList,
            "foundTextResponse" : foundTextResponse,
            "finalTranscription" : finalTranscription,
            "spoken": spoken,
            "audioSize" : audioBuffer,
            "audioError" : audioError,
            "responseFile" : mp3FileName,
            "continueConversation": continueConversation,
            "error" : error,
            "sender": sender,
          }

          if (conversationResult.foundHook.length > 0) {
            this.sendSocketNotification("CONVERSATION_END", conversationResult)
          } else {
            if (conversationResult.audioSize <= 0) {
              conversationResult.audioError = "NO RESPONSE AUDIO IS RETURNED."
              conversationResult.error = conversationResult.audioError
              console.log("[AMK2]", conversationResult.audioError)
              this.sendSocketNotification("CONVERSATION_END", conversationResult)
            } else {
              this.sendSocketNotification("RESPONSE_START", conversationResult)
              this.playResponse(mp3File, ()=>{
                console.log("[AMK2] Conversation Completed")
                this.sendSocketNotification("RESPONSE_END", conversationResult)
                setTimeout(()=>{
                  this.sendSocketNotification("CONVERSATION_END", conversationResult)
                }, 100)
              })
            }
          }
        }, 1000)
      })

      // catch any errors
      .on("error", (error) => {
        wstream.end()
        console.error("[AMK2] Conversation Error:", error)
        this.sendSocketNotification("CONVERSATION_ERROR", error)
      })
      if (!textQuery) {
        var mic = record.start(this.config.record)
        mic.on("data", (data) => {
          try {
            conversation.write(data)
          } catch (err) {
            console.error("[AMK2] mic error:", err)
          }
        })
      }
    }

    var assistant = new GoogleAssistant(cfgInstance.auth)
    assistant
    .on("ready", () => {
    // start a conversation!
      console.log("[AMK2] assistant ready")
      this.sendSocketNotification("ASSISTANT_READY")
      assistant.start(cfgInstance.conversation)
    })
    .on("started", startConversation)
    .on("error", (error) => {
      console.error("[AMK2] Assistant Error:", error)
      this.sendSocketNotification("ASSISTANT_ERROR", error)
    })
  },

  findHook: function(transcriptionHook, transcription) {
    var foundHook = []
    for (var k in transcriptionHook) {
      if (transcriptionHook.hasOwnProperty(k)) {
        var v = transcriptionHook[k];
        var pattern = new RegExp(v.pattern, "ig")
        var found = pattern.exec(transcription)
        if (found !== null) {
          foundHook.push({"key":k, "match":found})
        }
      }
    }
    return foundHook
  }
})
