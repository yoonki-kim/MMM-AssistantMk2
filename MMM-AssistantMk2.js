//
// Module : MMM-AssistantMk2
//

var ytp

Module.register("MMM-AssistantMk2", {
  defaults: {
    verbose:false,
    startChime: "connection.mp3",
    deviceModelId: "", // It should be described in your config.json
    deviceInstanceId: "", // It should be described in your config.json
    deviceLocation: { // (optional)
      coordinates: { // set the latitude and longitude of the device (rf. mygeoposition.com)
        latitude: 51.5033640, // -90.0 - +90.0
        longitude: -0.1276250, // -180.0 - +180.0
      },
    },
    auth: {
      keyFilePath: "./credentials.json"
    },
    defaultProfile: "default",
    profiles: {
      "default" : {
        profileFile: "default.json",
        lang: "en-US"
        //currently available (estimation, not all tested):
        //  de-DE, en-AU, en-CA, en-GB, en-US, en-IN
        // fr-CA, fr-FR, it-IT, ja-JP, es-ES, es-MX, ko-KR, pt-BR
        // https://developers.google.com/assistant/sdk/reference/rpc/languages
      },
      //"kids" : {
      //  profileFile: "jarvis.json",
      //  lang: "de-DE"
      //},
      //"myself_korean" : {
      //  profileFile: "default.json",
      //  lang: "ko-KR"
      //}
    },

    transcriptionHook: {
      //"SCREEN_OFF" : "screen off",
      //"SCREEN_ON" : "screen on",
      //"REBOOT" : "reboot",
      //"SHUTDOWN" : "shut down",
      //"TEST" : "test"
    },
    useScreen: true,  // set this to true if you want to output results to a screen
    //showed contents will be hidden when new conversation starts or interface.stopContentNotification is comming.
    screenZoom: "80%",
    screenDuration: 0, //If you set 0, Screen Output will be closed after Response speech finishes.

    youtubeAutoplay: true,
    alertError: true,

    record: {
      sampleRate    : 16000,      // audio sample rate
      threshold     : 0.5,        // silence threshold (rec only)
      thresholdStart: null,       // silence threshold to start recording, overrides threshold (rec only)
      thresholdEnd  : null,       // silence threshold to end recording, overrides threshold (rec only)
      silence       : 1.0,        // seconds of silence before ending
      verbose       : false,      // log info to the console
      recordProgram : "arecord",  // Defaults to "arecord" - also supports "rec" and "sox"
      device        : null        // recording device (e.g.: "plughw:1")
    },

    mp3PlayCommand : "mpg321 %FILE%", // playing sound(mp3) program. You can use your prefer mp3 player program

    notifications: {
      ASSISTANT_ACTIVATE: "ASSISTANT_ACTIVATE",
      ASSISTANT_DEACTIVATE: "ASSISTANT_CLEAR",
      ASSISTANT_ACTIVATED: "ASSISTANT_ACTIVATED",
      ASSISTANT_DEACTIVATED: "ASSISTANT_DEACTIVATED",
      ASSISTANT_ACTION: "ASSISTANT_ACTION",
      DEFAULT_HOOK_NOTIFICATION: "ASSISTANT_HOOK",
      TEXT_QUERY: "ASSISTANT_QUERY",
    }
  },

  getStyles: function () {
    return ["MMM-AssistantMk2.css"]
  },

  getCommands: function () {
    return [
      {
        command: "q",
        callback: "telegramCommand",
        description: "You can command `AssistantMk2` by text with this command."
      }
    ]
  },

  telegramCommand: function(command, handler) {
    if (command == "q" && handler.args) {
      handler.reply("TEXT", "Transmitted.")
      this.notificationReceived(this.config.notifications.TEXT_QUERY, handler.args, "MMM-TelegramBot")
    }
  },


  start: function () {
    this.sendSocketNotification("INIT", this.config)
    this.currentProfile = this.config.profiles[this.config.defaultProfile]
    this.lastQuery = ""
    this.suggestQuery = ""
    this.status = ""
  },

  getDom : function() {
    var wrapper = document.createElement("div")
    wrapper.className = "sleeping"
    wrapper.id = "ASSISTANT"
    wrapper.onclick = ()=> {
      if (wrapper.className == "sleeping") {
        this.restart(this.currentProfile)
      }
    }
    var micImg = document.createElement("div")
    micImg.id = "ASSISTANT_MIC"

    var message = document.createElement("div")
    message.id = "ASSISTANT_MESSAGE"


    wrapper.appendChild(micImg)
    wrapper.appendChild(message)


    var screenOutput = document.createElement("iframe")
    screenOutput.id = "ASSISTANT_SCREEN"
    wrapper.appendChild(screenOutput)

    var ytOutput = document.createElement("div")
    ytOutput.id = "ASSISTANT_YOUTUBE"
    wrapper.appendChild(ytOutput)

    return wrapper
  },

  showScreen: function() {
    var screen = document.getElementById("ASSISTANT_SCREEN")
    screen.src = this.data.path + "/temp.html"
    setTimeout(()=>{
      screen.className = "show"
    },100)
  },

  hideScreen: function() {
    var screen = document.getElementById("ASSISTANT_SCREEN")
    screen.className = "hide"
  },

  displayStatus: function(mode, text) {
    var wrapper = document.getElementById("ASSISTANT")
    wrapper.className = mode
    var message = document.getElementById("ASSISTANT_MESSAGE")
    message.innerHTML = text
  },

  screenMessage: function(obj) {
    const ytVideoPattern = /youtube\.com\/watch\?v=([a-zA-Z0-9-_]*)$/ig
    if (obj.hasOwnProperty("url")) {
      var re = ytVideoPattern.exec(obj.url.href)
      if (re.length > 0) {
        this.playYoutubeVideo(re[1])
      } else {
        //external link
      }
    }
    if (obj.hasOwnProperty("query")) {
      if(obj.query.queryText) {
        console.log(this.status)
        this.suggestQuery = obj.query.queryText
        if (this.status == "CONVERSATION_END") {
          this.restart(this.currentProfile, this.suggestQuery)
          this.suggestQuery = ""
        }
      }
    }
  },

  playYoutubeVideo: function(id, cb=()=>{}) {
    this.hideResponse(()=>{}, true)
    var onClose = (holder, cb=()=>{}) => {
      holder.style.display = "none"
      holder.innerHTML = ""
      cb()
    }
    var holder = document.getElementById("ASSISTANT_YOUTUBE")
    holder.innerHTML = ""
    holder.style.display = "block"

    var yt = document.createElement("div")
    yt.id = "YOUTUBE_" + id
    holder.appendChild(yt)

    var close = document.createElement("div")
    close.className = "button button_close"
    close.onclick = (e)=>{
      e.stopPropagation()
      ytp.stopVideo()
      onClose(holder, cb)
    }
    holder.appendChild(close)

    ytp = new YT.Player(yt.id, {
      playerVars: {
        "controls": 0,
        "loop": 1,
        "rel": 0,
      },
      events: {
        "onReady": (event)=>{
          event.target.loadVideoById(id)
          event.target.playVideo()
        },
        "onStateChange": (event)=>{
          if (event.data == 0) {
            setTimeout(()=>{
              onClose(holder, cb)
            }, 500)
          }
        },
        "onError": (event)=> {
          console.log("youtube error:", id, event)
        }
      }
    })
  },

  prepareYoutube: function() {
    var tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    var firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      console.log("[AMK2] YouTube iframe API is ready.")
    }
  },

  notificationReceived: function (notification, payload, sender) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        window.addEventListener("message", (e)=>{
          this.screenMessage(e.data)
        }, false)
        this.prepareYoutube()
        break
      case this.config.notifications.ASSISTANT_ACTIVATE:
        var profileKey = ""
        if (payload.profile in this.config.profiles) {
          profileKey = payload.profile
        } else {
          profileKey = this.config.defaultProfile
        }
        this.currentProfile = this.config.profiles[profileKey]
        this.restart(this.currentProfile)
        break
      case this.config.notifications.ASSISTANT_DEACTIVATE:
        this.hideScreen()
        break
      case this.config.notifications.TEXT_QUERY:
        this.restart(this.currentProfile, payload, sender.name)
        break
    }
  },

  restart: function(profile, textQuery=null, sender=null, id=null) {
    this.sendNotification(this.config.notifications.ASSISTANT_ACTIVATED)
    this.sendSocketNotification("START", {profile:profile, textQuery:textQuery, sender:sender, id:id})
  },


  showResponse: function(payload) {
    if (this.config.useScreen && payload.screenOutput) {
      this.showScreen()
    }
    if (!this.config.useScreen && payload.foundTextResponse) {
      this.sendNotification("SHOW_ALERT", {
        title: "MMM-AssistantMk2",
        message: payload.foundTextResponse,
        timer: this.config.screenDuration,
      })
    }
  },

  hideResponse: function(after=()=>{}, force=false) {
    if (this.config.useScreen) {
      if (this.config.screenDuration > 0 && !force) {
        setTimeout(()=>{
          this.hideScreen()
          after()
        }, this.config.screenDuration)
      } else {
        this.hideScreen()
        after()
      }
    } else {
      this.sendNotification("HIDE_ALERT")
      after()
    }
  },

  deactivateAssistant: function() {
    this.displayStatus("sleeping", "")
    this.sendNotification(this.config.notifications.ASSISTANT_DEACTIVATED, null)
  },

  socketNotificationReceived: function (notification, payload) {
    this.status = notification
    switch(notification) {
      case "INITIALIZED":
        //do nothing
        break
      case "STARTED":
        this.displayStatus("waiting", "")
        break
      case "TRANSCRIPTION":
        if(payload.done == true) {
          this.displayStatus("understanding", payload.transcription)
        } else {
          this.displayStatus("listening", payload.transcription)
        }
        break
      case "RESPONSE_START":
        this.showResponse(payload)
        this.lastQuery = payload.finalTranscription
        break
      case "RESPONSE_END":
        //this.hideResponse()
        this.lastQuery = payload.finalTranscription
        break
      case "CONVERSATION_END":
        console.log(payload)
        this.lastQuery = payload.finalTranscription
        if (payload.foundAction) {
          if (payload.foundAction.command !== "action.devices.commands.EXCEPTION") {
            this.sendNotification(this.config.notifications.ASSISTANT_ACTION, payload.foundAction)
          } else {
            var status = JSON.parse(payload.foundAction.params.status)
            this.displayStatus("error", status.description)
          }
        }

        if (payload.error) {
          var message = ""
          if (typeof payload.error == "string") {
            message = payload.error
          } else {
            message = payload.error.toString()
          }
          this.sendNotification("SHOW_ALERT", {
            title : "MMM-AssistantMk2 Error",
            message: message,
            timer:5000,
          })
          console.log("[AMK2] Error:", message)
        }

        if (payload.foundHook.length > 0) {
          this.foundHook(payload.foundHook)
        }

        if (payload.foundVideo || payload.foundVideoList) {
          this.deactivateAssistant()
          if (this.config.youtubeAutoplay) {
            this.playYoutubeVideo(payload.foundVideo)
          }
        } else {
          this.hideResponse(()=>{
            if (payload.continueConversation) {
              this.restart(this.currentProfile)
            } else if (this.suggestQuery) {
              var query = this.suggestQuery
              this.suggestQuery = ""
              console.log("restart:", query)
              this.restart(this.currentProfile, query)
            } else {
              this.deactivateAssistant()
            }
          })
        }
        break
      case "CONVERSATION_ERROR":
        this.displayStatus("error", "CONVERSATION ERROR")
        setTimeout(()=>{
          this.deactivateAssistant()
        }, 3000)
        break
      case "ASSISTANT_READY":
        break
      case "ASSISTANT_ERROR":
        this.displayStatus("error", "CONVERSATION ERROR")
        setTimeout(()=>{
          this.deactivateAssistant()
        }, 3000)
        break
    }
  },

  foundHook : function(foundHook, cb=()=>{}) {
    if (foundHook) {
      for(i in foundHook) {
        var res = foundHook[i]
        var hook = this.config.transcriptionHook[res.key]
        var notification = this.config.notifications.DEFAULT_HOOK_NOTIFICATION
        if (typeof hook.notification !== "undefined" && hook.notification) {
          notification = hook.notification
        }
        var pl = {
          hook:res.key,
          match:res.match
        }
        if (hook.payload) {
          if (typeof hook.payload == "function") {
            pl = hook.payload(pl)
          } else {
            pl = hook.payload
          }
        }
        this.sendNotification(notification, pl)
      }
    }
    cb()
  },
})
