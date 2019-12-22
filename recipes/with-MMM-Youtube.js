var recipe = {
  responseHooks: {
    "FOUND_YOUTUBE": {
      where: "links",
      pattern: "https:\/\/m\.youtube\.com\/watch\\?v=(.+)$",
      command: "PLAY_YOUTUBE"
    }
  },
  commands: {
    "PLAY_YOUTUBE": {
      moduleExec:{
        module: "MMM-AssistantMk2",
        exec: (module, param, from)=>{
          module.sendNotification("YOUTUBE_LOAD", {type:"id", id:param[1]})
        }
      }
    },
    "YOUTUBE_STOPPED": {
      moduleExec: {
        module: "MMM-AssistantMk2",
        exec: (module, param, from)=>{
          if (param.notification == "ENDED" && param.sender.name == "MMM-YouTube")
          console.log(param)
          // What to do? when video is ended???
        }
      }
    }
  },
  plugins: {
    //onBeforeNotificationReceived: "YOUTUBE_STOPPED"
  }
}

exports.recipe = recipe // Don't remove this line.
