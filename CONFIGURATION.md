# CONFIGURATION (2.0.0)

## Very simple version but limited (just for checking)
```
{
  module: "MMM-AssistantMk2",
  position: "top_right",
  config: {
    useWelcomeMessage: "brief today"
  }
},
```
This empty configuration will even work if you use;
- using sound programs: `arecord` & `mpg321`
- No Hotword activating (You can activate this with touch or click icon)
- You have `profiles/default.json` and use it for your only one unique account profile.
- All other configuration will be set as default values.

## Full detailed version. (Don't panic. Detailed information will be followed.)
- All configuration fields are set as belows by default.
- If you don't need, just use `ESSENTIALS` parts.

```
{
  module: "MMM-AssistantMk2",
  position: "top_right",
  config: {

    // --- ESSENTIALS / modifying for your environment might be needed.


    deviceLocation: {
      coordinates: { // set the latitude and longitude of the device to get localized information like weather or time. (ref. mygeoposition.com)
        latitude: 51.5033640, // -90.0 - +90.0
        longitude: -0.1276250, // -180.0 - +180.0
      },
    },

    defaultProfile: "default", // If you have several profiles and want to set one of them as default profile, describe here.

    profiles: {
      "default" : { // profile name.
        profileFile: "default.json", // profile file name.
        lang: "en-US"
        //currently available (estimation, not all tested):
        //  de-DE, en-AU, en-CA, en-GB, en-US, en-IN
        // fr-CA, fr-FR, it-IT, ja-JP, es-ES, es-MX, ko-KR, pt-BR
        // https://developers.google.com/assistant/sdk/reference/rpc/languages
      },
      /* Add your other profiles here, if exists.
      "other_profile" : {
        profileFile: "other.json",
        lang: "de-DE"
      }
      */
    },

    record: { // Full values are in `FOR EXPERTS` section.
      recordProgram: "arecord",  // Defaults to "arecord" - also supports "rec" and "sox"
      device: null        // recording device (e.g.: "plughw:1")
    },

    play: { // Full values are in `FOR EXPERTS` section.
      playProgram: "mpg321", // recommended.
    },


    // --- OPTIONAL / not important but customizable for your usage


    responseVoice: true, // If available, Assistant will response with her voice.
    responseScreen: true, // If available, Assistant will response with some rendered HTML
    responseAlert: true, // If available, Assistant will response with Alert module of MM
    // Sometimes, any response might not be returned. responseAlert is useful for displaying error.

    screenZoom: "80%", // Adjust responseScreen to your mirror size.
    screenDuration: 0, // milliseconds. How long responseScreen will be shown after speech.
    //If you set 0, Screen Output will be closed after Response speech finishes ASAP.

    youtubeAutoplay: true, //If set as true, found Youtube video will be played automatically.
    pauseOnYoutube:true, //If set as true, You cannot activate Assistant during youtube playing. Recommended for the performance (Because permanent hotword detecting might make performance lower)

    youtubePlayerVars: { // You can set youtube playerVars for your purpose, but should be careful.
      "controls": 0,
      "loop": 1,
      "rel": 0,
    },
    youtubePlayQuality: "default", //small, medium, large, hd720, hd1080, highres or default

    useWelcomeMessage: "", //Try "brief today" as this value. You can use this value to check module working when MM is starting.

    onIdle: {
      timer: 1000*60*30, // if you don't want to use this feature, just set timer as `0` or command as ""
      command: "HIDEMODULES"
    },

    onActivate: {
      timer: 0,
      command: "SHOWMODULES"
    },


    // --- FOR EXPERTS / For development, debug or more


    verbose:false, // You can get error or some logs when this value is set as true.
    ignoreNoVoiceError: true, //To avoid some annoying youtube stop bug.

    startChime: "connection.mp3", // you can use `mp3` to play chime when your mic is ready. It should be playable with your `play.playProgram`
    noChimeOnSay: false, // When using the `ASSISTANT_SAY` trigger, you can prevent the chime from being played before your words

    auth: { // I believe you don't need to change this.
      keyFilePath: "./credentials.json"
    },

    record:  { // Full version
      sampleRate    : 16000,      // audio sample rate
      threshold     : 0.5,        // silence threshold (rec only)
      thresholdStart: null,       // silence threshold to start recording, overrides threshold (rec only)
      thresholdEnd  : null,       // silence threshold to end recording, overrides threshold (rec only)
      silence       : 1.0,        // seconds of silence before ending
      verbose       : false,      // log info to the console
      recordProgram : "arecord",  // Defaults to "arecord" - also supports "rec" and "sox"
      device        : null        // recording device (e.g.: "plughw:1")
    },

    play: { // Full version
      encodingOut: "MP3", //'MP3' or 'WAV' is available, but you might not need to modify this.
      sampleRateOut: 24000,
      playProgram: "mpg321", //Your prefer sound play program. By example, if you are running this on OSX, `afplay` could be available.
      playOption: [],
      // If you need additional options to use playProgram, describe here. (except filename)
      // e.g: ["-d", "", "-t", "100"]
    },

    useGactionCLI: false, // If set as true, you can update your gAction when MM is rebooted.
    projectId: "", // Google Assistant ProjectId (Required only when you use gAction.)
    deviceModelId: "", // It should be described in your config.json. In most of case, you don't need to this.
    deviceInstanceId: "", // It should be described in your config.json. In most of case, you don't need to this.

    action:{}, // You can catch your gAction command.

    transcriptionHook: {}, // You can catch transcription hook and be able to make your own `COMMAND` with this.
    //See the `transcriptionHook` section.

    command: {}, // You can make your own MM command for gAction and transcriptionHook
    //See the `command` section.

    notifications: { // You can redefine these notifications to communicate with specific modules.
      ASSISTANT_ACTIVATE: "ASSISTANT_ACTIVATE",
      ASSISTANT_DEACTIVATE: "ASSISTANT_CLEAR",
      ASSISTANT_ACTIVATED: "ASSISTANT_ACTIVATED",
      ASSISTANT_DEACTIVATED: "ASSISTANT_DEACTIVATED",
      ASSISTANT_ACTION: "ASSISTANT_ACTION",
      ASSISTANT_UNDERSTOOD: "ASSISTANT_UNDERSTOOD",
      ASSISTANT_RESPONSE_END: "ASSISTANT_RESPONSE_END",
      DEFAULT_HOOK_NOTIFICATION: "ASSISTANT_HOOK",
      TEXT_QUERY: "ASSISTANT_QUERY",
      SAY_TEXT: "ASSISTANT_SAY",
    }
  }
},
```


## With MMM-Hotword, using USB mic (plughw:1)
```
{
    module: "MMM-AssistantMk2",
    position: "top_right",
    config: {
      record: {
        recordProgram : "arecord",  
        device        : "plughw:1",
      },

      notifications: {
        ASSISTANT_ACTIVATED: "HOTWORD_PAUSE",
        ASSISTANT_DEACTIVATED: "HOTWORD_RESUME",
      },
    }
  },
  {
    module: "MMM-Hotword",
    config: {
      record: {
        recordProgram : "arecord",  
        device        : "plughw:1",
      },
      autostart:true,
      onDetected: {
        notification: function (payload) {
          return "ASSISTANT_ACTIVATE"
        },
        payload: function (payload){
          return {
            profile: payload.hotword
          }
        }
      },
    },
  },
```
