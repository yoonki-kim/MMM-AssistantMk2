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
    transcriptionHooks: [],
    actions:[],
    commands:[],
    defaultProfile: "default",
    profiles: {
      "default": {
        profileFile: "default.json",
        lang: "en-US"
      }
    },
  },

  start: function () {
    //this.config = this.configAssignment({}, this.defaults, this.config)


    const helperConfig = [
      "debug", "recipes", "customActionConfig", "assistantConfig", "micConfig",
      "responseConfig"
    ]
    this.helperConfig = {}
    if (this.config.debug) log = _log
    for(var i = 0; i < helperConfig.length; i++) {
      if (typeof this.defaults[helperConfig[i]] == "object") {
        this.helperConfig[helperConfig[i]] = Object.assign({}, this.defaults[helperConfig[i]], this.config[helperConfig[i]])
      } else {
        this.helperConfig[helperConfig[i]] = (this.config[helperConfig[i]]) ? this.config[helperConfig[i]] : this.defaults[helperConfig[i]]
      }
    }

    console.log(this.helperConfig)
    //this.helperConfig = this.config
    if (this.config.debug) log = _log
    this.setProfile(this.config.defaultProfile)
    this.aliveTimer = null
    this.showingResponse = false
    this.continue = false
    this.notEnd = false
    this.lastQuery = null
    this.session = {}
    this.Tcount = 0
    this.AError = false
  },

/* // Reserved for potential problem.
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
*/

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
        if (this.config.developer) this.FullScreen(true) // for developing Dom
        this.prepareResponse()
        break
      case "ASSISTANT_PROFILE":
        this.setProfile(payload)
        break
      case "ASSISTANT_ACTIVATE":
        var session = Date.now()
        if (typeof payload.callback == "function") {
          this.session[session] = {
            callback: payload.callback,
            sender: sender.name,
          }
          delete payload.callback
        }
        this.activateAssistant(payload, session)
        if (this.config.showModule && this.config.responseConfig.useFullScreenAnswer) this.FullScreen(true)

        // Activation Chime only on notificationReceived
        if (this.config.responseConfig.useChime) this.playChime("beep")
    }
  },

  FullScreen: function(status) {
  var self = this
  var AMK2 = document.getElementById("AMK2FS")
  if (status) {
  // fullscreen on
  log("Fullscreen: " + status)
  MM.getModules().exceptModule(this).enumerate(function(module) {
                   module.hide(15, null, {lockString: self.identifier})
              });
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
  });
  } , 1000) // timeout set to 1s for fadeout
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
          var tr = document.getElementById("AMK2_TRANSCRIPTION")
          tr.innerHTML = "<p>" + payload.payload.transcription + "</p>"

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
    const keywords = ["commands", "transcriptionHooks"]
    let reviver = (key, value) => {
      if (typeof value === 'string' && value.indexOf('__FUNC__') === 0) {
        value = value.slice(8)
        let functionTemplate = `(${value})`
        return eval(functionTemplate)
      }
      return value
    }
    var p = JSON.parse(payload, reviver)
    for (var i=0; i < keywords.length; i++) {
      var k = keywords[i]
      if (p.hasOwnProperty(k)) {
        this.config[k] = [].concat(this.config[k], p[k])
      }
    }
  },

  suspend: function() {
    log("This module cannot be suspended.")
  },

  resume: function() {
    log("This module cannot be resumed.")
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
        err.innerHTML = "<p>" + this.translate(response.error.message) + "</p>"
        this.AError = true
        this.AMK2Status("error")
      }
    } else {
      this.AMK2Status("reply")
    }

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
  },

/* not needed -> to del ?
  onEndedAudioResponse: function() {
    log("Audio response is finished."
    this.endResponse()
  },
*/

  endResponse: function() {
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
    }
    else {
      if(!this.notEnd && !this.AError) this.AMK2Status("standby")
      clearTimeout(this.aliveTimer)
      this.aliveTimer = null
      this.aliveTimer = setTimeout(()=>{
        if (!this.continue) this.lastQuery = null
        if (!this.notEnd) {
          log("Conversation ends.")
          this.stopResponse()
          this.restart()
        }
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

    // unset all var
    clearTimeout(this.aliveTimer) // clear timer ?
    this.aliveTimer = null
    this.lastQuery = null
    this.showingResponse = false
    this.session = {}
    this.Tcount = 0

    if (this.config.showModule && this.config.responseConfig.useFullScreenAnswer) this.FullScreen(false)

    // send RESUME notification to Hotword... I'm Ready !
    this.sendNotification("HOTWORD_RESUME")
  },

  AMK2Status: function(status) { // live change of AMK2 icons
    var myStatus = document.getElementById("AMK2_STATUS")

    var allStatus = [ "standby", "replay", "error", "think", "continue", "listen", "confirmation" ]
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
      fr: "translations/fr.json",
      en: "translations/en.json"
    }
  },
})
