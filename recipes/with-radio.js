/**  fr radio commands   **/
/**  modify pattern to your language  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "cheriefm": {
      pattern: "mets chérie-fm",
      command: "cheriefm"
    },
    "rtl": {
      pattern: "mets rtl",
      command: "rtl"
    },
  },

  commands: {
    "cheriefm": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.hbca07.fr/media/uploaded/sites/5499/partenaire/583038d328d24_slidercheriefm.jpg",
            link: "https://scdn.nrjaudio.fm/fr/30201/mp3_128.mp3?origine=A2D&cdn_path=audio_lbs9"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
   "rtl": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "http://static.rtl.fr/www/img/live/logo.gif",
            link: "http://streaming.radio.rtl.fr/rtl-1-44-128"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
  }
}
exports.recipe = recipe
