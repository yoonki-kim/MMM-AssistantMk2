const fs = require("fs")
const statusTunnel = require("./statusTunnel.js")

class BufferToWav extends statusTunnel {
  constructor(config, tunnel) {
    super(tunnel)
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
  }

  add(buffer) {
    this.audioBuffer = Buffer.concat([this.audioBuffer, buffer])
  }

  writeFile(file, callback=(file)=>{}) {
    fs.writeFile(file, this.audioBuffer, (err)=>{
      if (err) {
        this.status("WAV_FILE_CREATION_ERROR", err)
      }
      this.status("WAV_FILE_CREATED", [file, this.audioBuffer.length])
      callback(file)
      this.gc()
    })
  }
  getAudioLength() {
    return this.audioBuffer.length
  }
}

module.exports = BufferToWav
