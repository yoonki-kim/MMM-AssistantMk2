var recipe = {
  commands: {
    // Describe your command here.
    "TELBOT_REGISTER_COMMAND": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module) => {
          module.command_q = function(command, handler) {
            var query = handler.args
            module.notificationReceived("ASSISTANT_ACTIVATE", {
              type: "TEXT",
              key: query,
              //secretMode: false,
              callback: (response)=>{
                console.log(response)
                handler.reply("TEXT", response.screen.text)
              },
            }, module)
          }
          module.sendNotification("TELBOT_REGISTER_COMMAND", {
            command: "q",
            callback: "command_q",
            description: module.translate("blah blah")
          })
        }
      }
    },
  },
  plugins: {
    onReady: "TELBOT_REGISTER_COMMAND",
    // Describe your plugin here.
  },
}

exports.recipe = recipe // Don't remove this line.
