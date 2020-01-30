/** addons.js **/
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

var addonsConfig = {
  // /!\ do not remove TAG_AUTOINSERTCONFIG !
  //_TAG_AUTOINSERTCONFIG_

  test: {
    useTest: true,
    messageConsole: "Hi there ! this is a test plugin for show your configs !"
  },
};

class ADDONS {
  constructor(config) {
    this.config= config
    var debug = (this.config.debug) ? this.config.debug : false
    if (debug == true) log = _log
    this.debug = debug
    this.addonsConfig = addonsConfig
    log((Object.entries(this.addonsConfig).length == 0) ? "No addons found !" : "Started !")
  }
  doAddons (notification,payload,callback) {
    this.send = callback
    // /!\ do not remove TAG_AUTOINSERTADDONS !
    //_TAG_AUTOINSERT_

    // test_plugin
    if (notification == "INIT") log("Test_plugin is " + (this.addonsConfig.test.useTest ? "enabled" : "disabled"))
    if (notification == "INIT" && this.addonsConfig.test.useTest) {
      console.log(this.addonsConfig.test.messageConsole)
      //log("Notification:", notification)
      //log("Payload:", payload)
      log("AMk2 Config:", this.config)
      log("addonsConfig:", this.addonsConfig)
      // for send socket notification "HELLO" and payload "TEST"
      //this.send("HELLO","TEST")
    }
  }
}

module.exports = ADDONS
