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
    this.config = this.configAssignment({}, this.defaults, this.config)

/* really don't work ... this.default is not set ! back to configAssignment()

    const helperConfig = [
      "debug", "recipes", "customActionConfig", "assistantConfig", "micConfig",
      "responseConfig"
    ]
    this.helperConfig = {}
    if (this.config.debug) log = _log

    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
*/

    this.helperConfig = this.config
    if (this.config.debug) log = _log

    this.setProfile(this.config.defaultProfile)
    this.aliveTimer = null
    this.showingResponse = false
    this.continue = false
    this.notEnd = false
    this.lastQuery = null
    this.session = {}
    this.Tcount = 0
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
    dom.id = "AMK2"
    dom.className = (this.config.showModule) ? "shown" : "hidden"

   //dom.src = "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Google_Assistant_logo.svg/240px-Google_Assistant_logo.svg.png')"

    var dom = document.createElement("div")
    dom.id = "AMK2"
    dom.className = (this.config.showModule) ? "shown" : "hidden"
    var status = document.createElement("div")
    status.id = "AMK2_STATUS"
    dom.appendChild(status)
    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    dom.appendChild(transcription)
    var error = document.createElement("div")
    error.id = "AMK2_ERROR"
	error.innerHTML = "err"
    dom.appendChild(error)
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

	if (this.config.responseConfig.useScreenOutput && this.config.responseConfig.useFullScreenAnswer) this.FullScreen(true)
    }
  },

  FullScreen: function(status) {
	var self = this;
	if (status) {
		// fullscreen on
		log("Fullscreen: " + status)
		MM.getModules().exceptModule(this).enumerate(function(module) {
               		module.hide(15, null, {lockString: self.identifier})
            	});
	}
	else {
		// fullscreen off
		log("Fullscreen: false")
		MM.getModules().exceptModule(this).enumerate(function(module) {
			module.show(1000, null, {lockString: self.identifier})
		});
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
    if (response.error) {
      var err = document.getElementById("AMK2_ERROR")
      err.innerHTML = response.error
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
      log("Error !")
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
    log("Audio response is finished.")
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
	var err = document.getElementById("AMK2_ERROR")
        err.innerHTML = ""
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

	if (this.config.responseConfig.useScreenOutput && this.config.responseConfig.useFullScreenAnswer) this.FullScreen(false)

	// send RESUME notification to Hotword... I'm Ready !
	this.sendNotification("HOTWORD_RESUME")
  }

})
