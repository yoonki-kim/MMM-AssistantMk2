var AMK2_CONFIG = {
  verbose: true,
// [Assistant Setting
  projectId: "",
  deviceModelId: "",
  deviceInstanceId: "",
  credentialPath: "./credentials.json",

  deviceLatitude: 51.5033640,
  deviceLongitude : -0.1276250,
  useAudioOutput: true,
  useScreenOutput: true,
  screenOutputZoom : "70%",
  resultTimeout: 30 * 1000,
  responseWaitingTimeout: 20 * 1000,

  // Profiles
  defaultProfile: "default",
  profiles: {
    "default" : {
      profileFile: "default.json",
      lang: "en-US"
      //currently available (estimation, not all tested):
      //  de-DE, en-AU, en-CA, en-GB, en-US, en-IN
      // fr-CA, fr-FR, it-IT, ja-JP, es-ES, es-MX, ko-KR, pt-BR
      // https://developers.google.com/assistant/sdk/reference/rpc/languages
    },
  },

// mic setting
  mic: {
    recordProgram: "rec",
    device: null,
    sampleRate    : 16000,  // audio sample rate
    channels      : 1,      // number of channels
    threshold     : 0.5,
    thresholdStart: null,
    thresholdEnd  : null,
    silence       : '1.0',
    verbose       : true,  // log info to the console
  },

// speaker setting
  speaker: {
    channels: 1,
    sampleRate: 24000,
  },
// Snowboy Detector
  // snowboy settings
  detector: {
    audioGain: 2.0,
    applyFrontend: true, // When you are using `.pmdl`, set this to `false`.
    // For `.umdl`, When you use only`snowboy` and `smart_mirror`, `false` is better. But with other models, `true` is better.
    //timeout: 1000 * 3, // After hotword detect, how long could the followed voice order be long.
    //Usually by mic silence & threshold could stop the recording, but anyway you can stop it by force with this value.
  },

  // Hotword models
  models: [
    {
      hotwords: "smart_mirror", //this will be sended to other module for distinguishing which hotword is detected.
      file: "voice_models/smart_mirror.umdl",
      sensitivity: "0.5",
    },
    {
      hotwords: "snowboy",
      file: "voice_models/snowboy.umdl",
      sensitivity: "0.5",
    },
    {
      hotwords: ["jarvis", "jarvis"],
      file: "voice_models/jarvis.umdl",
      sensitivity: '0.8,0.8',
    },
    {
      hotwords: "subex",
      file: "voice_models/subex.umdl",
      sensitivity: "0.6",
    },
    {
      hotwords: ["neo_ya", "neo_ya"],
      file: "voice_models/neoya.umdl",
      sensitivity: "0.7,0.7",
    },
    {
      hotwords: "hey_extreme",
      file: "voice_models/hey_extreme.umdl",
      sensitivity: "0.6",
    },
    {
      hotwords: "computer",
      file: "voice_models/computer.umdl",
      sensitivity: "0.6",
    },
    {
      hotwords: "view_glass",
      file: "voice_models/view_glass.umdl",
      sensitivity: "0.7",
    },
    {
      hotwords: "alexa",
      file: "voice_models/alexa.umdl",
      sensitivity: "0.6",
    },
  ],

  onHotword: {
    "computer": {
      type: "ASSISTANT",
    },
    "jarvis": {
      type: "ASSISTANT",
      profile: "default"
    },
    "alexa": {
      type: "COMMAND",
      command: "TEST_COMMAND"
    }
  },
  autoMakeAction: false,
  autoRefreshAction: false,
  actionLocale: "en", //https://developers.google.com/actions/localization/action-packages
  action: {

  },

  recipes:["sample.js", "sample2.js"],













  verbose: true,
  projectId: "", // Google Assistant ProjectId (Required only when you use gAction.)
  useGactionCLI: false,
  startChime: "connection.mp3",
  noChimeOnSay: false,



  transcriptionHook: {},
  action: {},
  command: {},
  responseVoice: true, // If available, Assistant will response with her voice.
  responseScreen: true, // If available, Assistant will response with some rendered HTML
  responseAlert: true, // If available, Assistant will response with Alert module of MM
  // Sometimes, any response could not be returned.
  ignoreNoVoiceError: true, //To avoid some annoying youtube stop bug.



  screenZoom: "80%",
  screenDuration: 0, //If you set 0, Screen Output will be closed after Response speech finishes.

  youtubeAutoplay: true,
  spotifyAutoplay: true,
  pauseOnYoutube:true,
  youtubePlayerVars: { // You can set youtube playerVars for your purpose, but should be careful.
    "controls": 0,
    "loop": 1,
    "rel": 0,
  },
  youtubePlayQuality: "default", //small, medium, large, hd720, hd1080, highres or default


  alertError: true,

  useWelcomeMessage: "",

  record: {
    sampleRate    : 16000,      // audio sample rate
    threshold     : 0.5,        // silence threshold (rec only)
    thresholdStart: null,       // silence threshold to start recording, overrides threshold (rec only)
    thresholdEnd  : null,       // silence threshold to end recording, overrides threshold (rec only)
    silence       : 1.0,        // seconds of silence before ending
    verbose       : false,      // log info to the console
    recordProgram : "arecord",  // Defaults to "arecord" - also supports "rec" and "sox"
    device        : null        // recording device (e.g.: "plughw:1")
  },

  play: {
    encodingOut: "MP3", //'MP3' or 'WAV' is available, but you might not need to modify this.
    sampleRateOut: 24000,
    playProgram: "mpg321", //Your prefer sound play program. By example, if you are running this on OSX, `afplay` could be available.
    playOption: [], // If you need additional options to use playProgram, describe here. (except filename)
    // e.g: ["-d", "", "-t", "100"]
  },

  onIdle: {
    //timer: 1000*60*30, // if you don't want to use this feature, just set timer as `0` or command as ""
    //command: "HIDEMODULES",
    timer: 0,
    command: null,
  },

  onActivate: {
    timer: 0,
    //command: "SHOWMODULES"
    command: null,
  },

  notifications: {
    ASSISTANT_ACTIVATE: "ASSISTANT_ACTIVATE",
    ASSISTANT_DEACTIVATE: "ASSISTANT_CLEAR",
    ASSISTANT_ACTIVATED: "ASSISTANT_ACTIVATED",
    ASSISTANT_DEACTIVATED: "ASSISTANT_DEACTIVATED",
    ASSISTANT_ACTION: "ASSISTANT_ACTION",
    ASSISTANT_UNDERSTOOD: "ASSISTANT_UNDERSTOOD",
    ASSISTANT_RESPONSE_END: "ASSISTANT_RESPONSE_END",
    DEFAULT_HOOK_NOTIFICATION: "ASSISTANT_HOOK",
    TEXT_QUERY: "ASSISTANT_QUERY",
    SAY_TEXT: "ASSISTANT_SAY"
  },

  //magicQueryToSay: "", // set as your language e.g) "Repeat as me : '%TEXT%'",
}
