
## for `MMM-AssistantMk2`
```js
{
  module: "MMM-AssistantMk2",
  position: "top_left",
  config: {
    profile: {
      "default": {
        file: "default.json",
        lang: "en-US"
      }
    },
    recipes: [
      "with-MMM-Hotword.js", "test.js", "with-MMM-TelegramBot.js",
      "hide_when_no_use.js", "actions.sample.js", "actions.sample2.js",
    ],
    customActionConfig: {
      autoMakeAction: true,
      autoUpdateAction: false, // in RPI, gaction CLI might have some trouble.(current version should be 2.2.4, but for linux-arm, Google haven't updated) so leave this as false in RPI. I don't know it is solved or not.
      actionLocale: "en-US", // At this moment, multi-languages are not supported, sorry. Someday I'll work.
    },
    assistantConfig: {
      projectId: "homeinfo-c6efe", // Required to use gaction.
      deviceModelId: "homeinfo-c6efe-home-information-board-atb-9isflg", // (OPTIONAL for gaction)
      deviceInstanceId: "",
    }
  },
},
```

## for `MMM-Hotword`
```js
{
  module: "MMM-Hotword",
  position: "top_left",
  config: {
    mic: {
      recordProgram:"arecord",
      verbose:true
    },
    recipes: ["MMM-AssistantMk2.recipe.js"], // Simple!
    ...
  }
},
```



## save this for recipe of MMM-Hotword as `MMM-AssistantMk2.recipe.js`
```js
var recipe = {
  models: [
    {
      hotwords    : "Assistant",
      file        : "smart_mirror.umdl",
      sensitivity : "0.7",
    },
  ],
  commands: {
    "Assistant": {
      notificationExec: {
        notification: "ASSISTANT_ACTIVATE",
        payload: (detected, afterRecord) => {
          var ret = {
            profile:"default",
            type: "MIC",
          }
          if (afterRecord) {
            ret.type = "WAVEFILE"
            ret.key = "modules/MMM-Hotword/" + afterRecord
          }
          return ret
        }
      },
      restart:false,
      afterRecordLimit: 7
    }
  }
}

exports.recipe = recipe // Don't remove this line.
```
This makes hotword `smart mirror` to MMM-AssistantMk2 activator.
I'll add this file to MMM-Hotword when MMM-AssistantMk2 being released.
