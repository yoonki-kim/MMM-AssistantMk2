var recipe = {
  transcriptionHooks: {
    "INTRODUCTION": {
      pattern: "Testlauf",
      command: "INTRODUCTION"
    },
  },
  commands: {
    "INTRODUCTION": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module, params, key) => {
        setTimeout(()=>{
        module.sendNotification("SHOW_ALERT", {message:"test", timer:2000})
                        }, 10000)
                      }
                  },
                }
      }
}

exports.recipe = recipe // Don't remove this line.
