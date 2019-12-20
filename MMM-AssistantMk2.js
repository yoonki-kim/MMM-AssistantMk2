//
// Module : MMM-AssistantMk2
// ver 3
//


var _log = function() {
  var context = "[AMK2]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var log = function() {
  //do nothing
}


Module.register("MMM-AssistantMk2", {
  defaults: {
    //developer: false,
    debug:true,
    //showModule:true,
    assistantConfig: {
      credentialPath: "credentials.json",
      projectId: "",
      modelId: "",
      instanceId: "",
      latitude: 51.508530,
      longitude: -0.076132,
    },
    responseConfig: {
      useScreenOutput: true,
      useAudioOutput: true,
      useChime: true,
      timer: 5000,
      screenOutputCSS: "screen_output.css",
    },
    micConfig: {
      recorder: "sox",
      device: null,
    },
    customActionConfig: {
      autoMakeAction: false,
      autoUpdateAction: false,
      // actionLocale: "en", // multi language action is not supported yet
    },
    recipes: [],
    transcriptionHooks: {},
    actions: {},
    commands: {},
    plugins: {},
    defaultProfile: "default",
    profiles: {
      "default": {
        profileFile: "default.json",
        lang: "en-US"
      }
    },
  },

  plugins: {
    onReady: [],
    onBeforeAudioResponse: [],
    onAfterAudioResponse: [],
    onBeforeScreenResponse: [],
    onAfterScreenResponse: [],
    onBeforeInactivated: [],
    onAfterInactivated: [],
    onBeforeActivated: [],
    onAfterActivated: [],
    onError: [],
    onBeforeNotificationReceived: [],
    onAfterNotificationReceived: [],
    onBeforeSocketNotificationReceived: [],
    onAfterSocketNotificationReceived: [],
  },
  commands: {},
  actions: {},
  transcriptionHooks: {},
  responseHooks: {},

  getStyles: function () {
    return ["MMM-AssistantMk2.css"]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json"
    }
  },

  start: function () {
    const helperConfig = [
      "debug", "recipes", "customActionConfig", "assistantConfig", "micConfig",
      "responseConfig"
    ]
    this.allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    this.helperConfig = {}
    if (this.config.debug) log = _log

    this.config = this.configAssignment({}, this.defaults, this.config)
    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
    this.registerPluginsObject(this.config.plugins)
    this.registerResponseHooksObject(this.config.responseHooks)
    this.registerTranscriptionHooksObject(this.config.transcriptionHooks)
    this.registerCommandsObject(this.config.commands)
    this.registerActionsObject(this.config.actions)
    this.setProfile(this.config.defaultProfile)
    this.session = {}

    var callbacks = {
      assistantActivate: (payload, session)=>{
        this.assistantActivate(payload, session)
      },
      postProcess: (response, callback_done, callback_none)=>{
        this.postProcess(response, callback_done, callback_none)
      },
      endResponse: ()=>{
        this.endResponse()
      },
      sendNotification: (noti, payload=null) => {
        this.sendNotification(noti, payload)
      },
      translate: (text) => {
        return this.translate(text)
      }
    }
    this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], callbacks)
  },

  doPlugin: function(pluginName, args) {
    if (this.plugins.hasOwnProperty(pluginName)) {
      var plugins = this.plugins[pluginName]
      if (Array.isArray(plugins) && plugins.length > 0) {
        for (var i = 0; i < plugins.length; i++) {
          var job = plugins[i]
          this.doCommand(job, args, pluginName)
        }
      }
    }
  },

  registerPluginsObject: function (obj) {
    for (var pop in this.plugins) {
      if (obj.hasOwnProperty(pop)) {
        var candi = []
        if (Array.isArray(obj[pop])) {
          candi = candi.concat(obj[pop])
        } else {
          candi.push(obj[pop].toString())
        }
        for (var i = 0; i < candi.length; i++) {
          this.registerPlugin(pop, candi[i])
        }
      }
    }
  },

  registerPlugin: function (plugin, command) {
    if (this.plugins.hasOwnProperty(plugin)) {
      if (Array.isArray(command)) {
        this.plugins[plugin].concat(command)
      }
      this.plugins[plugin].push(command)
    }
  },

  registerCommandsObject: function (obj) {
    this.commands = Object.assign({}, this.commands, obj)
  },

  registerTranscriptionHooksObject: function (obj) {
    this.transcriptionHooks = Object.assign({}, this.transcriptionHooks, obj)
  },

  registerActionsObject: function (obj) {
    this.actions = Object.assign({}, this.actions, obj)
  },

  registerResponseHooksObject: function (obj) {
    this.responseHooks = Object.assign({}, this.actions, obj)
  },


  t: function(a) {
    log("!!!!!", a)
  },


  configAssignment : function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]" ) {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configAssignment({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else {
            result[key] = item[key]
          }
        }
      }
    }
    return result
  },



  getDom: function() {
    return this.assistantResponse.getDom()
  },

  setProfile: function(profileName) {
    if (this.config.profiles.hasOwnProperty(profileName)) {
      this.profile = profileName
    }
  },



  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onBeforeNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        this.assistantResponse.prepare()
        break
      case "ASSISTANT_PROFILE":
        this.setProfile(payload)
        break
      case "ASSISTANT_ACTIVATE":
        this.doPlugin("onBeforeActivated", payload)
        var session = Date.now()
        payload.secretMode = (payload.secretMode) ? payload.secretMode : false
        this.assistantResponse.setSecret(payload.secretMode)
        if (typeof payload.callback == "function") {
          this.session[session] = {
            callback: payload.callback,
            sender: (sender) ? sender.name : sender,
          }
          delete payload.callback
        }
        this.assistantResponse.playChime("beep")
        this.assistantActivate(payload, session) // logical better to assistantActivate !? (assistantResponse / assistantActivate )
        this.doPlugin("onAfterActivated", payload)
        break

        /*
      case "ASSISTANT_SAY":
        var text = payload
        var magicQuery = "%REPEATWORD% %TEXT%" // initial expression
        var myWord = this.config.responseConfig.myMagicWord ? this.config.responseConfig.myMagicWord : this.translate("REPEAT_WORD") // config word or default ?
        this.sayMode = true
        magicQuery = magicQuery.replace("%REPEATWORD%", myWord) // replace by myWord found
        magicQuery = magicQuery.replace("%TEXT%", text) // finally place the text
        this.fullScreen(true)
        this.assistantActivate({ type: "TEXT", key: magicQuery }, null)
        break
      case "ASSISTANT_QUERY":
        this.fullScreen(true)
        this.assistantActivate({
          type: "TEXT",
          key: payload
        }, null)
        break
        */
       /*
       case "ASSISTANT_DEMO":
         this.demo()
         break
       */
     }
     this.doPlugin("onAfterNotificationReceived", {notification:noti, payload:payload})
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "LOAD_RECIPE":
        this.parseLoadedRecipe(payload)
        break
      case "INITIALIZED":
        log("Initialized.")
        this.assistantResponse.status("standby")
        this.doPlugin("onReady")
        break
      case "ASSISTANT_RESULT":
        if (payload.session && this.session.hasOwnProperty(payload.session)) {
          var session = this.session[payload.session]
          if (typeof session.callback == "function") {
            MM.getModules().enumerate((module) => {
              if (module.name == session.sender) {
                session.callback(Object.assign({}, payload), module)
              }
            })
          }
          delete this.session[payload.session]
        }
        this.assistantResponse.start(payload)
        break
      case "TUNNEL":
        this.assistantResponse.tunnel(payload)
        break
    }
  },

  parseLoadedRecipe: function(payload) {
    //const keywords = ["commands", "transcriptionHooks", "responseHooks", "actions", "plugins"]
    let reviver = (key, value) => {
      if (typeof value === 'string' && value.indexOf('__FUNC__') === 0) {
        value = value.slice(8)
        let functionTemplate = `(${value})`
        return eval(functionTemplate)
      }
      return value
    }
    var p = JSON.parse(payload, reviver)

    if (p.hasOwnProperty("commands")) {
      this.registerCommandsObject(p.commands)
    }
    if (p.hasOwnProperty("actions")) {
      this.registerActionsObject(p.actions)
    }
    if (p.hasOwnProperty("transcriptionHooks")) {
      this.registerTranscriptionHooksObject(p.transcriptionHooks)
    }
    if (p.hasOwnProperty("responseHooks")) {
      this.registerResponseHooksObject(p.responseHooks)
    }
    if (p.hasOwnProperty("plugins")) {
      this.registerPluginsObject(p.plugins)
    }
  },

  suspend: function() {
    log("This module cannot be suspended.")
  },

  resume: function() {
    log("This module cannot be resumed.")
  },

  assistantActivate: function(payload, session) {
    if(!this.continue) this.lastQuery = null
    this.continue = false
    var options = {
      type: "TEXT",
      profile: this.config.profiles[this.profile],
      key: null,
      lang: null,
      useScreenOutput: this.config.responseConfig.useScreenOutput,
      useAudioOutput: this.config.responseConfig.useAudioOutput,
      session: session,
    }
    var options = Object.assign({}, options, payload)
    if (payload.hasOwnProperty("profile") && typeof this.config.profiles[payload.profile] !== "undefined") {
      options.profile = this.config.profiles[payload.profile]
    }
    this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
    this.assistantResponse.status(options.type)

/*
    this.sendSocketNotification("ACTIVATE_ASSISTANT", {
      //type: "TEXT",
      //type: "MIC",
      //type: "WAVEFILE",
      //profile: this.config.profiles[this.profile],
      //key: "What time is it now",
      //key: "/Users/eouia/Documents/nodeJS/MagicMirror/modules/MMM-AssistantMk2/test.wav",
      //lang: "en-US",
      useScreenOutput: true,
      useAudioOutput: false,
    })
*/
  },

  endResponse: function() {
    this.doPlugin("onAfterInactivated")
  },



  postProcess: function (response, callback_done=()=>{}, callback_none=()=>{}) {
    var foundHook = []
    foundHook = this.findAllHooks(response)
    if (foundHook.length > 0) {
      for (var i = 0; i < foundHook.length; i++) {
        var hook = foundHook[i]
        this.doCommand(hook.command, hook.params, hook.from)
        if (i == 0) this.assistantResponse.status("hook")
      }
      callback_done()
    } else {
      callback_none()
    }
  },

  findAllHooks: function(response) {
    var hooks = []
    hooks = hooks.concat(this.findTranscriptionHook(response))
    hooks = hooks.concat(this.findAction(response))
    console.log("Hooks: ", hooks)
    return hooks
  },

  findAction: function (response) {
    var found = []
    var action = response.action
    if (!action.inputs) return []
    for (var i = 0; i < action.inputs.length; i++) {
      var input = action.inputs[i]
      if (input.intent == "action.devices.EXECUTE") {
        var commands = input.payload.commands
        for (var j = 0; j < commands.length; j++) {
          var execution = commands[j].execution
          for (var k = 0; k < execution.length; k++) {
            var exec = execution[k]

            found.push({
              "from":"CUSTOM_DEVICE_ACTION",
              "params":exec.params,
              "command":exec.command
            })

          }
        }
      }
    }
    return found

  },

  findTranscriptionHook: function (response) {
    var foundHook = []
    var transcription = response.transcription.transcription
    for (var k in this.transcriptionHooks) {
      if (!this.transcriptionHooks.hasOwnProperty(k)) continue
      var hook = this.transcriptionHooks[k]
      if (hook.pattern && hook.command) {
        var pattern = new RegExp(hook.pattern, "ig")
        var found = pattern.exec(transcription)
        if (found) {
          foundHook.push({
            "from":k,
            "params":found,
            "command":hook.command
          })
          log("TranscriptionHook matched:", k)
        }
      } else {
        log(`TranscriptionHook:${k} has invalid format`)
        continue
      }
    }
    return foundHook
  },

  doCommand: function (commandId, originalParam, from) {
    console.log("!!", commandId)
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
    } else {
      log(`Command ${commandId} is not found.`)
      return
    }
    var param = (typeof originalParam == "object")
      ? Object.assign({}, originalParam) : originalParam

    if (command.hasOwnProperty("notificationExec")) {
      var ne = command.notificationExec
      if (ne.notification) {
        var fnen = (typeof ne.notification == "function") ?  ne.notification(param, from) : ne.notification
        var nep = (ne.payload) ? ((typeof ne.payload == "function") ?  ne.payload(param, from) : ne.payload) : null
        var fnep = (typeof nep == "object") ? Object.assign({}, nep) : nep
        log (`Command ${commandId} is executed (notificationExec).`)
        this.sendNotification(fnen, fnep)
      }
    }

    if (command.hasOwnProperty("shellExec")) {
      var se = command.shellExec
      if (se.exec) {
        var fs = (typeof se.exec == "function") ? se.exec(param, from) : se.exec
        var so = (se.options) ? ((typeof se.options == "function") ? se.options(param, from) : se.options) : null
        var fo = (typeof so == "function") ? so(param, key) : so
        log (`Command ${commandId} is executed (shellExec).`)
        this.sendSocketNotification("SHELLEXEC", {command:fs, options:fo})
      }
    }

    if (command.hasOwnProperty("moduleExec")) {
      var me = command.moduleExec
      var mo = (typeof me.module == 'function') ? me.module(param, from) : me.module
      var m = (Array.isArray(mo)) ? mo : new Array(mo)
      if (typeof me.exec == "function") {
        MM.getModules().enumerate((mdl)=>{
          if (m.length == 0 || (m.indexOf(mdl.name) >=0)) {
            log (`Command ${commandId} is executed (moduleExec) for :`, mdl.name)
            me.exec(mdl, param, from)
          }
        })
      }
    }

    if (command.hasOwnProperty("functionExec")) {
      var fe = command.functionExec
      if (typeof fe.exec == "function") {
        log (`Command ${commandId} is executed (functionExec)`)
        fe.exec(param, from)
      }
    }

    if (command.hasOwnProperty("soundExec")) {
      var se = command.sound
      if (se.chime && typeof se.chime == 'string') {
        if (se.chime == "open") this.playChime("Google_beep_open")
        if (se.chime == "close") this.playChime("Google_beep_close")
      }
      if (se.say && typeof se.say == 'string' && this.config.responseConfig.myMagicWord) {
        this.notificationReceived("ASSISTANT_SAY", se.say , this.name)
      }
    }
  },




