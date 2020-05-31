 
# Configuration

## Basic structure
```js
{
  module: "MMM-AssistantMk2",
  position: "fullscreen_above",
  config: {
    assistantConfig: {
      latitude: 51.508530,
      longitude: -0.076132,
    },
    recipes: [ "with-MMM-TelegramBot.js" ]
    ...
  },
},
```

## Configurable filed
> You don't need to use all of these, Because all of them be set as default value. Just pick what you need then override in your `config.`

### Field `debug`
|field | type | default value
|---|---|---
|debug | BOOLEAN | false

When you set `debug` to `true`, detailed log will be recorded. When you don't want log, set it to `false`

### Field `ui`
|field | type | default value
|---|---|---
|ui | TEXT | "Fullscreen"

4 Types of ui would be prepared. "Fullscreen", "Classic", "Classic2" and "Simple".<br>
You can make your own ui as well.(Inspect `ui` directory)

_Notes_: 
 * ONLY `Fullscreen` ui works with `fullscreen_above` module position.
 * There is no Google Assistant Icon on Fullscreen ui. Google Assistant screen only appears on activation
 * For other ui best position is `top_left`

### Field `assistantConfig: {}`
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
Change latitude and longitude value for your actual position.

This [website](https://latitudelongitude.org/) can help you to determinate it

### Field `responseConfig: {}`
|field (- subFiled) | type | default value
|---|---|---
|responseConfig | OBJECT | { ... }
|- useHTML5 |BOOLEAN |true
|- useScreenOutput |BOOLEAN |true
|- useAudioOutput |BOOLEAN |true
|- useChime |BOOLEAN |true
|- timer |NUMBER (ms) |5000
|- myMagicWord|BOOLEAN|false
|- delay|NUMBER (s) |0.5
|- playProgram |STRING|mpg321
|- useStaticIcons|BOOLEAN or STRING| false
|- chime|OBJECT| { ... }
- `useHTML5` : use HTML5 audio output
- `useScreenOutput` & `useAudioOutput` : Controlling response type, but leaving both two as `true` is better.
- `useChime` : If you don't want the beeping on status changed, set this to `false`.
- `timer` : Duration of response (since it's finishing). After this milliseconds, the response window will be hidden and the module will return to standby status.
- `myMagicWord` : Natural TTS response for recipes commands (see myMagicWord parts -- Under developement)
- `delay` : Timer of assistant activate. After this delay assistant activate (play beep) and you can speak. (Generaly for mic close delay issue)
- `playProgram` : If you don't use HTML5 audio output, specify used program (mpg321,...
- `useStaticIcons` : false - animated icons, 'standby' - static icons only for standby state, true - all static icons
- `chime`: Specify your own sound for beep, error, continue, open and close chime
```js
responseConfig: {
    timer : 3000
    chime: {
      beep: "beep.mp3",
      error: "error.mp3",
      continue: "continue.mp3",
      open: "Google_beep_open.mp3",
      close: "Google_beep_close.mp3",
    },
},
```
### Field `micConfig: {}`
|field (- subFiled) | type | default value
|---|---|---
|micConfig | OBJECT | { ... }
|- recorder |TEXT | "arecord"
|- device |TEXT | null

- `recorder` : `"sox"`, `"rec"`, `"arecord"` will be available. Commonly `"arecord"` will work for Raspbian.
- `device` : recording device(microphone) name of your environment. (e.g. `"plughw:1"`) Find proper device name by yourself. (`arecord -l` will be help on Raspberry Pi)

Note: If you enable auto-installer with npm install. It can generate `micConfig {}` configuration. 

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
verbose               : false  // verbose mic recorder
```

Example
```js
micConfig: {
  device: "plughw:1",
},
```
### Fields `defaultProfile` and `profiles: {}`
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
```
[Google Supported Language Code](https://developers.google.com/assistant/sdk/reference/rpc/languages)

For another languages, some language could be understood but not guaranteed.

### Field `recipes: {}`

|field | type | default value
|---|---|---
|recipes |ARRAY of TEXT | []

- `recipes` : The recipe is an extension file of this module. You can load recipes that you need with this field.
```js
recipes: [
    "with-MMM-Hotword.js", "with-MMM-TelegramBot.js",
    "with-MMM-Spotify"
],
```
You can make your own recipe for your purpose. Read more docs about that and look inside of `recipes` directory.

### Fileds `transcriptionHooks: {}`, `actions: {}`, `commands: {}`, `plugins: {}`, `responseHooks: {}`
|field | type | default value
|---|---|---
|transcriptionHooks |OBJECT | { ... }
|actions |OBJECT | { ... }
|commands |OBJECT | { ... }
|plugins |OBJECT | { ... }
|responseHooks |OBJECT | { ... }

- Each `recipe` could have these fields (except addons). But you can describe things here directly without recipe. (I recommend you to make `recipe` for easier management.)
- For these fields (except addons), read [wiki:recipes](https://github.com/eouia/MMM-AssistantMk2/wiki/Recipes).

### Field `customActionConfig: {}`
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

### Field `useA2D`
|field | type | default value
|---|---|---
|useA2D |BOOLEAN| false

 - This option activate preconfigured code for [MMM-Assistant2Display](https://github.com/bugsounet/MMM-Assistant2Display) or [MMM-Snowboy](https://github.com/bugsounet/MMM-Snowboy) fonctionality

### Field `A2DStopCommand`
|field | type | default value
|---|---|---
|A2DStopCommand |TEXT | stop

 - Personalized command for stop Assistant2Display

### Field `useSnowboy`
|field | type | default value
|---|---|---
|useSnowboy |BOOLEAN | false

 - Activate snowboy integred detector
 - **needed snowboy library installed with `npm install`**

### Field `snowboy: {}`
|field (- subFiled) | type | default value
|---|---|---
|snowboy | OBJECT | { ... }
|- AudioGain |NUMBER | 2.0
|- Frontend |BOOLEAN | true
|- Model|TEXT | jarvis
|- Sensitivity|NUMBER | null

- AudioGain: set the gain of mic. Usually you don't need to set or adjust this value.

- Frontend: set pre-processing of hotword detection. When you use only snowboy and smart_mirror, false is better. But with other models, true is better to recognize.

- Model: set the name of your detector. Available: "smart_mirror", "jarvis", "computer", "snowboy", "subex", "neo_ya", "hey_extreme", "view_glass" and "alexa"

- Sensitivity: Override default sensitivity value for applied model defined in `Model`. 
    * Value could be within a range from `0.0` to `1.0`.
    * Default sensitivity values for preconfigured models are:
      * smart_mirror: `0.5`
      * jarvis: `0.7`
      * computer: `0.6`
      * snowboy: `0.5`
      * subex: `0.6`
      * neo_ya: `0.7`
      * hey_extreme: `0.6`
      * view_glass: `0.7`
      * alexa: `0.6`

    * null: will set default sensitivity.
