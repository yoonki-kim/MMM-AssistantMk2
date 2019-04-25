class StatusTunnel {
  constructor(tunnel) {
    this.tunnel = tunnel
    this._id = Date.now()
  }
  status (ev, payload = null) {
    this.tunnel.transmit(ev, payload)
  }
  addTunnel(tunnel) {
    this.tunnel = tunnel
  }
  gc() {
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        this[key] = null
      }
    }
  }
}

module.exports = StatusTunnel