/*
  restart: function() {
    log("Need Restart: Main loop !")
    // unset all var ! Remember
    clearTimeout(this.aliveTimer) // clear timer ?
    this.aliveTimer = null
    this.lastQuery = null
    this.showingResponse = false
    this.session = {}
    this.Tcount = 0
    this.continue = false
    this.notEnd = false
    this.sayMode = false

    // send RESUME notification to Hotword... I'm Ready !

    this.sendNotification("HOTWORD_RESUME")
  },
*/









  // *** Optional TelegramBot Commands ** //
/*
  getCommands: function () {
    return [
      {
        command: "q",
        callback: "telegramCommand",
        description: this.translate("QUERY_HELP")
      },
      {
        command: "s",
        callback: "telegramCommand",
        description: this.translate("SAY_HELP")
      }
    ]
  },

  telegramCommand: function(command, handler) {
    if (command == "q" && handler.args) {
      handler.reply("TEXT", this.translate("QUERY_REPLY"))
      this.notificationReceived("ASSISTANT_QUERY", handler.args, "MMM-TelegramBot")
    }
    if (command == "s" && handler.args) {
      handler.reply("TEXT", this.translate("SAY_REPLY") + handler.args)
      this.notificationReceived("ASSISTANT_SAY", handler.args, "MMM-TelegramBot")
    }
  },
*/
  /** demo for check if icons are ok ... (or for video demo later?) **/
  /*
  demo: function() {
	//this.notificationReceived("ASSISTANT_SAY", "this is a demo with animated icons" , this.name)
    var allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    var myStatus = document.getElementById("AMK2_STATUS")
    for (let [item,value] of Object.entries(allStatus)) {
      if(myStatus.classList.co      this.playChime("beep")ntains(value)) myStatus.classList.remove(value)
    }
    this.fullScreen(true)
    myStatus.classList.add("standby")
    this.displayTranscription("Stand-by icon")
    setTimeout(() => {
	  myStatus.classList.remove("standby")
      myStatus.classList.add("reply")
      this.displayTranscription("Reply icon")
    } , 4000)
    setTimeout(() => {
      myStatus.classList.remove("reply")
      myStatus.classList.add("think")
      this.displayTranscription("Think icon")
    } , 8000)
    setTimeout(() => {
      myStatus.classList.remove("think")
      myStatus.classList.add("listen")
      this.displayTranscription("Listen icon")
    } , 12000)
    setTimeout(() => {
      myStatus.classList.remove("listen")
      myStatus.classList.add("continue")
      this.displayTranscription("Continue Conversation icon")
    } , 16000)
    setTimeout(() => {
      myStatus.classList.remove("continue")
      myStatus.classList.add("confirmation")
      this.displayTranscription("Confirmation icon")
    } , 20000)
    setTimeout(() => {
      myStatus.classList.remove("confirmation")
      myStatus.classList.add("error")
      this.displayTranscription("Error icon")
    } , 24000)
    setTimeout(() => {
      myStatus.classList.remove("error")
      myStatus.classList.add("hook")
      this.displayTranscription("Hook icon")
    } , 28000)
    setTimeout(() => {
      myStatus.classList.remove("hook")
      myStatus.classList.add("standby")
      this.displayTranscription(" ")
      this.fullScreen(false)
    } , 32000)
  },
  */
})


