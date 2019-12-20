class AssistantResponseClass {
  constructor (responseConfig, callbacks) {
    this.config = responseConfig
    this.callbacks = callbacks
    this.showing = false
    this.response = null
    this.aliveTimer = null
    this.displayTimer = null
    this.allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    this.secretMode = false
    this.hookChimed = false
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

  doCommand (commandName, param, from) {
    // do nothing currently.
  }

  setSecret (secretMode) {
    this.secretMode = secretMode
  }

  playChime (sound) {
    if (this.config.useChime) {
      if (sound == "open") sound = "Google_beep_open"
      if (sound == "close") sound = "Google_beep_close"
      var chime = document.getElementById("AMK2_CHIME")
      chime.src = "modules/MMM-AssistantMk2/resources/" + sound + ".mp3"
    }
  }

  status (status, beep) {
    var Status = document.getElementById("AMK2_STATUS")
    for (let [item,value] of Object.entries(this.allStatus)) {
      if(Status.classList.contains(value)) this.myStatus.old = value
    } // check old status and store it
    this.myStatus.actual = status

    if (beep && this.myStatus.old != "continue") this.playChime("beep")
    if (status == "error" || status == "continue" ) this.playChime(status)
    
    if (status == "WAVEFILE" || status == "TEXT") this.myStatus.actual = "think"
    if (status == "MIC") this.myStatus.actual = (this.myStatus.old == "continue") ? "continue" : "listen"
    

    log("Status from " + this.myStatus.old + " to " + this.myStatus.actual)
    Status.classList.remove(this.myStatus.old)
    Status.classList.add(this.myStatus.actual)

    this.callbacks.sendNotification("ASSISTANT_" + this.myStatus.actual.toUpperCase())
    this.myStatus.old = this.myStatus.actual
  }

  prepare () {
    var dom = document.createElement("div")
    dom.id = "AMK2_HELPER"
    dom.classList.add("hidden")
/*
    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    dom.appendChild(transcription)
*/
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
    dom.className = "hidden"

    var status = document.createElement("div")
    status.id = "AMK2_STATUS"
    dom.appendChild(status)

    var transcription = document.createElement("div")
    transcription.id = "AMK2_TRANSCRIPTION"
    dom.appendChild(transcription)

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
        // assistant available after audio end, don't wait :)
        log("Conversation ends.")
        this.callbacks.endResponse()
        this.status("standby")
        this.restart()
        
        clearTimeout(this.aliveTimer)
        this.aliveTimer = null
        this.aliveTimer = setTimeout(()=>{
          // just wait timer for display response delay
          this.stopResponse(()=>{
            this.fullscreen(false, this.myStatus)
          })
        }, this.config.timer)
      }
    } else {
      this.status("standby")
      this.restart()
      this.callbacks.endResponse()
    }
  }

  start (response) {
    this.hookChimed = false
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
      ()=>{
        // console.log("callback done with continue -- status : " + response.continue)
        // callback done with continue -- status : true
        response.continue = false // Issue: force to be false
        this.end()
      }, // postProcess done
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
  restart () {
    log("Need Restart: Main loop !")
    this.callbacks.sendNotification("HOTWORD_RESUME")
  }

  fullscreen (active, status) {
    var self = this
    var AMK2 = document.getElementById("AMK2")
    clearTimeout(this.displayTimer)
    this.displayTimer = null
    if (active) {
      // fullscreen on
      log("Fullscreen: " + active)
      MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate(function(module) {
        module.hide(15, {lockString: self.identifier})
      })
      AMK2.classList.remove("hidden")
      AMK2.classList = "in"
    } else {
      log("Fullscreen: false and status: " + status.actual)
      if (status.actual == "standby") { // only on standby mode
        AMK2.classList.remove("in")
        AMK2.classList = "out"
        console.log ("remove: " + status.actual)
        this.displayTimer = setTimeout (() => {
          if (status.actual == "standby") { // check again for hidden
            MM.getModules().exceptWithClass("MMM-AssistantMk2").enumerate(function(module) {
              module.show(1000, {lockString: self.identifier})
              AMK2.classList.add("hidden")
              console.log("hidden: " + status.actual)
            })
          }
        }, 1000) // timeout set to 1s for fadeout
      }
    }
  }
}

