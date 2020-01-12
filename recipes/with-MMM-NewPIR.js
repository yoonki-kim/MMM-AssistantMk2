/**  MMM-NewPIR V2 commands addon  **/
/**    automatic Turn on screen    **/
/**       on AMk2 usage            **/
/**         @bugsounet             **/


var recipe = {
  commands: {
    "NEWPIR_WAKEUP": {
      notificationExec: {
        notification: "USER_PRESENCE",
        payload : true
      }
    },
  },
  plugins: {
    onBeforeActivated: "NEWPIR_WAKEUP",
    onBeforeScreenResponse: "NEWPIR_WAKEUP",
    onReady: "NEWPIR_WAKEUP"
  },
}

exports.recipe = recipe