class AssistantResponse {
  constructor (responseConfig, callbacks) {
    this.config = responseConfig
    this.callbacks = callbacks
    this.showing = false
    this.response = null
    this.aliveTimer = null
    this.allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    this.secretMode = false
    this.myStatus = { "actual" : "standby" , "old" : "standby" }
  }

  tunnel (payload) {
    if (payload.type == "TRANSCRIPTION") {
      if (this.secretMode) return
      var startTranscription = false
      if (payload.payload.done) this.status("confirmation")
      if (payload.payload.transcription && !startTranscription) {
        this.showTranscription(payload.payload.transcription)
        startTranscription = true
      }
    }
  }

  setSecret (secretMode) {
    this.secretMode = secretMode
  }

  playChime (sound) {
    if (this.config.useChime) {
      var chime = document.getElementById("AMK2_CHIME")
      chime.src = "modules/MMM-AssistantMk2/resources/" + sound + ".mp3"
    }
  }

  status (status) {
    var Status = document.getElementById("AMK2_STATUS")
    for (let [item,value] of Object.entries(this.allStatus)) {
      if(Status.classList.contains(value)) this.myStatus.old = value
    } // check old status and store it
    this.myStatus.actual = status

    if (status == "WAVEFILE" || status == "TEXT") this.myStatus.actual = "think"
    if (status == "MIC") this.myStatus.actual = (this.myStatus.old == "continue") ? "continue" : "listen"
    if (status == "error" || status == "continue" ) this.playChime(status)

    log("Status from: " + this.myStatus.old + " --> " + this.myStatus.actual)
    Status.classList.remove(this.myStatus.old)
    Status.classList.add(this.myStatus.actual)

    this.callbacks.sendNotification("ASSISTANT_" + this.myStatus.actual.toUpperCase())
    this.myStatus.old = this.myStatus.actual
  }

