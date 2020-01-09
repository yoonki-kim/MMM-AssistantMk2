var recipe = {
  commands: {
    "TELBOT_REGISTER_DEMO": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "demo",
            callback: "telegramCommand",
            description: module.translate("DEMO_HELP")            
          })
        }
      }
    }
  },
  plugins: {
    onReady: "TELBOT_REGISTER_DEMO"
  },
}

exports.recipe = recipe // Don't remove this line.
