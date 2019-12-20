class AssistantResponse extends AssistantResponseClass{
  constructor (responseConfig, callbacks) {
    super(responseConfig, callbacks)
    this.hookChimed = false
  }

  start (response) {
    super(response)
    this.hookChimed = false
  }

  doCommand (commandName, param, from) {
    if (!this.hookChimed) {
      this.hookChimed = true
      this.playChime("...")
    }
    super(commandName, param, from)
  }


//You can implement these methods by your needs.
/*
  tunnel (payload) {
    super(payload)
  }

  doCommand (commandName, param, from) {
    super (commandName, param, from)
  }

  setSecret (secretMode) {
    super(secretMode)
  }

  playChime (sound) {
    super(sound)
  }

  status (status) {
    super(status)
  }

  prepare () {
    super()
  }

  getDom () {
    return super()
  }

  showError (text) {
    super(text)
  }

  showTranscription (text, className = "transcription") {
    super(text, className)
  }

  end () {
    super()
  }

  start (response) {
    super(response)
  }

  stopResponse (callback = ()=>{}) {
    super(callback)
  }

  postProcess (response, callback_done=()=>{}, callback_none=()=>{}) {
    super(response, callback_done, callback_none)
  }

  playAudioOutput (response) {
    return super(response)
  }

  showScreenOutput (response) {
    return super(response)
  }

  makeUrl (uri) {
    return super(uri)
  }

*/
}
