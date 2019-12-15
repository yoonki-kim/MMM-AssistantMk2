var recipe = {
  transcriptionHooks: {
    "HOOKING_TEST": {
      pattern: "test",
      command: "INTRODUCTION"
    },
  },
  commands: {
    "INTRODUCTION": {
      moduleExec: {
        module: ["MMM-AssistantMk2"],
        exec: (module, params, key) => {
          setTimeout(()=>{
            module.sendNotification("SHOW_ALERT", {message:"it's works !", timer:2000})
          }, 100)
        }
      },
      soundExec: {
        chime: "open"
        say: "it's really works !"
    }
  }
}

exports.recipe = recipe // Don't remove this line.
