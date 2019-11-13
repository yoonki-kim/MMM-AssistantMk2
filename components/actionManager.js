const path = require("path")
const fs = require("fs")

var _log = function() {
    var context = "[AMK2:AM]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ACTIONMANAGER {
  constructor (config, debug = false) {
    this.config = config
    if (debug == true) log = _log
  }

  makeAction (callback=()=>{}) {
    log ("Auto-making Action:", this.config.autoMakeAction)
    if (!this.config.autoMakeAction) {
      callback()
      return
    }
    var template = {
      manifest: {
        displayName: "MAGICEMIRROR CUSTOM DEVICE ACTION",
        invocationName : "MAGICMIRROR CUSTOM DEVICE ACTION",
        category: "PRODUCTIVITY"
      },
      actions: [],
      types: [],
    }
    if (this.config.actionLocale) {
      template.locale = this.config.actionLocale
    }
    for (var key in actions) {
      if (actions.hasOwnProperty(key)) {
        var name = key
        var action = actions[key]
        if (Array.isArray(action.patterns)) {
          var at = {
            name: "",
            availability: {deviceClasses: [{assistantSdkDevice: {}}]},
            intent: {
              name: "",
              parameters: [],
              trigger: {queryPatterns:[]},
            },
            fulfillment:{
              staticFulfillment: {
                templatedResponse: {
                  items: []
                }
              }
            }
          }
          at.name = "AMK2.action." + name
          at.intent.name = (action.intentName) ? action.intentName : "AMK2.intent." + name
          at.intent.trigger.queryPatterns = action.patterns
          at.intent.parameters = (action.parameters) ? action.parameters : []
          at.fulfillment.staticFulfillment.templatedResponse.items[0] = {
            simpleResponse:{
              textToSpeech:(action.response) ? action.response : ""
            }
          }
          at.fulfillment.staticFulfillment.templatedResponse.items[1] = {
            deviceExecution: {
              command: (action.commandName) ? action.commandName : "AMK2.command." + name,
              params: (action.commandParams) ? action.commandParams : {}
            }
          }
          template.actions.push(at)
          if (action.types) {
            template.types = template.types.concat(action.types)
          }
        }
      }
    }
    var jsonTxt = JSON.stringify(template, null, 2)
    fs.writeFile(path.resolve(__dirname, "../tmp/action_package.json"), jsonTxt, "utf8", (err)=>{
      if (err) {
        log("Error - Action package JSON file creation failed", err)
        callabck()
      } else {
        this.gactionCLI(callback)
      }
    })
  }

  gactionCLI (callback=()=>{}) {
    log("Auto-refreshing Action:", this.config.autoRefreshAction)
    if (!this.config.autoRefreshAction) {
      callback()
      return
    }
    var actionFile = path.resolve(__dirname, "../tmp/action_package.json")
    var cdPath = path.resolve(__dirname, "../utility/gaction_cli")
    var cmd = `cd ${cdPath}; ./gactions test --action_package ${actionFile} --project ${this.config.projectId}`
    exec(cmd, (e, so, se)=>{
      log("Action Package updated:", [so, se])
      if (e) log("Error - Action Package update failed:", e)
      callback()
    })
  }
}

module.exports = ACTIONMANAGER
