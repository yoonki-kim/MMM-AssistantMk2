var recipe = {
  commands: {
    "TELBOT_REGISTER_QUERY": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "query",
            callback: "telegramCommand",
            description: module.translate("QUERY_HELP")
          })
        }
      }
    }
  },
  plugins: {
    onReady: "TELBOT_REGISTER_QUERY"
  },
}

exports.recipe = recipe // Don't remove this line.