  prepare () {
    var dom = document.createElement("div")
    dom.id = "AMK2_HELPER"
    dom.classList.add("hidden")

    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    dom.appendChild(transcription)

    var scoutpan = document.createElement("div")
    scoutpan.id = "AMK2_RESULT_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "AMK2_SCREENOUTPUT"
    scoutpan.appendChild(scout)
    dom.appendChild(scoutpan)
    var auoutpan = document.createElement("div")
    var auout = document.createElement("audio")
    auout.id = "AMK2_AUDIO_RESPONSE"
    auout.autoplay = true;
    auout.addEventListener("ended", ()=>{
      console.log("audio end")
      this.end()
    })
    auoutpan.appendChild(auout)
    dom.appendChild(auoutpan)
    document.body.appendChild(dom)
  }

  getDom () {
    var dom = document.createElement("div")
    dom.id = "AMK2"

    var status = document.createElement("div")
    status.id = "AMK2_STATUS"
    dom.appendChild(status)

    /*
    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    dom.appendChild(transcription)
    */
    var chime = document.createElement("audio") // for chime
    chime.id = "AMK2_CHIME"
    chime.autoplay = true;
    dom.appendChild(chime)
    return dom
  }

  showError (text) {
    this.status("error")
    this.showTranscription(text, "error")
  }

