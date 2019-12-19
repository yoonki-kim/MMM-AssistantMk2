const fs = require("fs")

var _log = function() {
    var context = "[AMK2:BW]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class BufferToWav {
  constructor(config) {
    var debug = (config.debug) ? config.debug : false
    this.audioBuffer = new Buffer.alloc(5000)
    var samplesLength = 10000
    var header = new Buffer.alloc(1024)
    header.write('RIFF', 0)
    header.writeUInt32LE(32 + samplesLength * 2, 4)
    header.write('WAVE', 8)
    header.write('fmt ', 12)
    header.writeUInt32LE(16, 16)
    header.writeUInt16LE(1, 20)
    header.writeUInt16LE(config.channel, 22)
    header.writeUInt32LE(config.sampleRate, 24)
    header.writeUInt32LE(32000, 28)
    header.writeUInt16LE(2, 32)
    header.writeUInt16LE(16, 34)
    header.write('data', 36)
    header.writeUInt32LE(15728640, 40)
    this.audioBuffer = header.slice(0, 50)
    if (debug == true) log = _log
  }

  add(buffer) {
    this.audioBuffer = Buffer.concat([this.audioBuffer, buffer])
  }

  writeFile(file, callback=(file)=>{}) {
    fs.writeFile(file, this.audioBuffer, (err)=>{
      if (err) {
        log("WAV_FILE_CREATION_ERROR", err)
      }
      log("RESPONSE_WAV_FILE_CREATED")
      callback(file)
    })
  }

  getAudioLength() {
    return this.audioBuffer.length
  }
}

module.exports = BufferToWav
