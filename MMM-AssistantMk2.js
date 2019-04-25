//
// Module : MMM-AssistantMk2
// ver 3
//

Module.register("MMM-AssistantMk2", {
  defaults: {

  },

  getStyles: function () {
    return ["MMM-AssistantMk2.css"]
  },

  getScripts: function() {
    return [
      "modules/MMM-AssistantMk2/components/serialize.js",
      "modules/MMM-AssistantMk2/config/module.config.js"
    ]
  },

  start: function () {
    this.config = Object.assign({}, AMK2_CONFIG, this.config)
    if (!this.config.profiles[this.config.defaultProfile]) {
      console.error("[AMK2] Default profile setting is wrong.")
    } else {
      this.currentProfile = this.config.profiles[this.config.defaultProfile]
    }
    this.resultTimer = null
    this.callbackPool = {}
    this.assistantAvailable = true
    this.responsing = false
    this.sendSocketNotification("INIT", this.config)
  },

  getProfileByName: function(name) {
    if (this.config.profiles.hasOwnProperty(name)) {
      return this.config.profiles[name]
    } else {
      return this.currentProfile
    }
  },

  activate: function(payload) {
    if (!this.assistantAvailable) {
      this.status("ASSISTANT_BUSY")
      return
    }
    this.assistantAvailable = false
    this.sendSocketNotification("ACTIVATE", payload)
  },

  notificationReceived: function(noti, payload, sender) {
    var result = (res, payload) => {
      if (payload && typeof payload.callback == "function") {
        res.payload = payload
        payload.callback(res)
      }
    }

    if (noti == "DOM_OBJECTS_CREATED") {
      this.initScreen()
    }

    /*
    payload: {
      profile: "mydaughter", //REQUIRED
      callback: (error)=>{}
    }
    */
    if (noti == "ASSISTANT_SET_PROFILE") {
      if (payload.profile) {
        if (this.profiles[payload.profile]) {
          this.currentProfile = this.profiles[payload.profile]
          result({success:true}, payload)
        } else {
          result({error:"NO_PROFILE_DEFINED"}, payload)
        }
      } else {
        result({error:"NO_PROFILE_VALUE"}, payload)
      }
    }

    /*
    payload: {
      type: "TEXT", // REQUIRED, TEXT, WAVFILE, MIC, DETECTOR
      key: "music video linkin park crawling", // REQUIRED
      useScreenOutput: true, //OPTIONAL
      useAudioOutput: true, //OPTIONAL
      callback: (result)=>{} //OPTIONAL
      id: null, //OPTIONAL, IF not provided, will be created automatically.
      profileName : //OPTIONAL, If not provided, current profile will be used.
      lang: "en-US", //OPTIONAL
    }
    */
    if (noti == "ASSISTANT_ACTIVATE") {
      this.activate(this.regularize(payload, sender))
    }
  },

  regularize: function (payload, sender) {
    payload.sender = (sender.name) ? sender.name : "unknown"
    if (!payload.id) payload.id = sender.name + "_" + Date.now()
    if ((payload.type == "TEXT" || payload.type == "WAVFILE") && !payload.key) {
      result({error:"INVALID_PAYLOAD"}, payload)
      return false
    }
    payload.useScreenOutput = (payload.useScreenOutput) ? payload.useScreenOutput : this.config.useScreenOutput
    payload.useAudioOutput = (payload.useAudioOutput) ? payload.useAudioOutput : this.config.useAudioOutput
    payload.profile = Object.assign({}, this.getProfileByName(payload.profileName))
    if (typeof payload.callback == "function" && payload.type !== "DETECTOR") {
      this.callbackPool[payload.id] = payload.callback
    }
    return payload
  },

  status: function(ev, payload=null) {
    console.log("[AMK2]", ev)
    var icon = document.getElementById("AMK2")
    switch (ev) {
      case "INIT_AFTER_LOADING":
        icon.className = "waiting"
        break
      case "RESPONSE_START":
        icon.className = "response"
        break
      case "ASSISTANT_READY":
      case "HOTWORD_DETECTOR_END":
        icon.className = "ready"
        break
      case "RESPONSE_AUDIO_START":
        icon.className = "speaking"
        break
      case "RESPONSE_AUDIO_END":
        icon.className = "response"
        break
      case "HOTWORD_DETECTOR_MIC_START":
        icon.className = "hotword_waiting"
        break
      case "HOTWORD_DETECTED":
      case "MIC_START":
        icon.className = "hotword_detected"
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti == "STATUS") this.status(payload.event, payload.payload)
    if (noti == "INITIALIZED") {
      this.activate(this.regularize({type: "DETECTOR"}, this))
    }
    if (noti == "RESULT") {
      this.responseResult(payload)
    }
    if (noti == "DEACTIVATED") {
      this.assistantAvailable = true
      this.activate(this.regularize({type: "DETECTOR"}, this))
    }
  },

  responseResult: function (payload) {
    if (this.waitingContinuous) {
      this.stopContinuousPhase()
    }
    this.assistantAvailable = false
    var win = document.getElementById("AMK2_RESULT_WINDOW")
    var player = document.getElementById("AMK2_RESULT_AUDIOOUTPUT")
    var timerIndicator = document.getElementById("AMK2_RESULT_TIMER_INDICATOR")
    var iframe = document.getElementById("AMK2_RESULT_SCREENOUTPUT")
    var url = (uri) => {
      return "/modules/MMM-AssistantMk2/" + uri + "?seed=" + Date.now()
    }
    var callbackResult = {}
    if (payload.id) {
      var cb = this.callbackPool[payload.id]
      if (typeof cb == "function") {
        cb(payload)
      }
      this.callbackPool[payload.id] = null
      delete this.callbackPool[payload.id]
    }

    this.status("RESPONSE_START")
    if (payload.screenOutput) {
      iframe.src = url(payload.screenOutput.uri)
      iframe.onload = () => {
        win.classList.remove("hidden")
      }
    }
    if (payload.audioOutput) {
      document.getElementById("AMK2_RESULT_AUDIOOUTPUT_SOURCE").src = url(payload.audioOutput.uri)
      player.onplay = () => {
        this.status("RESPONSE_AUDIO_START")
      }
      player.onended = () => {
        this.status("RESPONSE_AUDIO_END")
        this.continuousPhase()
      }
      player.autoplay = true
      player.load()
    } else {
      this.status("RESPONSE_WITHOUT_AUDIO")
      this.continuousPhase()
    }
  },

  continuousPhase: function () {
    var timerIndicator = document.getElementById("AMK2_RESULT_TIMER_INDICATOR")
    this.waitingContinuous = true
    this.assistantAvailable = true
    this.activate(this.regularize({type: "MIC"}, this))
    var duration = this.config.resultTimeout / 1000
    timerIndicator.style.transitionDuration = `${duration}s`
    timerIndicator.style.width = "100%"
    this.resultTimer = setTimeout(()=>{
      this.stopContinuousPhase()
      this.sendSocketNotification("DEACTIVATE")
    }, this.config.resultTimeout)
  },

  stopContinuousPhase: function() {
    var win = document.getElementById("AMK2_RESULT_WINDOW")
    var timerIndicator = document.getElementById("AMK2_RESULT_TIMER_INDICATOR")
    this.status("RESPONSE_CLEAR")
    timerIndicator.style.transitionDuration = "0s"
    timerIndicator.style.width = "0%"
    win.classList.add("hidden")
    clearTimeout(this.resultTimer)
    this.resultTimer = null
    this.waitingContinuous = false
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.id = "AMK2"
    dom.className = "sleeping"
    var statusRing = document.createElement("div")
    statusRing.id = "AMK2_STATUS"
    dom.appendChild(statusRing)
    return dom
  },

  initScreen: function() {
    window.addEventListener("message", (e)=>{
      if (e.data.query) {
        console.log(e.data.query)
        this.sendSocketNotification(
          "ACTIVATE",
          this.regularize({
            type: "TEXT",
            key: e.data.query.queryText,
          }, this)
        )
      }
    }, false)
    var resWindow = document.createElement("div")
    resWindow.id = "AMK2_RESULT_WINDOW"
    resWindow.className = "hidden"
    var iframe = document.createElement("iframe")
    iframe.id = "AMK2_RESULT_SCREENOUTPUT"
    iframe.src = ""
    resWindow.appendChild(iframe)
    var timer = document.createElement("div")
    timer.id = "AMK2_RESULT_TIMER"
    var timerIndicator = document.createElement("div")
    timerIndicator.id = "AMK2_RESULT_TIMER_INDICATOR"
    timer.appendChild(timerIndicator)
    resWindow.appendChild(timer)
    var player = document.createElement("audio")
    player.id = "AMK2_RESULT_AUDIOOUTPUT"
    var source = document.createElement("source")
    source.id = "AMK2_RESULT_AUDIOOUTPUT_SOURCE"
    player.appendChild(source)
    resWindow.appendChild(player)
    document.body.appendChild(resWindow)
  },



  getCommands: function () {
    return [
      {
        command: "q",
        callback: "telegramCommand",
        description: "You can command `AssistantMk2` by text with this command."
      },
      {
        command: "s",
        callback: "telegramCommand",
        description: "You can make `MMM-AssistantMk2` to say some text with this command."
      }
    ]
  },

  telegramCommand: function(command, handler) {
    if (command == "q" && handler.args) {
      handler.reply("TEXT", "AssistantMk2 will be activated")
      this.notificationReceived(this.config.notifications.TEXT_QUERY, handler.args, "MMM-TelegramBot")
    }
    if (command == "s" && handler.args) {
      handler.reply("TEXT", "AssistantMk2 will repeat your text: " + handler.args)
      this.notificationReceived(this.config.notifications.SAY_TEXT, handler.args, "MMM-TelegramBot")
    }
  },
})
