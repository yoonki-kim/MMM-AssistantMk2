/** Module : MMM-AssistantMk2 v3.5 **/

Module.register("MMM-AssistantMk2", {
  defaults: {
    verbose: false,
    startChime: "connection.mp3",
    useWelcomeMessage: "",
    lang: "fr_FR",
    coordinates: {
      latitude: 51.5033640,
      longitude: -0.1276250,
    },
    responseVoice: true,
    responseScreen: true,
    screenZoom: "80%",
    screenDuration: 5000,
    standbyStatic: false,
    record: {
      recorder : "arecord",
      device : null
    },
    play: {
      playProgram: "mpg321",
      playOption: [],
    },
    snowboy: {
      audioGain: 2.0,
      Frontend: true,
      Model: "jarvis",
      Sensitivity: null
    }
  },

  getStyles: function () {
    return ["MMM-AssistantMk2.css"]
  },
  
  getScripts: function() {
    return ["modules/MMM-AssistantMk2/components/AssistantHelper.js"]
  },

  start: function () {
    this.config = this.configAssignment({}, this.defaults, this.config)
    this.sendSocketNotification("INIT", this.config)
    var assistant = new AssistantHelper(this.config)
    assistant.registerHelper("sendNotification" , (noti, payload)=> {
      this.sendNotification(noti, payload)
    })
    assistant.registerHelper("sendSocketNotification" , (noti, payload)=> {
      this.sendSocketNotification(noti, payload)
    })
    this.assistant = assistant
  },

  getDom : function() {
    return this.assistant.drawDom()
  },

  notificationReceived: function (notification, payload) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        this.assistant.initializeAfterLoading(this.config)
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INITIALIZED":
        this.sendSocketNotification("SNOWBOY_START")
        if (this.config.useWelcomeMessage) {
          this.assistant.activate( this.config.useWelcomeMessage )
          this.config.useWelcomeMessage = ""
        }
        break
      case "MIC_ON": //necessary?????
        this.assistant.micStatus(true)
        break
      case "MIC_OFF":
        this.assistant.micStatus(false)
      case "SPEAKER_ON": //necessary?????
        this.assistant.speakerStatus(true)
        break
      case "SPEAKER_OFF":
        this.assistant.speakerStatus(false)
        break
      case "TRANSCRIPTION":
        this.assistant.transcription(payload)
        break
      case "RESPONSE_START":
        this.assistant.responseStart(payload)
        break
      case "RESPONSE_END":
        this.sendNotification("ASSISTANT_RESPONSE_END")
        break
      case "RESPONSING":
        this.assistant.changeStatus("RESPONSING")
        break
      case "CONVERSATION_END":
        this.assistant.conversationEnd(payload)
        break
      case "CONVERSATION_ERROR":
      case "ASSISTANT_ERROR":
        this.assistant.onError(notification)
        break
      case "ASSISTANT_ACTIVATE":
        this.assistant.activate()
        break
    }
  },

  configAssignment : function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (
            typeof result[key] === "object"
            && result[key]
            && Object.prototype.toString.call(result[key]) !== "[object Array]"
          ) {
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
  }
})
