var recipe = {
  transcriptionHooks: {
    "REBOOT": {
      pattern: "reboot yourself",
      command: "REBOOT"
    },
  },
  commands: {
    "REBOOT": {
      shellExec: {
        exec: "sudo reboot now"
      }
    }
  }
}

exports.recipe = recipe // Don't remove this line.
