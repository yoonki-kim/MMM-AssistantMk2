const GoogleAssistant = require("google-assistant")
const B2W = require("./bufferToWav.js")
const Record = require("node-record-lpcm16")

const path = require("path")
const fs = require("fs")



var _log = function() {
    var context = "[AMK2:AS]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ASSISTANT {
  constructor(config, tunnel = ()=>{}) {
    var debug = (config.debug) ? config.debug : false
    this.session = config.session
    this.modulePath = config.modulePath
    this.screenZoom = config.screenZoom
    this.micConfig = config.micConfig

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
        deviceModelId : config.modelId,
        deviceId : config.instanceId,
        deviceLocation : {
          coordinates: {
            latitude: config.latitude,
            longitude: config.longitude
          }
        },
        screen : {
          isOn: config.useScreenOutput
        },
      },
    }
    this.useScreenOutput = config.useScreenOutput
    if (debug == true) log = _log
    this.debug = debug
    this.timer = null
    this.timeout = false
    this.micMode = false
    this.tunnel = tunnel
  }


  activate (payload, callback=()=>{}) {
    log("A:", payload)
    var converse = null
    var profile = payload.profile
    var type = payload.type

    if (type == "TEXT") {
      this.assistantConfig.conversationConfig.textQuery = payload.key
      payload.key = null
    }
    if (type == "MIC") this.micMode = true
    //if (type == "WAVFILE") filePath = payload.key
    this.assistantConfig.conversationConfig.lang = (payload.lang) ? payload.lang : profile.lang
    this.assistantConfig.conversationConfig.screen.isOn = payload.useScreenOutput
    log("B:", this.assistantConfig.conversationConfig)
    converse = (conversation) => {
      this.initConversation(payload, conversation, callback)
    }
    this.start(profile, converse)
  }

  start (profile, conversation) {
    this.assistantConfig.auth.savedTokensPath = path.resolve(this.modulePath, "profiles/" + profile.profileFile)
    this.assistant = new GoogleAssistant(this.assistantConfig.auth)
    this.assistant
    .on('ready', () => {
      log("C:", this.assistantConfig.conversationConfig)
      this.assistant.start(this.assistantConfig.conversationConfig)
    })
    .on('started', conversation)
    .on('error', (error) => {
      conversation.end()
    })
  }

  initConversation (originalPayload, conversation, endCallback=(resoponse)=>{}) {
    this.response = {
      session: this.session,
      error: null,
      action: null,
      text: null, // text response
      screen: null, // html response
      audio: null, // audio response
      transcription: null, // {transcription:String, done:Boolean} or null
      continue: false
    }
    var b2w = new B2W ({channel:1, sampleRate: 24000, debug:this.debug})
    var mic = null
    if (this.micMode) {
      var defaultOption = {
        device: null,
        recorder: "sox",
        audioType: "wav",
        threshold: 0,
        sampleRate: 16000,
        endOnSilence: true,
        verbose:this.debug
      }
      //console.log(this.micConfig)
      mic = Record.record(Object.assign({}, defaultOption, this.micConfig))
      log("MIC:RECORDING START.")
      mic.stream()
	.on("data", (data) => { conversation.write(data) })
	.on("error", (err) => { log("Recorder Error: " + err) }) // for RPI arecord error
    }

    conversation
    .on('volume-percent', (percent) => {
      log("CONVERSATION:VOLUME", percent)
    })
    .on('end-of-utterance', () => {
      log("CONVERSATION:END_OF_UTTERANCE")
      if (this.micMode && mic) {
        mic.stop()
        log("MIC:RECORDING_END")
      }
    })
    .on('transcription', (data) => {
      log("CONVERSATION:TRANSCRIPTION", data)
      this.tunnel({type: "TRANSCIPTION", payload:data})
      this.response.transcription = data
      // {transcription:String, done:Boolean} or null
      //this.tunnel("TRANSCRIPTION", data)
    })
    .on('device-action', (action) => {
      log("CONVERSATION:ACTION", action)
      this.response.action = action
    })
    .on('response', (text) => {
      log("CONVERSATION:RESPONSE", text)
      if (text) this.response.text = text
    })
    .on('screen-data', (screen) => {
      log("CONVERSATION:SCREEN", typeof screen)
      if (this.useScreenOutput) {
        this.response.screen = {
          originalContent: screen.data.toString("utf8")
        }
      }
    })
    .on('audio-data', (data) => {
      log("CONVERSATION:AUDIO", data.length)
      b2w.add(data)
    })
    .on('ended', (error, continueConversation) => {
      log("CONVERSATION_ALL_RESPONSES_RECEIVED")
      clearTimeout(this.timer)
      this.timer = null
      if (this.timeout) {
        error = "Timeout: Too late response."
      }
      if (error) {
        log('CONVERSATION_END:ERROR', error)
        this.response.error = error
      } else if (continueConversation) {
        log("CONVERSATION_END:CONTINUED")
        this.response.continue = true
      } else {
        log('CONVERSATION_END:COMPLETED')
        this.response.continue = false
      }
      if (b2w.getAudioLength() > 50) {
        log("CONVERSATION_PP:RESPONSE_AUDIO_MAKING")
        var responseFile = "tmp/lastResponse.wav"
        var filePath = path.resolve(this.modulePath, responseFile)
        b2w.writeFile(filePath, (file)=>{
          log("CONVERSATION_PP:RESPONSE_AUDIO_CREATED", responseFile)
          this.response.audio = {
            path: filePath,
            uri : responseFile,
          }
          endCallback(this.response)
        })
      } else {
        log("CONVERSATION_PP:RESPONSE_AUDIO_TOO_SHORT_OR_EMPTY - ", b2w.getAudioLength())
        this.response.error = "TOO_SHORT"
        endCallback(this.response)
      }
    })
    .on('error', (error) => {
      log("CONVERSATION_ERROR :", error)
      this.response.error = "CONVERSATION_ERROR"
      if (error.code == "14") {
        log (">> This error might happen when improper configuration or invalid Mic setup.")
      }
      conversation.end()
      endCallback(this.response)
    })
    if (originalPayload.key) {
      var s = fs.createReadStream(originalPayload.key, {highWaterMark:4096}).pipe(conversation)
    }
  }
}

module.exports = ASSISTANT
