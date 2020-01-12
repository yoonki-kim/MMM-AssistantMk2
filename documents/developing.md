# Version 3.0.0 Developing.
Last update : 2020/01/02

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
- User Interface (status, error, transcription, ...) (Rest: error translate -- Bugsounet)
- Screen Output hooking part. (ok !)
- Code refactoring. (95 % done -- Bugsounet & eouia)
- Manual (I hate this!)
- Bash installer script for npm install (95% Done -- Bugsounet --- RPI: ok - need test for OSX)
- Related modules(MMM-Telegram, MMM-YouTube, MMM-Spotify, MMM-News, ...) update for using together (MMM-Youtube: ok, MMM-telegram: ok -- eouia)
- Real RPI test (Actually in prod with my RPI -- Bugsounet)
- And more tests.


## Installation of 3-dev (Temporal)
0. backup your `credentials.json` and profiles. It will be used as same.
1. `git pull` or `git clone` for updated version downloading
2. `git checkout 3-dev`
3. `npm install`
4. restore your backup jsons.

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
    ui : "Classic2", // ui-> Classic // Classic2 (with try to say) // Fullscreen
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
      useChime: true,
      reactiveTimer: 5000,
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
