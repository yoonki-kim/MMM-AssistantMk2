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
    developer: false,
    debug:true,
    showModule:true,
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
      useFullScreenAnswer: true,
      useChime: true,
      reactiveTimer: 5000,
      screenOutputCSS: "screen_output.css",
      myMagicWord: false, // defined word with IFTTT magicword to REAL text to speech or false
    },
    micConfig: {
      recorder: "sox",
      device: null,
    },
    customActionConfig: {
      autoMakeAction: false,
      actionLocale: "en-US",
      autoRefreshAction: false,
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
    onActivated: [], // not yet located
    onBeforeAudioResponse: [],
    onAfterAudioResponse: [],
    onBeforeScreenResponse: [],
    onAfterScreenResponse: [],
    onInactivated: [],
    onError: [],
    onNotificationReceived: [],
    onSocketNotificationReceived: [],
  },
  commands: {},
  actions: {},
  transcriptionHooks: {},
  responseHooks: {},

  start: function () {
    const helperConfig = [
      "debug", "recipes", "customActionConfig", "assistantConfig", "micConfig",
      "responseConfig"
    ]
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
    this.aliveTimer = null
    this.showingResponse = false
    this.continue = false // for continue conversation condition
    this.notEnd = false // Real Continue conversation Google Flag (Bugsounet)
    this.lastQuery = null
    this.session = {}
    this.Tcount = 0 // "Letter" Transcription count
    this.AError = false // Assistant Error Flag
    this.sayMode = false // ASSISTANT_SAY Flag
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

  getStyles: function () {
    return ["MMM-AssistantMk2.css"]
  },

  getDom: function() {
    var dom = document.createElement("div")
    if (this.config.showModule && this.config.responseConfig.useFullScreenAnswer) {
      dom.id = "AMK2FS"
      dom.className = "hidden"
    } else {
      dom.id = "AMK2"
      dom.className = (this.config.showModule) ? "shown" : "hidden"
    }

    var status = document.createElement("div")
    status.id = "AMK2_STATUS"
    dom.appendChild(status)

    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    if (this.config.showModule && !this.config.responseConfig.useFullScreenAnswer) transcription.className = "hidden"
    dom.appendChild(transcription)

    var chime = document.createElement("audio") // for chime
    chime.id = "AMK2_CHIME"
    chime.autoplay = true;
    dom.appendChild(chime)
    return dom
  },

  setProfile: function(profileName) {
    if (this.config.profiles.hasOwnProperty(profileName)) {
      this.profile = profileName
    }
  },

  prepareResponse: function() {
    var dom = document.createElement("div")
    dom.id = "AMK2_HELPER"
    dom.className = "shown"
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
      this.endResponse()
    })
    auoutpan.appendChild(auout)
    dom.appendChild(auoutpan)
    document.body.appendChild(dom)
  },

  notificationReceived: function(noti, payload, sender) {
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        //if (this.config.developer) this.fullScreen(true) // for developing Dom
        this.prepareResponse()
        break
      case "ASSISTANT_PROFILE":
        this.setProfile(payload)
        break
      case "ASSISTANT_ACTIVATE":
        this.doPlugin("onActivated", payload)
        var session = Date.now()
        if (typeof payload.callback == "function") {
          this.session[session] = {
            callback: payload.callback,
            sender: sender.name,
          }
          delete payload.callback
        }
        this.activateAssistant(payload, session)
        this.fullScreen(true)
        // Activation Chime only on notificationReceived
        if (this.config.responseConfig.useChime) this.playChime("beep")
        break
      case "ASSISTANT_SAY":
        var text = payload
        var magicQuery = "%REPEATWORD% %TEXT%" // initial expression
        var myWord = this.config.responseConfig.myMagicWord ? this.config.responseConfig.myMagicWord : this.translate("REPEAT_WORD") // config word or default ?
        this.sayMode = true
        magicQuery = magicQuery.replace("%REPEATWORD%", myWord) // replace by myWord found
        magicQuery = magicQuery.replace("%TEXT%", text) // finally place the text
        this.fullScreen(true)
        this.activateAssistant({ type: "TEXT", key: magicQuery }, null)
        break
      case "ASSISTANT_QUERY":
        this.fullScreen(true)
        this.activateAssistant({
          type: "TEXT",
          key: payload
        }, null)
        break
     }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "LOAD_RECIPE":
        this.parseLoadedRecipe(payload)
        break
      case "INITIALIZED":
        log("Initialized.")
        /*
        if (this.config.onReady && typeof this.config.onReady == "function") {
          this.config.onReady(this)
        }
        */
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
        } else {
          this.startResponse(payload)
        }
        break
      case "TUNNEL":
        console.log(payload.type, payload.payload.transcription, payload.payload.done)
        if (payload.payload.done) this.AMK2Status("confirmation")
        if (payload.payload.transcription) {
          this.displayTranscription(payload.payload.transcription)

          // temp -> for continue conversation -> hide when transcription
          if(this.notEnd && this.Tcount == 0) { // run it one time
            var winh = document.getElementById("AMK2_HELPER")
            winh.classList.add("hidden")
            var iframe = document.getElementById("AMK2_SCREENOUTPUT")
            iframe.src = "about:blank" // and unset
          }
          this.Tcount += 1
        }
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
    console.log("[AMK2] This module cannot be suspended.")
  },

  resume: function() {
    console.log("[AMK2] This module cannot be resumed.")
  },

  activateAssistant: function(payload, session) {
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
    this.myActivateStatus(options.type)

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

  startResponse: function(response) {
    if (this.showingResponse) {
      this.endResponse()
    }
    this.continue = response.continue
    this.notEnd = response.continue // needed !
    this.lastQuery = response.lastQuery
    var err = document.getElementById("AMK2_TRANSCRIPTION")
    if (response.error == "TOO_SHORT" && this.notEnd) { // conversation continue when err too_short
      err.innerHTML = "<p>" + this.translate("TOO_SHORT_CONTINUE") + "</p>"
      this.endResponse()
      return
    }
    if (response.error) {
      if (
        response.transcription && typeof response.transcription == "object"
        && response.transcription.transcription && !response.transcription.done
      ) {
        log("Transcription Failed. Re-try with text")
        this.activateAssistant({
          type: "TEXT",
          profile: response.lastQuery.profile,
          key: response.transcription.transcription,
          lang: response.lastQuery.lang,
          useScreenOutput: response.lastQuery.useScreenOutput,
          session: response.lastQuery.session
        }, null)
        return
      } else {
        err.innerHTML = "<p>" + this.translate(response.error) + "</p>"
        this.AError = true
        this.AMK2Status("error")
      }
    } else {
      this.AMK2Status("reply")
    }

    var normalResponse = () => {
      var url = (uri) => {
        return "/modules/MMM-AssistantMk2/" + uri + "?seed=" + Date.now()
      }
      if (response.screen && this.config.responseConfig.useScreenOutput) {
        this.showingResponse = true
        var iframe = document.getElementById("AMK2_SCREENOUTPUT")
        iframe.src = url(response.screen.uri)
        var winh = document.getElementById("AMK2_HELPER")
        winh.classList.remove("hidden")
      }
      if (response.audio && this.config.responseConfig.useAudioOutput) {
        this.showingResponse = true
        var audioSrc = document.getElementById("AMK2_AUDIO_RESPONSE")
        audioSrc.src = url(response.audio.uri)
      } else {
        log("Error: No Audio !")
        this.endResponse()
      }
    }

    if (this.AError) {
      normalResponse()
    } else {
      this.postProcess(response, ()=>{
        normalResponse()
      })
    }
  },

  postProcess: function (response, callback=()=>{}) {
    var postProcessed = false
    var foundHook = []
    foundHook = this.findTranscriptionHook(response)
    if (foundHook.length > 0) {
      for (var i = 0; i < foundHook.length; i++) {
        if (i == 0) this.AMK2Status("hook") // Just display one time hook icon
        var hook = foundHook[i]
        this.doCommand(hook.hook.command, hook.match, hook.id)
        postProcessed = true
      }
    }

    console.log("!!!!")
    if (this.config.developer || postProcessed) {
      if (this.config.developer) console.log('/!\\ Simulation foundHook ACTIVED')
      // ? How to close transcription part? If postP (eouia)
      // what do you mean by this ? (Bugsounet)
      // close : by blank ? full hidding ? by pass response ?
      // can you be more clear about what do you want to to :)
      // ------------------------------
      // for me process is foundhook :
      // -> speak -> google -> response -> analyse foundhook :
      // *** if found hook :
      // ** I would have to let the voice command message on the screen. (visual confirmation)
      //    Or in transcription p class : display found hook (the one defined in the configuration)
      // ** by pass normal response
      // ** execute foundhook
      // ** Google beep wand executed
      // ** "normal close" Assistant
      // -------------
      // my approach in foundhook : (test ok  by-passed by this.config.developer)

      log("Found hook")
      this.endHook("Google_beep_open")
    } else {
      callback()
    }
  },

  endHook: function (sound) {
    this.continue = false
    this.notEnd = false // if a conversation continues in progress : by-pass it
    this.playChime(sound)
    this.endResponse()
  },

  closeTranscription: function () {
    var winh = document.getElementById("AMK2FS")
    winh.classList.add("hidden")
  },

  findTranscriptionHook: function (response) {
    var foundHook = []
    var transcription = response.transcription
    for (var k in this.transcriptionHooks) {
      if (!this.transcriptionHooks.hasOwnProperty(k)) continue
      var hook = this.transcriptionHooks[k]
      if (hook.pattern && hook.command) {
        var pattern = new RegExp(hook.pattern, "ig")
        var found = pattern.exec(transcription)
        if (found !== null) {
          foundHook.push({"id":k, "match":found, "hook":hook})
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
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
    } else {
      return
    }
    var param = (typeof originalParam == "object") ? Object.assign({}, originalParam) : originalParam

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
  },

  endResponse: function() {
    //this.closeTranscription() -> better to use fullscreen(false) but it close helper screen too
    this.Tcount = 0 // Response end -> reset Tcount
    if (this.continue) {
      log("Continuous Conversation")
      this.activateAssistant({
        type: "MIC",
        profile: this.lastQuery.profile,
        key: null,
        lang: this.lastQuery.lang,
        useScreenOutput: this.lastQuery.useScreenOutput,
      }, null)
    } else {
      if(!this.notEnd && !this.AError) this.AMK2Status("standby")
      clearTimeout(this.aliveTimer)
      this.aliveTimer = null
      this.aliveTimer = setTimeout(()=>{

        if (!this.continue) this.lastQuery = null
        if (!this.notEnd) {
          this.stopResponse()
          this.fullScreen(false)
          this.restart()
        }

        log("Conversation ends.")
        this.doPlugin("onInactivated")
      },  this.config.responseConfig.reactiveTimer)
    }
  },

  stopResponse:function() {
    this.showingResponse = false
    var winh = document.getElementById("AMK2_HELPER")
    winh.classList.add("hidden")
    var iframe = document.getElementById("AMK2_SCREENOUTPUT")
    iframe.src = "about:blank"
    var audioSrc = document.getElementById("AMK2_AUDIO_RESPONSE")
      audioSrc.src = ""
      var tr = document.getElementById("AMK2_TRANSCRIPTION")
      tr.innerHTML = ""
    },

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

  AMK2Status: function(status) { // live change of AMK2 icons
    var myStatus = document.getElementById("AMK2_STATUS")

    var allStatus = [ "standby", "replay", "error", "think", "continue", "listen", "confirmation", "hook" ]
    for (let [item,value] of Object.entries(allStatus)) {
      if(myStatus.classList.contains(value)) myStatus.classList.remove(value)
    }

    if (this.config.developer) log("Status : " + status)

    /*** Chime ***/
    if (status == "error") this.playChime("error")
    if (status == "continue") this.playChime("continue")
    /*** End Chime ***/

    // if no Assistant Error, take place to the new one

    if (this.AError) {
      myStatus.classList.add("error")
      setTimeout(() => {
        this.AError = false
        this.AMK2Status("standby")
      } , this.config.responseConfig.reactiveTimer )
    } else {
      myStatus.classList.add(status)
      this.sendMyStatus(status) // send status to other module
    }
  },

  fullScreen: function(status) {
    if (this.config.showModule && this.config.responseConfig.useFullScreenAnswer) {
      var self = this
      var AMK2 = document.getElementById("AMK2FS")
      if (status) {
        // fullscreen on
        log("Fullscreen: " + status)
        MM.getModules().exceptModule(this).enumerate(function(module) {
          module.hide(15, null, {lockString: self.identifier})
        })
        AMK2.classList.remove("hidden")
        AMK2.classList = "in"
      }
      else {
        log("Fullscreen: false")
        AMK2.classList.remove("in")
        AMK2.classList = "out"
        setTimeout (() => {
          AMK2.classList.add("hidden")
          MM.getModules().exceptModule(this).enumerate(function(module) {
            module.show(1000, null, {lockString: self.identifier})
          })
        }, 1000) // timeout set to 1s for fadeout
      }
    }
  },

  myActivateStatus: function(payload) { // set status by type
    if (payload == "WAVEFILE" || payload == "TEXT") this.AMK2Status("think")
    if (payload == "MIC") {
      if (this.notEnd) {
        this.AMK2Status("continue")
      } else {
        this.AMK2Status("listen")
      }
    }
  },

  sendMyStatus: function (payload) { // send to other module
    var status = payload.toUpperCase()
    this.sendNotification("ASSISTANT_" + status)
  },

  playChime: function (sound) {
    if (this.config.responseConfig.useChime) {
      var chime = document.getElementById("AMK2_CHIME")
      chime.src = "modules/MMM-AssistantMk2/resources/" + sound + ".mp3"
    }
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json"
    }
  },

  displayTranscription: function(text) {
	if (!this.sayMode) {
	  var tr = document.getElementById("AMK2_TRANSCRIPTION")
      tr.innerHTML = "<p>" + text + "</p>"
    }
  },

  // *** Optional TelegramBot Commands ** //

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
})
