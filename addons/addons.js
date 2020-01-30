/** Helper Plugins **/
/** Allow to create personal addon on node_helper **/
/** (with external source) **/
/** /!\ Think to backup your file before update ! **/
/** @bugsounet **/

var _log = function() {
    var context = "[AMK2:ADDONS]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ADDONS {
  constructor(config) {
    this.config= config
    this.addonsConfig = config.addonsConfig
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    log((Object.entries(this.addonsConfig).length == 0) ? "No plugins found !" : "Started !")
  }
  doAddons (notification,payload,callback) {
    this.send = callback
    // /!\ do not remove TAG_AUTOINSERT !
    //_TAG_AUTOINSERT_

  }
}

module.exports = ADDONS
