const fs = require("fs")

var _log = function() {
    var context = "[AMK2:BM]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class BufferToMP3 {
  constructor(config) {
    var debug = (config.debug) ? config.debug : false
    if (debug == true) log = _log
    //log("MEMORY_USAGE:", process.memoryUsage())
    this.file = config.file
    log ("RESPONSE_MP3_FILE_CREATING:", this.file)
    this.audioBuffer = fs.createWriteStream(this.file)
    this.length = 0
  }

  add(buffer) {
    this.audioBuffer.write(buffer)
    this.length += buffer.length
  }

  close(cb=()=>{}) {
    //log("MEMORY_USAGE:", process.memoryUsage())
    this.audioBuffer.end()
    this.audioBuffer = null
    cb(this.file)
  }

  getAudioLength() {
    return this.length
  }
}

module.exports = BufferToMP3
