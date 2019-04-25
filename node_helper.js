//
// Module : MMM-AssistantMk2
//
const path = require("path")
const exec = require("child_process").exec
const fs = require("fs")
const record = require('./components/lpcm16.js')
const eos = require('end-of-stream')
const PassThrough = require('stream').PassThrough;
const serialize = require("./components/serialize.js")
const Assistant = require("./components/googleAssistant.js")
const Snowboy = require("./components/snowboy.js")
const B2W = require("./components/bufferToWav.js")



class Tunnel {
  constructor(module) {
    this.module = module
  }

  transmit(ev, payload=null) {
    this.module.status(ev, payload)
  }
}



var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
    this.mic = null
    this.assistant = null
    this.tunnel = new Tunnel(this)
    this.session = null
  },

  status: function(ev, payload=null) {
    this.sendSocketNotification("STATUS", {
      event: ev,
      payload:payload
    })
    if (ev == "HOTWORD_DIRECT_COMMAND") {
      //console.log("command!", payload)
    } else {
      var time = Date.now()
      if (payload) {
        console.log(`[AMK2:${time}]`, ev, payload)
      } else {
        console.log(`[AMK2:${time}]`, ev)
      }
    }
    switch(ev) {
      case "":
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti == "INIT") {
      this.initializeAfterLoading(payload)
    }

    /*
    payload: {
      type: "TEXT", // REQUIRED
      key: "music video linkin park crawling", // REQUIRED
      useScreenOutput: true, //OPTIONAL
      useAudioOutput: true, //OPTIONAL
      callback: (result)=>{} //OPTIONAL
      id: null, //OPTIONAL, IF not provided, will be created automatically.
      profileName : //OPTIONAL, If not provided, current profile will be used.
    }
    */
    if (noti == "ACTIVATE") {
      switch(payload.type) {
        case "DETECTOR":
          this.activateSN(payload)
          break
        case "MIC":
          this.activateMC(payload)
          break
        case "TEXT":
        case "WAVFILE":
          this.activateGA(payload)
          break
      }
    }

    if (noti == "DEACTIVATE") {
      this.deactivate()
      this.session = null
      setTimeout(()=>{
        this.status("DEACTIVATED")
        this.sendSocketNotification("DEACTIVATED")
      }, 500)
    }
  },

  deactivate: function() {
    record.stop()
  },

  activateMC: function(payload) {
    var size = 0
    this.status("MIC_START")
    var mic = record.start(this.config.mic)
    var counter = new PassThrough()
    var temp = new PassThrough()
    mic.pipe(counter).pipe(temp)
    counter.on("data", (chunk)=>{
      size += chunk.length
    })
    mic.on("end", ()=>{
      this.status("MIC_STOP")
      //this.deactivate()
      if (size >= 50) {
        this.status("MIC_RECORDING_ENOUGH", size)
        var filePath = path.resolve(__dirname, "tmp", "lastQuery.wav")
        var file = fs.createWriteStream(filePath, { encoding: 'binary' })
        temp.pipe(file)
        eos(file, (err) => {
          this.status("EOS")
          if (err) {
            this.status("MIC_RECORDING_ERROR", err)
            this.sendSocketNotification("TURN_OVER")
          } else {
            payload.type = "WAVFILE"
            payload.key = filePath
            this.activateGA(payload)
          }
        })
      } else {
        this.status("MIC_TOO_SHORT_RECORDING", size)
        this.sendSocketNotification("TURN_OVER")
      }
    })
  },

  activateSN: function(payload) {
    var detector = new Snowboy(this.tunnel, this.config, (hotword, queryFile)=>{
      detector.stop()
      payload.type = "WAVFILE"
      payload.key = queryFile
      if (hotword.profile) payload.profile = hotword.profile
      this.activateGA(payload)
    })
    detector.addTunnel(this.tunnel)
    detector.start()
  },

  activateGA: function(payload) {
    this.assistant = new Assistant(this.tunnel, this.config)
    this.assistant.activate(payload, (result)=>{
      if (result.screenOutput) {
        this.getInfo(result)
        delete result.screenOutput.content
      }
      this.sendSocketNotification("RESULT", result)
    })
  },

  getInfo: function(result) {
    var html = result.screenOutput.content
    var links = /data-url=\"([^\"]+)\"/gmi
    var r = null

    var isch = /tbm=isch\&amp;q=([^<]+)/i
    r = isch.exec(html)
    if (r) result.screenOutput.isch = r[1]
    var youtube = /http[^ ]+youtube\.com([^ ]+)/i
    r = youtube.exec(html)
    if (r) result.screenOutput.youtube = r[1]
    var res = []
    while ((r = links.exec(html)) !== null) {
      res.push(r[1])
    }
    result.screenOutput.links = res
    var inlinks = /\( [^ ]+ - (http[^ ]+) \)/i
    r = inlinks.exec(html)
    if (r) result.screenOutput.links.push(r[1])
  },

  initializeAfterLoading: function(config) {
    this.config = config
    this.config.modulePath = __dirname
    this.assistant = null
    this.loadRecipes(()=>{
      this.status("INIT_AFTER_LOADING")
      this.sendSocketNotification("INITIALIZED")
    })
  },

  loadRecipes: function(callback=()=>{}) {
    var recipes = this.config.recipes
    for (var i = 0; i < recipes.length; i++) {
      var p = require("./recipes/" + recipes[i]).recipe
      if (p.transcriptionHook) this.config.transcriptionHook = Object.assign({}, this.config.transcriptionHook, p.transcriptionHook)
      if (p.action) this.config.action = Object.assign({}, this.config.action, p.action)
      if (p.command) this.config.command = Object.assign({}, this.config.command, p.command)
      this.status("RECIPE_LOAD", recipes[i])
      this.sendSocketNotification("LOAD_RECIPE", serialize.serialize(p))
    }
    if (Object.keys(this.config.action).length > 1) {
      this.makeAction(this.config.action, callback)
    } else {
      callback()
    }
  },

  makeAction: function(actions, callback=()=>{}) {
    if (!this.config.autoMakeAction) {
      callback()
      return
    }
    this.status("MAKE_ACTION_PACKAGE")
    var template = {
      manifest: {
        displayName: "MIRROR CUSTOM DEVICE ACTION",
        invocationName : "MIRROR CUSTOM DEVICE ACTION",
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
    fs.writeFile(path.resolve(__dirname, "tmp/action_package.json"), jsonTxt, "utf8", (err)=>{
      if (err) {
        this.status("ACTION_PACKAGE_JSON_FILE_CREATE_ERROR", err)
        callabck()
      } else {
        this.gactionCLI(callback)
      }
    })
  },

  gactionCLI: function(callback=()=>{}) {
    if (!this.config.autoRefreshAction) {
      callback()
      return
    }
    var actionFile = path.resolve(__dirname, "tmp/action_package.json")
    var cdPath = path.resolve(__dirname, "utility/gaction_cli")
    var cmd = `cd ${cdPath}; ./gactions test --action_package ${actionFile} --project ${this.config.projectId}`
    exec(cmd, (e, so, se)=>{
      this.status("ACTION_PACKAGE_UPDATE", [so, se])
      if (e) this.status("ACTION_PACKAGE_UPDATE_ERROR", e)
      callback()
    })
  },
})
