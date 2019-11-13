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
    debug:true,
    autoStart: true,
    useDisplay:true,
    responseTimer:10000,
    assistantConfig: {
      credentialPath: "credentials.json",
      projectId: "",
      modelId: "",
      instanceId: "",
      latitude: 51.508530,
      longitude: -0.076132,
      useScreenOutput:true,
    },
    screenOutputCSS: "screen_output.css",
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
    const helperConfig = [
      "debug", "recipes", "customActionConfig", "assistantConfig", "micConfig",
      "screenOutputCSS"
    ]
    this.helperConfig = {}
    if (this.config.debug) log = _log
    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
    this.config.assistantConfig["micConfig"] = this.config.micConfig
    this.setProfile(this.config.defaultProfile)
    this.responseTimer = null
    this.showingResponse = false
    this.session = {}
  },

  getStyles: function () {
    return ["MMM-AssistantMk2.css"]
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.id = "AMK2"
    dom.className = (this.config.useDisplay) ? "shown" : "hidden"
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
    dom.className = (this.config.useDisplay) ? "shown" : "hidden"
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
      this.onEndedAudioResponse()
    })
    auoutpan.appendChild(auout)
    dom.appendChild(auoutpan)
    document.body.appendChild(dom)
  },

  notificationReceived: function(noti, payload, sender) {
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
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
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "LOAD_RECIPE":
        this.parseLoadedRecipe(payload)
        break
      case "INITIALIZED":
        /*
        if (this.config.onReady && typeof this.config.onReady == "function") {
          this.config.onReady(this)
        }
        */
        break
      case "ASSISTANT_RESULT":
        console.log(payload.session, this.session)

        // this.startResponse 먼저하고. 그런데 조건부로 해야 함.
        // this.startResponse(payload)
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

        break
      case "TUNNEL":
        console.log(payload.type, payload.payload.transcription, payload.payload.done)
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
    var options = {
      type: "TEXT",
      profile: this.config.profiles[this.profile],
      key: null,
      lang: null,
      useScreenOutput: this.config.assistantConfig.useScreenOutput,
      useAudioOutput: true,
      session: session,
    }

    var options = Object.assign({}, options, payload)

    if (payload.hasOwnProperty("profile") && typeof this.config.profiles[payload.profile] !== "undefined") {
      options.profile = this.config.profiles[payload.profile]
    }
    this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
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
    var url = (uri) => {
      return "/modules/MMM-AssistantMk2/" + uri + "?seed=" + Date.now()
    }
    if (response.screen && this.config.useDisplay) {
      this.showingResponse = true
      var iframe = document.getElementById("AMK2_SCREENOUTPUT")
      iframe.src = url(response.screen.uri)
      var winh = document.getElementById("AMK2_HELPER")
      winh.classList.remove("hidden")
    }
    if (response.audio) {
      this.showingResponse = true
      var audioSrc = document.getElementById("AMK2_AUDIO_RESPONSE")
      audioSrc.src = url(response.audio.uri)
    } else {
      this.endResponse()
    }
  },

  onEndedAudioResponse: function() {
    console.log("ended")
    this.endResponse()
  },

  endResponse: function() {
    clearTimeout(this.responseTimer)
    this.responseTimer = null
    this.responseTimer = setTimeout(()=>{
      this.stopResponse()
      this.showingResponse = false
    }, this.config.responseTimer)
  },

  stopResponse:function() {
    var winh = document.getElementById("AMK2_HELPER")
    winh.classList.add("hidden")
    var iframe = document.getElementById("AMK2_SCREENOUTPUT")
    iframe.src = "about:blank"
  }

})
