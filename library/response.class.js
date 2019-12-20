class AssistantResponseClass {
  constructor (responseConfig, callbacks) {
    this.config = responseConfig
    this.callbacks = callbacks
    this.showing = false
    this.response = null
    this.aliveTimer = null
    this.allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    this.secretMode = false
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
    var myStatus = document.getElementById("AMK2_STATUS")
    for (let [item,value] of Object.entries(this.allStatus)) {
      if(myStatus.classList.contains(value)) myStatus.classList.remove(value)
    }
    if (status == "error" || status == "continue") this.playChime(status)
    myStatus.classList.add(status)
    this.callbacks.sendNotification("ASSISTANT_" + status.toUpperCase())
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
    this.showing = false
    if (this.response) {
      var response = this.response
      this.response = null
      if (response && response.continue) {
        log("Continuous Conversation")
        this.callbacks.activateAssistant({
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
        this.callbacks.activateAssistant({
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
        log("Wait audio to finish")
      } else {
        log("No response")
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
