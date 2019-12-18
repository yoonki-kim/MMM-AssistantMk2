var recipe = {
  commands: {
    // Describe your command here.
    "CMD_HOTWORD_PAUSE": {
      notificationExec: {
        notification: "HOTWORD_PAUSE"
      }
    },
    "CMD_HOTWORD_RESUME": {
      notificationExec: {
        notification: "HOTWORD_RESUME"
      }
    },
    "CMD_TEST": {
      moduleExec: {
        modules: ["MMM-AssistantMk2"],
        exec: (module)=>{
          module.t("wow")
        }
      }
    }
  },
  plugins: {
    onBeforeActivated: "CMD_HOTWORD_PAUSE",
    onAfterInactivated: "CMD_HOTWORD_RESUME"
    // Describe your plugin here.
  },
}

exports.recipe = recipe // Don't remove this line.