  showTranscription (text, className = "transcription") {
    if (this.secretMode) return
    var tr = document.getElementById("AMK2_TRANSCRIPTION")
    tr.innerHTML = ""
    var t = document.createElement("p")
    t.className = className
    t.innerHTML = text
    tr.appendChild(t)
  }

  end () {
    console.log("timer : " + this.config.timer)
    this.showing = false
    if (this.response) {
      var response = this.response
      this.response = null
      if (response && response.continue) {
        this.status("continue")
        log("Continuous Conversation")
        this.callbacks.assistantActivate({
          type: "MIC",
          profile: response.lastQuery.profile,
          key: null,
          lang: response.lastQuery.lang,
          useScreenOutput: response.lastQuery.useScreenOutput,
        }, null)

      } else {
        clearTimeout(this.aliveTimer)
        this.aliveTimer = null
        this.aliveTimer = setTimeout(()=>{
          log("Conversation ends.")
          this.stopResponse(()=>{
            this.status("standby")
            this.callbacks.endResponse()
          })
        }, this.config.timer)
        console.log("The End !? Need restart !")
      }
    } else {
      this.status("standby")
      this.callbacks.endResponse()
    }
  }

  start (response) {
    this.response = response
    if (this.showing) {
      this.end()
    }

    if (response.error) {
      if (response.error == "TRANSCRIPTION_FAILS") {
        log("Transcription Failed. Re-try with text")
        this.callbacks.assistantActivate({
          type: "TEXT",
          profile: response.lastQuery.profile,
          key: response.transcription.transcription,
          lang: response.lastQuery.lang,
          useScreenOutput: response.lastQuery.useScreenOutput,
          session: response.lastQuery.session
        }, null)
        return
      }
      this.showError(this.callbacks.translate(response.error))
      this.end()
      return
    }

    var normalResponse = (response) => {
      this.showing = true
      var so = this.showScreenOutput(response)
      var ao = this.playAudioOutput(response)
      if (ao) {
        this.status("reply")
        log("Wait audio to finish")
      } else {
        log("No response") // Error ?
        this.end()
      }
    }
    this.postProcess(
      response,
      ()=>{ this.end() }, // postProcess done
      ()=>{ normalResponse(response) } // postProcess none
    )
  }

