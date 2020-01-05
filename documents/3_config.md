# Configuration

## Basic structure
```js
{
  module: "MMM-AssistantMk2",
  position: "top_left",
  config: {
    assistantConfig: {
      latitude: 51.508530,
      longitude: -0.076132,
    },
    recipes: [
      "with-MMM-Hotword.js"
    ]
    ...
  },
},
```

## Configurable filed
> You don't need to use all of these, Because all of them be set as default value. Just pick what you need then override in your `config.`

|field | type | default value
|---|---|---
|debug | BOOLEAN | true

When you set `debug` to `true`, detailed log will be recorded. When you don't want log, set it to `false`


|field | type | default value
|---|---|---
|ui | TEXT | "Fullscreen"

3 Types of ui would be prepared. "Fullscreen", "Classic", "Classic2". You can make your own ui as well.(Inspect `ui` directory)

|field (- subFiled) | type | default value
|---|---|---
|assistantConfig |  OBJECT | { ... }
|- latitude |NUMBER |51.508530
|- longitude|NUMBER |-0.076132
|- credentialPath |TEXT | "credentials.json"
|- projectId |TEXT | ""
|- modelId |TEXT |""
|- instanceId |TEXT | ""

- `latitude` & `longitude` : location of your MagicMirror installed.
- `credentialPath` : You don't need to change this;
- `projectId`, `modelId`, `instanceId` : Unless you need `custom action` or registration on Google Home network, you might not need these values.

- Example.
```js
assistantConfig: {
    latitude: 51.508530,
    longitude: -0.076132,
},
```

|field (- subFiled) | type | default value
|---|---|---
|responseConfig | OBJECT | { ... }
|- useScreenOutput |BOOLEAN |true
|- useAudioOutput |BOOLEAN |true
|- useChime |BOOLEAN |true
|- timer |NUMBER (ms) |5000

- `useScreenOutput` & `useAudioOutput` : Controlling response type, but leaving both two as `true` is better.
- `useChime` : If you don't want the beeping on status changed, set this to `false`.
- `timer` : Duration of response (since it's finishing). After this milliseconds, the response window will be hidden and the module will return to standby status.
```js
responseConfig: {
    timer : 3000
},
```

|field (- subFiled) | type | default value
|---|---|---
|micConfig | OBJECT | { ... }
|- recorder |TEXT | "arecord"
|- device |TEXT | null

- `recorder` : `"sox"`, `"rec"`, `"arecord"` will be available. Commonly `"arecord"` will work for Raspbian.
- `device` : recording device(microphone) name of your environment. (e.g. `"plughw:1"`) Find proper device name by yourself. (`arecord -l` will be help on Raspberry Pi)

Usually, only above 2 fields be required for normal usage. If you need more detailed configuration, you can use these values also. (Use these carefully. Don't do what you don't understand.)

```js
sampleRate            : 16000  // audio sample rate
channels              : 1      // number of channels
threshold             : 0.5    // silence threshold (rec only)
endOnSilence          : false  // automatically end on silence (if supported)
thresholdStart        : null   // silence threshold to start recording, overrides threshold (rec only)
thresholdEnd          : null   // silence threshold to end recording, overrides threshold (rec only)
silence               : '1.0'  // seconds of silence before ending
recorder              : 'sox'  // Defaults to 'sox'
device                : null   // recording device (e.g.: 'plughw:1')
audioType             : 'wav'  // audio type to record
```

Example
```js
micConfig: {
  device: "plughw:1",
},
```

|field | type | default value
|---|---|---
|defaultProfile |TEXT | "default"
|profiles |OBJECT | { ... }


```js
defaultProfile: "default",
profiles: {
  "default": {
    profileFile: "default.json",
    lang: "en-US"
  }
},
```
- `defaultProfile` : profile ID to recognize by default.
- `profiles` : You can reserve several profiles at same time. Of course, you can change profile by condition. (e.g. Change profile by face recognition)

- Each profile would have this structure
```js
  "PROFILE_ID": {
    profileFile: "USER_TOKEN_JSON",
    lang: "en-US",
  }
```
- Currently supported languages are;
```
de-DE, en-AU, en-CA, en-GB, en-IN, en-US, fr-CA,
fr-FR, it-IT, ja-JP, es-ES, es-MX, ko-KR, pt-BR
https://developers.google.com/assistant/sdk/reference/rpc/languages
```
For another languages, some language could be understood but not guaranteed.




|field | type | default value
|---|---|---
|recipes |ARRAY of TEXT | []

- `recipes` : The recipe is an extension file of this module. You can load recipes that you need with this field.
```js
recipes: [
    "with-MMM-Hotword.js", "with-MMM-TelegramBot.js",
    "hide_when_no_use.js"
],
```
You can make your own recipe for your purpose. Read more docs about that and look inside of `recipes` directory.


|field | type | default value
|---|---|---
|transcriptionHooks |OBJECT | { ... }
|actions |OBJECT | { ... }
|commands |OBJECT | { ... }
|plugins |OBJECT | { ... }
|responseHooks |OBJECT | { ... }

- Each `recipe` could have these fields. But you can describe things here directly without recipe. (I recommend you to make `recipe` for easier management.)
- For these fields, read more docs.

|field (- subFiled) | type | default value
|---|---|---
|customActionConfig | OBJECT | { ... }
|- autoMakeAction |BOOLEAN |false
|- autoUpdateAction |BOOLEAN |false
|- actionLocale |TEXT | "en-US"

> This `customActionConfig` is experimental feature. so use it carefully.

- `autoMakeAction` : This option would make to convert your `actions` to `action.json` as source of custom action for Google Assistant SDK automatically.
- `autoUpdateAction` : This option would update your converted action into Google Assistant Server. Custom Action would be registered as `test mode`, so periodical update is needed. This option will do that job automatically.
- `actionLocale` : Set locale of your action. At this moment, I haven't provided multi-language action. (It will be added in some days.)


## Use with `MMM-Hotword`
```js
{
  module: "MMM-Hotword",
  position: "top_left",
  config: {
    recipes: ["MMM-AssistantMk2.recipe.js"],
    ... // your other configuration
  }
},
{
  module: "MMM-AssistantMk2",
  position: "top_left",
  config: {
    recipes: ["with-MMM-Hotword.js"],
    ... // your other configuration
  }  
},
```
This will make `smart mirror` of `MMM-Hotword` as a trigger of `MMM-AssistantMk2`.
Additionally, this new version would make `seamless query` possible. It means, you can query without waiting AMK2 activation. `Smart mirror! (waiting a beep) What time is it?` and `Smart mirror, what time is it?` both could be available like real Google Home devices. So cool.
