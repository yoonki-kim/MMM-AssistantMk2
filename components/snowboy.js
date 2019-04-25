const path = require('path')
//const record = require('node-record-lpcm16')
const record = require("./lpcm16.js")
const Detector = require('../snowboy/lib/node/index.js').Detector
const Models = require('../snowboy/lib/node/index.js').Models
const fs = require('fs')
const eos = require('end-of-stream')
const B2W = require("./bufferToWav.js")
const StatusTunnel = require("./statusTunnel.js")

class Snowboy extends StatusTunnel{
  constructor (tunnel, config, onDetected=(hotword, queryFile)=>{}) {
    super(tunnel)
    this.modulePath = path.resolve(__dirname, "..")
    this.recordConfig = config.mic
    this.onHotword = config.onHotword
    this.models = new Models()
    for(const model of config.models) {
      this.models.add({
        file: path.resolve(this.modulePath, model.file),
        sensitivity: model.sensitivity,
        hotwords: model.hotwords
      })
    }
    this.detectorConfig = config.detector
    this.onDetected = onDetected
    this.detector = null
    this.b2w = null
    this.detectedHotword = ""
    this.recording = false
  }

  startAgain () {
    this.status("HOTWORD_DETECTOR_START_AGAIN")
    this.stop()
    setTimeout(()=>{
      this.start()
    }, 100)
  }

  stop () {
    this.status("HOTWORD_DETECTOR_END")
    record.stop()
    this.detector.end()
    //this.gc()
  }

  start () {
    this.detector = null
    this.b2w = null
    this.detectedHotword = ""
    this.recording = false
    this.queryFile = path.resolve(this.modulePath, "tmp/lastQuery.wav")
    this.detector = new Detector({
      resource: path.resolve(this.modulePath, "snowboy/resources/common.res"),
      models: this.models,
      audioGain: this.detectorConfig.audioGain,
      applyFrontend: this.detectorConfig.applyFrontend,
    })
    this.detector.on('silence', () => {
      this.status("HOTWORD_SILENCE")
    })
    this.detector.on('sound', (buffer) => {
      this.status("HOTWORD_SOUND", buffer.length)
      if(this.detectedHotword) {
        this.recording = true
        this.b2w.add(buffer)
        this.status("HOTWORD_QUERY_RECORDING", buffer.length)
      }
    })
    this.detector.on('error', (err) => {
      this.status("HOTWORD_DETECTOR_ON_ERROR:", err)
    })
    this.detector.on('hotword', (index, hotword, buffer) => {
      if (this.detectedHotword) return
      this.status("HOTWORD_DETECTED", hotword)
      this.detectedHotword = hotword
      if (this.onHotword.hasOwnProperty(hotword)) {
        var detectedType = this.onHotword[hotword].type
        if (detectedType == "ASSISTANT") {
          this.b2w = new B2W({
            channel : this.detector.numChannels(),
            sampleRate: this.detector.sampleRate()
          }, this.tunnel)
        } else {
          this.status("HOTWORD_DIRECT_COMMAND", this.onHotword[hotword].payload)
          return
        }
      } else {
        this.status("HOTWORD_DETECTED_BUT_NOT_DEFINED", hotword)
      }
    })
    this.micStart()
  }

  micStart () {
    this.status("HOTWORD_DETECTOR_MIC_START")
    record.start(this.recordConfig).pipe(this.detector);
    eos(this.detector, (err) => {
      if (err) {
        this.status("HOTWORD_DETECTOR_ERROR", err)
      }
      this.micStop()
    })
  }

  micStop () {
    if (this.recording) {
      this.recording = false
      var length = this.b2w.getAudioLength()
      if (length < 8192) {
        this.b2w = null
        this.status("QUERY_AUDIO_TOO_SHORT", length)
        this.startAgain()
      } else {
        this.b2w.writeFile(this.queryFile, (file)=>{
          var pl = this.onHotword[this.detectedHotword]
          this.onDetected(pl, file)
        })
        this.status("QUERY_AUDIO_CREATED", this.queryFile)
      }
    } else {
      this.status("HOTWORD_NOT_DETECTED")
      this.startAgain()
    }
  }

}
module.exports = Snowboy
