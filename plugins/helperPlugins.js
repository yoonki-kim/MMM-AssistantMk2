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
    this.pluginsConfig = config.pluginsConfig
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    log((Object.entries(this.pluginsConfig).length == 0) ? "No plugins found !" : "Started !")
  }
  doHelperPlugins (notification,payload,callback) {
    this.send = callback
    /** describe your code here **/

    /*
    // Say if your plugin is enabled or not with INIT notification
    // example :
    if (notification == "INIT") log("Snowboy is " + (this.pluginsConfig.snowboy.useSnowboy ? "enabled" : "disabled"))

    //log("Notification:", notification)
    //log("Payload:", payload)
    //log("AMk2 Config:", this.config)
    //log("pluginsConfig:", this.pluginsConfig)
    //log("Debug:", this.debug)

    // for send socket notification "HELLO" and payload "TEST"
    //this.send("HELLO","TEST")
    */
  }
}

module.exports = PLUGINS