  stopResponse (callback = ()=>{}) {
    this.showing = false
    var winh = document.getElementById("AMK2_HELPER")
    winh.classList.add("hidden")
    var iframe = document.getElementById("AMK2_SCREENOUTPUT")
    iframe.src = "about:blank"
    var audioSrc = document.getElementById("AMK2_AUDIO_RESPONSE")
    audioSrc.src = ""
    var tr = document.getElementById("AMK2_TRANSCRIPTION")
    tr.innerHTML = ""
    callback()
  }

  postProcess (response, callback_done=()=>{}, callback_none=()=>{}) {
    this.callbacks.postProcess(response, callback_done, callback_none)
  }

  playAudioOutput (response) {
    if (this.secretMode) return false
    if (response.audio && this.config.useAudioOutput) {
      this.showing = true
      var audioSrc = document.getElementById("AMK2_AUDIO_RESPONSE")
      audioSrc.src = this.makeUrl(response.audio.uri)
      return true
    }
    return false
  }

  showScreenOutput (response) {
    if (this.secretMode) return false
    if (response.screen && this.config.useScreenOutput) {
      if (!response.audio) {
        this.showTranscription(this.translate("NO_AUDIO_RESPONSE"))
      }
      this.showing = true
      var iframe = document.getElementById("AMK2_SCREENOUTPUT")
      iframe.src = this.makeUrl(response.screen.uri)
      var winh = document.getElementById("AMK2_HELPER")
      winh.classList.remove("hidden")
      return true
    }
    return false
  }

  makeUrl (uri) {
    return "/modules/MMM-AssistantMk2/" + uri + "?seed=" + Date.now()
  }
}
