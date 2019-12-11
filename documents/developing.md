# Version 3.0.0 Developing.

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/resources/AMk2_Small.png)

## Main difference
- Deprecating sound output dependencies, using HTML5 audio instead
- Query from Realtime-Mic, Query from Recorded-Wavefile, Query from TEXT
- Seamless Query (with MMM-Hotword v2) (through Query from Wavefile)
- Screen output parsable, controllable (even CSS)
- Other modules can query with notification and get the result by callback function.
- ScreenOutputHook(tentative) will be used for post-processing of response.
- YouTube/Spotify related features will be removed, but it could be implemented by 3rd party with ScreenOutputHook
- Easier management of custom Actions.
- Better logging.

## TODO (Not completed)
- User Interface (status, error, transcription, ...)
- Screen Output hooking part.
- Code refactoring.
- Manual (I hate this!)
- Bash installer script for npm install
- Related modules(MMM-Telegram, MMM-YouTube, MMM-Spotify, MMM-News, ...) update for using together
- Real RPI test.
- And more tests.


## Installation of 3-dev (Temporal)
0. backup your `credentials.json` and profiles. It will be used as same.
1. `git pull` or `git clone` for updated version downloading
2. `git checkout 3-dev`
3. `npm install`
4. make sure about `gcc` and `grpc`
5. `electron-rebuild` step.
6. restore your backup jsons.

## Configuration (with MMM-Hotword) on OSX.
```js
{
  module: "MMM-Hotword",
  position: "top_left",
  config: {
      useDisplay: false,
      chimeOnFinish: null,
    mic: {
      recordProgram:"rec",
      verbose:false
    },
    recipes: ["smart_mirror.MMM-AssistantMk2.sample.js"]
  },
},
{
  module: "MMM-AssistantMk2",
  position: "top_left",
  config: {
    debug:true,
    showModule:true,
    assistantConfig: {
      credentialPath: "credentials.json",
      projectId: "",
      modelId: "",
      instanceId: "",
      latitude: 51.508530,
      longitude: -0.076132,
    },
    responseConfig: {
      useScreenOutput: true,
      useAudioOutput: true,
      useFullScreenAnswer: true,
      useChime: true,
      reactiveTimer: 5000,
      screenOutputCSS: "screen_output.css",
    },
    micConfig: {
      recorder: "sox",
      device: null,
    },
    customActionConfig: {
      autoMakeAction: false,
      actionLocale: "en-US",
      autoRefreshAction: false,
    },
    recipes: [],
    transcriptionHooks: [],
    actions:[],
    commands:[],
    defaultProfile: "default",
    profiles: {
      "default": {
        profileFile: "default.json",
        lang: "ko-KR"
      }
    },
  },
},
```
**`MMM-Hotword/recipes/smart_mirror.MMM-AssistantMk2.sample.js`**
```js
var recipe = {
  models: [
    {
      hotwords    : "SMARTMIRROR",
      file        : "smart_mirror.umdl",
      sensitivity : "0.7",
    },
  ],
  commands: {
    "SMARTMIRROR": {
      notificationExec: {
        notification: "ASSISTANT_ACTIVATE",
        payload: (detected, afterRecord) => {
          var ret = {
            profile:"default",
            type: "MIC",

            //callback: (ret)=> {
            //  console.log("Finished", ret)
            //}
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
