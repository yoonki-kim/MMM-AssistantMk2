/** Helper Plugins **/
/** Allow to create personal addon on node_helper **/
/** (with external source) **/
/** /!\ Think to backup your file before update ! **/
/** @bugsounet **/

var _log = function() {
    var context = "[AMK2:PLUGINS]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class PLUGINS {
  constructor(config) {
    this.config= config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    log("Started !")
  }
  doHelperPlugins (notification,payload,callback) {
    /** describe your code here **/
    // this.send = callback
    // log("Notification: ", notification)
    // log("Payload: ", payload
    // for send socket notification "HELLO" and payload "TEST"
    // this.send("HELLO","TEST")
}

module.exports = PLUGINS
