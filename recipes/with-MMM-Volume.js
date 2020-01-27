/**  MMM-Volume commands addon         **/
/**  modify pattern into your language **/
/**         @anonym-tsk                **/


var recipe = {
  transcriptionHooks: {
    "SYSTEM_VOLUME_UP": {
      pattern: "volume up",
      command: "SYSTEM_VOLUME_UP"
    },
    "SYSTEM_VOLUME_DOWN": {
      pattern : "volume down",
      command: "SYSTEM_VOLUME_DOWN"
    },
    "SYSTEM_VOLUME_MAX": {
      pattern : "(max(imum)? volume)|(volume max(imum)?)",
      command: "SYSTEM_VOLUME_MAX"
    },
    "SYSTEM_VOLUME_SET": {
      pattern : "((set volume)|(volume)|(volume set)) ([0-9]+)\%?",
      command: "SYSTEM_VOLUME_SET"
    },
  },
  commands: {
    "SYSTEM_VOLUME_UP": {
      notificationExec: {
        notification: "VOLUME_UP"
      },
      soundExec: {
        chime: "close",
      }
    },
    "SYSTEM_VOLUME_DOWN": {
      notificationExec: {
        notification: "VOLUME_DOWN"
      },
      soundExec: {
        chime: "close",
      }
    },
    "SYSTEM_VOLUME_MAX": {
      notificationExec: {
        notification: "VOLUME_SET",
        payload: 100
      },
      soundExec: {
        chime: "close",
      }
    },
    "SYSTEM_VOLUME_SET": {
      notificationExec: {
        notification: "VOLUME_SET",
        payload: (params) => {
          return params[5]
        }
      },
      soundExec: {
        chime: "close",
      }
    }
  }
}

exports.recipe = recipe
