const GoogleAssistant = require("google-assistant")

const path = require("path")
const fs = require("fs")
const record = require('node-record-lpcm16')
const eos = require('end-of-stream')
const B2W = require("./bufferToWav.js")
const StatusTunnel = require("./statusTunnel.js")

function disableTimeoutFromScreenOutput (str) {
  return str.replace(/document\.body,"display","none"/gim,(x)=>{
    return `document.body,"display","block"`
  })
}

class GA extends StatusTunnel{
  constructor(tunnel, config) {
    super(tunnel)
    this.verbose = config.verbose
    this.micConfig = config.mic
    this.speakerConfig = config.speaker
    this.speakerConfig = config.speaker
    this.screenZoom = config.screenOutputZoom
    this.onHotword = config.onHotword
    this.modulePath = config.modulePath
    this.responseWaitingTimeout = config.responseWaitingTimeout
    this.assistantConfig = {
      auth:{
        keyFilePath : path.resolve(config.modulePath, config.credentialPath),
      },
      conversationConfig : {
        audio : {
          encodingIn: "LINEAR16",
          sampleRateIn: 16000,
          encodingOut: "LINEAR16",
          sampleRateOut: 24000,
        },
        deviceModelId : config.deviceModelId,
        deviceId : config.deviceInstanceId,
        deviceLocation : {
          coordinates: {
            latitude: config.deviceLatitude,
            longitude: config.deviceLongitude
          }
        },
        screen : {
          isOn: config.useScreenOutput
        },
      },
    }
  }

  initConversation (originalPayload, conversation, endCallback=()=>{}) {
    var flushed = false
    var response = {}
    var b2w = new B2W ({channel:1, sampleRate: 24000}, this.tunnel)
    var responseAdd = (type, value) => {
      if (flushed) return
      response[type] = value
      if (type == "error") {
        flush()
      }
    }
    var flush = () => {
      this.status("RESPONSE_FLUSHED")
      flushed = true
      conversation.end()
      endCallback(response)
      this.status("ASSISTANT_END")
      this.gc()
    }
    var responseAddAudio = (data) => {
      if (originalPayload.useAudioOutput) b2w.add(data)
    }
    var responseEnd = () => {
      if (b2w.getAudioLength() > 50) {
        this.status("RESPONSE_AUDIO_MAKING")
        var responseFile = "tmp/lastResponse.wav"
        var filePath = path.resolve(this.modulePath, responseFile)
        b2w.writeFile(filePath, (file)=>{
          responseAdd("audioOutput", {
            path: filePath,
            uri: responseFile,
          })
          flush()
        })
      } else {
        this.status("RESPONSE_AUDIO_TOO_SHORT")
        flush()
      }

    }
    responseAdd('id', originalPayload.id)
    responseAdd("request", originalPayload)
    conversation
    .on('volume-percent', (percent) => {
      this.status("RESPONSE_VOLUME", percent)
      responseAdd("volumePercent", percent)
    })
    .on('end-of-utterance', () => {
      responseAdd("endOfUtterance", true)
    })
    .on('transcription', (data) => {
      this.status(`RESPONSE_TRANSCIPTION : ${data.transcription}`, data.done)
      if (data.done) responseAdd("transcription", data.transcription)
    })
    .on('device-action', (action) => {
      this.status('RESPONSE_DEVICE_ACTION', action)
      if (action.requestId) responseAdd("requestId", action.requestId)
      if (action.inputs) responseAdd("deviceAction", action.inputs)
    })
    .on('response', (text) => {
      this.status('RESPONSE_TEXT', text)
      responseAdd("textResponse", text)
    })
    .on('screen-data', (screen) => {
      var file = "tmp/lastScreenOutput.html"
      var filePath = path.resolve(this.modulePath, file)
      var str = screen.data.toString("utf8")
      str = disableTimeoutFromScreenOutput(str)
      str = str.replace("html,body{", `html,body{zoom:${this.screenZoom};`)
      var contents = fs.writeFile(filePath, str, (error) => {
        if (error) {
         this.status("SCREENOUTPUT_CREATION_ERROR", error);
        } else {
          this.status("SCREENOUTPUT_CREATED");
          responseAdd("screenOutput", {
            path: filePath,
            uri: file,
            content: str,
          })
        }
      })
    })
    .on('audio-data', (data) => {
      responseAddAudio(data)
    })
    .on('ended', (error, continueConversation) => {
      if (error) {
        this.status('CONVERSATION_END_ERROR', error)
        responseAdd("error", error)
      } else if (continueConversation) {
        this.status("CONVERSATION_CONTINUED")
        responseAdd("continue", true)
      } else {
        this.status('CONVERSATION_COMPLETED')
        responseAdd("continue", false)
        responseAdd("ended", true)
      }
      setTimeout(()=>{
        responseEnd()
      }, 500)
    })
    .on('error', (error) => {
      this.status('ASSISTANT_CONVERSATION_ERROR', error)
      responseAdd("error", error)
      conversation.end()
      this.gc()
    })
    if (originalPayload.key) {
      var s = fs.createReadStream(originalPayload.key, {highWaterMark:8192}).pipe(conversation)
    }
  }

  start (profile, conversation) {
    this.assistantConfig.auth.savedTokensPath = path.resolve(this.modulePath, "profiles/" + profile.profileFile)
    this.assistant = new GoogleAssistant(this.assistantConfig.auth)
    this.assistant
    .on('ready', () => {
      this.status("ASSISTANT_READY")
      this.assistant.start(this.assistantConfig.conversationConfig)
    })
    .on('started', conversation)
    .on('error', (error) => {
      this.status('ASSISTANT_ERROR', error)
      conversation.end()
      this.gc()
    })
  }

  activate (payload, callback=()=>{}) {
    var filePath = null
    var converse = null
    var profile = payload.profile
    var type = payload.type

    if (type == "TEXT") this.assistantConfig.conversationConfig.textQuery = payload.key
    if (type == "WAVFILE") filePath = payload.key
    this.assistantConfig.conversationConfig.lang = (payload.lang) ? payload.lang : profile.lang
    this.assistantConfig.conversationConfig.screen.isOn = payload.useScreenOutput
    converse = (conversation) => {
      this.status("CONVERSATION")
      this.initConversation(payload, conversation, callback)
    }
    this.start(profile, converse)
  }
}

module.exports = GA
