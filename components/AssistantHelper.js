/** AssistantHelper -- MMM-AssistantMk2 v3.5 **/

class AssistantHelper {
  constructor(config) {
    this.config = config
    this.helper = {}
    this.events = {}
    this.locked = false
    this.subdom = {
      mic: null,
      message: null,
      screen: null,
      wrapper: null
    }
    this.dom = this.prepareDom()
    this.status = "STANDBY" //STANDBY, READY, UNDERSTANDING, RESPONSING,
    this.nextQuery = ""
    this.screenTimer = null
    this.idleTimer = null
    this.quietRequest = false
    console.log("[AMk2] AssistantHelper Initialized !")
  }

  registerHelper(name, cb) {
    this.helper[name] = cb
  }

  log (text) {
    if(this.config.verbose) {
      console.log("[AMK2] ", text)
    }
  }

  configure(config) {
    this.config = config
  }

  initializeAfterLoading() {
    window.addEventListener("message", (e)=>{
      this.screenMessage(e.data)
    }, false)
  }

  prepareDom() {
    var wrapper = document.createElement("div")
    wrapper.id = "ASSISTANT"
    wrapper.className = "STANDBY"

    var micImg = document.createElement("div")
    micImg.id = "ASSISTANT_MIC"
    if (this.config.standbyStatic) micImg.className = "static"

    micImg.onclick = (e)=> {
      e.stopPropagation()
      this.activate()
    }

    wrapper.appendChild(micImg)

    var message = document.createElement("div")
    message.id = "ASSISTANT_MESSAGE"
    wrapper.appendChild(message)

    var screenOutput = document.createElement("iframe")
    screenOutput.id = "ASSISTANT_SCREEN"
    wrapper.appendChild(screenOutput)

    this.subdom.mic = micImg
    this.subdom.message = message
    this.subdom.screen = screenOutput
    this.subdom.wrapper = wrapper

    return wrapper
  }

  on(eventName, callback=()=>{}) {
    this.events[eventName] = callback
  }

  off(eventName) {
    if (this.events.hasOwnProperty(eventName)) {
      delete this.events[eventName]
    }
  }

  emit(eventName, payload) {
    if (this.events.hasOwnProperty(eventName)) {
      var fn = this.events[eventName]
      if (typeof fn == "function") {
        fn(payload)
      }
    }
  }

  transcription(payload) {
    if (this.quietRequest) {
      return
    }
    if (payload.done) this.changeStatus("UNDERSTANDING")
    this.subdom.message.innerHTML = "<p>" + payload.transcription + "</p>"
  }

  changeStatus(key) {
    if (key) {
      this.status = key
      this.subdom.wrapper.className = key
    }
    this.sendNotification("ASSISTANT_" + key)

    if (key == "STANDBY") {
      this.subdom.mic.className = ""
      if(this.config.standbyStatic) this.subdom.mic.className = "static"
    }
  }

  getStatus() {
    return this.status
  }

  isLocked() {
    return this.locked
  }

  drawDom() {
    return this.dom
  }

  sendSocketNotification(noti, payload) {
    this.helper["sendSocketNotification"](noti, payload)
  }

  sendNotification(noti, payload) {
    this.helper["sendNotification"](noti, payload)
  }

  onError(error) {
    this.changeStatus("ERROR")
    this.subdom.message.innerHTML = "<p>" + error + "</p>"
    setTimeout(()=>{
      this.clearResponse()
      this.deactivate()
    }, 3000)
  }

  activate(textQuery=null, id=null) {
    if (this.status == "STANDBY" || this.status == "UNDERSTANDING" || this.status == "RESPONSING") {
      this.clearResponse()
      this.sendSocketNotification("SNOWBOY_STOP")
      this.changeStatus("READY")
      this.sendSocketNotification("START", {textQuery:textQuery, id:id})
      return true
    } else {
      this.log("Assistant is busy.")
      return false
    }
  }

  deactivate(cb=()=>{}) {
    this.changeStatus("STANDBY")
    this.sendSocketNotification("SNOWBOY_START")
    this.quietRequest = false
    cb()
  }

  clearResponse() {
    this.subdom.message.innerHTML = ""
  }

  micStatus(bool) {
    this.subdom.mic.className = (bool) ? "MIC" : ""
  }

  speakerStatus(bool) {
    this.subdom.mic.className = (bool) ? "SPEAKER" : ""
  }

  responseStart(payload) {
    if (this.quietRequest) {
      return
    }
    if (this.config.responseScreen && payload.screenOutput) {
      this.subdom.screen.src = "/modules/MMM-AssistantMk2/tmp/temp.html"
      clearTimeout(this.screenTimer)
      setTimeout(()=>{
        this.subdom.screen.className = "show"
      },10)
    }
  }

  responseEnd(after=()=>{}, force=false) {
    if (this.config.responseScreen) {
      if (this.config.screenDuration > 0 && !force) {
        this.screenTimer = setTimeout(()=>{
          this.subdom.screen.className = "hide"
          this.subdom.screen.src = ""
          after()
        }, this.config.screenDuration)
      } else {
        this.subdom.screen.className = "hide"
        after()
      }
    } else {
      after()
    }
  }

  foundError(error) {
    if (error) {
      var message = ""
      if (typeof error == "string") {
        message = error
      } else {
        message = error.toString()
      }
      this.log("Error:" + message)
    }
  }

  conversationEnd(payload) {
    this.foundError(payload.error)
    var thenAfter
    if(payload.continueConversation) {
      thenAfter = ()=> {this.activate()}
      this.responseEnd(thenAfter, true)

    } else {
      thenAfter = () => {
        this.clearResponse()
        this.deactivate()
      }
      this.responseEnd(thenAfter)
    }
  }

  screenMessage(obj) {
    if (obj.hasOwnProperty("query")) {
      if(obj.query.queryText) {
        this.deactivate(()=>{
          this.activate(obj.query.queryText)
        })
      }
    }
  }
}
