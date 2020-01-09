var recipe = {
  commands: {
    "TELBOT_REGISTER_SAY": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          if (this.config.responseConfig.myMagicWord) {
            module.sendNotification("TELBOT_REGISTER_COMMAND", {
              command: "say",
              callback: "telegramCommand",
              description: module.translate("SAY_HELP")
            })
          }
        }
      }
    }
  },
  plugins: {
    onReady: "TELBOT_REGISTER_SAY"
  },
}

exports.recipe = recipe // Don't remove this line.
