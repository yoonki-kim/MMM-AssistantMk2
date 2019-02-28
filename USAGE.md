# USAGE

## Command
- You can make your own commands to control MM directly.
  - `notificationExec` : Control MM & modules with notification
    - `notification` : `String` or `Function` for notification name to be broadcasted
    - `payload` : `Variables or Object` or `Function` for notification payload
  - `shellExec` : Control MM & device with shell command
    - `exec` : `String` or `Function` for shell command to be executed
    - `options` : `String` or `Function` for additional option for command
  - `moduleExec` : Control modules with using module object.
    - `module` : `Array of String` or `Function` for module name to be controlled. All modules are targeted when you set as `[]`
    - `exec` : `Function` for execution
### Example
1. **notificationExec**
```
command: {
  "SAYHELLO": {
    notificationExec: {
      notification: "SHOW_ALERT",
      payload: {
        message: "You've ordered SAYHELLO.",
        timer: 5000,
      }
    },
  },
  "SAYHELLO2": {
    notificationExec: {
      notification: (params, key) => {
        // params: result of transcriptionHook match or gAction parameters
        // key: which transcriptionHook or gAction call this command

        if (key == "com.example.commands.SAYHELLO2")
        return "SHOW_ALERT" //return value will be used as notification name
      },
      payload: (params, key)=> {
        return { // return value will be used as payload
          message: "You've ordered SAYHELLO2.",
          timer: 5000,
        }
      }
    },
  },
}

```
2. **shellExec**
```
command: {
  "SCREENOFF": {
    shellExec: {
      exec: "~/MagicMirror/modules/MMM-AssistantMk2/scripts/screenoff.sh",
      options: null,
    }
  },
  "REBOOT": {
    shellExec: {
      exec: (params, key) => {
        return "sudo reboot"
      },
      options: (params, key)=> {
        if (params[1]) {
          return params[1]
        } else {
          return "now" // the command "sudo reboot now" will be executed.
        }
      },
    }
  },
}
```
3. **moduleExec**
```
command: {
  "HIDECLOCK": {
    moduleExec: {
      module:(params, key)=>{
        return ["clock"] // Array of String which contains module names should be returned.
      },
      exec: (module, params, key) => { // `module` will be target module instance.
        module.hide()
      }
    }
  },
  "HIDEALLMODULES": {
    moduleExec: {
      module:[],
      exec: (module, params, key) => {
        module.hide()
      }
    }
  },
}
```
### Default Prepared commands
```
command: {
  "HIDEMODULES": {
    moduleExec: {
      module:()=>{
        return []
      },
      exec: (module, params, key) => {
        module.hide(1000, null, {lockString:"AMK2"})
      }
    }
  },
  "SHOWMODULES": {
    moduleExec: {
      module:[],
      exec: (module, params, key) => {
        module.show(1000, null, {lockString:"AMK2"})
      }
    }
  },
  "SCREENON": {
    shellExec: {
      exec: (params, key) => {
        return "~/MagicMirror/modules/MMM-AssistantMk2/scripts/screenon.sh"
        //return "ls -al"
      },
      options: (params, key)=> {
        return ""
      },
    }
  },
  "SCREENOFF": {
    shellExec: {
      exec: "~/MagicMirror/modules/MMM-AssistantMk2/scripts/screenoff.sh",
      options: null,
    }
  },
  "REBOOT": {
    notificationExec: {
      notification: "SHOW_ALERT",
      payload: {
        message: "You've ordered REBOOT. I'm showing just alert, but you can modify config.js to reboot really.",
        timer: 5000,
      }
    },
    /*
    shellExec: {
      exec: "sudo reboot now"
    }
    */
  },
  "SHUTDOWN": {
    notificationExec: {
      notification: (params, key) => {
        return "SHOW_ALERT"
      },
      payload: (params, key)=> {
        return {
          message: "You've ordered SHUTDOWN. I'm showing just alert, but you can modify config.js to reboot really.",
          timer: 5000,
        }
      }
    },
    /*
    shellExec: {
      exec: "sudo shutdown now"
    }
    */
  },
},
```
You can activate these commands with `transcriptionHook` and `action`


## TranscriptionHook
- You can hook some phrase from your spoken transcription.
- When you saying something and it is defined in `transcriptionHook`, `command` will be executed.

### Example
```
transcriptionHook: {
  "MY_COMMAND_HIDE_ALL_MODULES": {
    pattern: "hide all",  // When you say "hide all",
    command: "HIDEMODULES" // command "HIDEMODULES" will be executed
  },
  "MY_COMMAND_REBOOT": {
    pattern: "reboot ([a-zA-Z0-9 ]*)$",
    command: "REBOOT"
},
```

- pattern **REQUIRED**
  - Regular Expression String for catching phrase.
  - Matched pattern will be delivered to `command`
- command **REQUIRED**
  - which command to be executed. (defined in `command`)

### Default hooks (combined with `command`)
```
transcriptionHook: {
  "HIDE_ALL_MODULES": {
    pattern: "hide all",
    command: "HIDEMODULES"
  },
  "SHOW_ALL_MODULES": {
    pattern: "show all",
    command: "SHOWMODULES"
  },
  "SCREEN_ON": {
    pattern: "wake up",
    command: "SCREENON"
  },
  "SCREEN_OFF": {
    pattern: "go to sleep",
    command: "SCREENOFF"
  },
  "REBOOT": {
    pattern: "reboot yourself",
    command: "REBOOT"
  },
  "SHUTDOWN": {
    pattern: "shutdown yourself",
    command: "SHUTDOWN"
  }
},
```
#### Notice
- `TranscriptionHook` is a hook mechanism out of Google Assistant. So with this hook, you cannot control Assistant Itself. (It means you cannot get vocal response of Assistant when hooked)
- Take care of `Side effects`. If hooked phrase is reserved or used by Assistant, there could be unintended side effects. By exmaple, don't assign **add event** as hook phrase. This might be used Google Assistant itself. She will try making an event to your Google Calendar but you hooked this process, so failed. And that makes unintended continuous conversations.

## GAction
It is similar with `transcriptionHook`, more complex but powerful and natural on Google Assistant
Read :  [gaction/README.md](/gaction/README.md)

## Youtube
```
youtubeAutoplay: true,
//If set as true, found Youtube video will be played automatically.

pauseOnYoutube: true,
//If set as true, You cannot activate Assistant during youtube playing. Recommended for the performance (Because always listening of hotword detector might make performance lower)
```
If Youtube video is not played :
  - You might have some front-end error. Check front-end errors with `npm start dev`
  - Some videos are not allowed to be played on embedded player by owner.
  - Don't use `PLAY` to play youtube. it is reserved keyword allowed only to REAL Google Home devices. The SDK is still on the beta stage, so that is not supported feature yet. Search video clip like "Thriller Michael Jakson" instead "PLAY Thriller of Michael Jackson on Youtube"

## MMM-TelegramBot & Other module can query.
- External Query
  - If you are using `MMM-TelegramBot`, `/q YOUR_QUERY` could be transmitted to Assistant. The response will come to MM.
  - Or your other module can also request query with notification
  ```
  this.sendNotification("ASSISTANT_QUERY", "what time is it now")
  ```
- TTS
  - If you are using `MMM-TelegramBot`, `/s TEXT` could be transmitted to Assistant. Assistant will say this.
  - TTS feature is added. Now, Other modules can order MMM-AssistantMk2 to say something. It can be used like something similar TEXT-TO-SPEECH. By example, you can build your customClock module say current time via MMM-AssistantMk2
    - USAGE:
      - `this.sendNotification("ASSISTANT_SAY", "Time to go to bed")`
      - `this.sendNotification("ASSISTANT_SAY", {text:"C'est trop chaud", lang:"fr-FR"})`
    - NOTICE:
      - This feature is somekind of Assistant hooking. If you say "Repeat after me SOMETHING", Google Assistant will repeat SOMETHING. So, there could be a possibility of not responding as intend. Too long or complex text might be not available.
      - Currently I can't find correspondence of `Repeat after me` for **German/Japanese/Korean** language. PR please.
      - You can prevent the starting chime from being played before your own text is pronounced: set the config variable `noChimeOnSay` to `true`.
    - Thanks to [Valerio Pilo](https://github.com/vpilo). His brilliant idea and PR could make this feature.



## Register your Mirror as Google Assistant related device.
You might need to register your mirror as device of Google Home/Assistant App. (For more control or gAction using)

Follow this.
```
cd ~

sudo apt-get update

sudo apt-get install portaudio19-dev libffi-dev libssl-dev libmpg123-dev

sudo apt-get install python3-dev python3-venv

python3 -m venv env

env/bin/python -m pip install --upgrade pip setuptools wheel

source env/bin/activate

python -m pip install --upgrade google-auth-oauthlib[tool]

cp MagicMirror/modules/MMM-AssistantMk2/credentials.json .
```
Then,
```
google-oauthlib-tool --scope https://www.googleapis.com/auth/assistant-sdk-prototype --headless --client-secrets credentials.json
```

This will display some URL. Copy it and paste it into browser. You will be asked some confirmation, then, you can get some CODE. Copy it and paste into terminal then enter.
Then, You will get some code similar this;

```
{
   "scopes": ["https://www.googleapis.com/auth/assistant-sdk-prototype"],
   "token_uri": "https://accounts.google.com/o/oauth2/token",
   "token": "ya29.GlujBLa_kuXZ5GnGBPBe_A6NpczLcpOtglEC0wHVORnmEhHETzlSW",
   "client_id": "795595571889-6iesr9a3nkmnipbdfnqi6gehiklm2m28.apps.googleusercontent.com",
   "client_secret": "Un8_TNFnb55555auSAGasvAg",
   "refresh_token": "1/4ZMBhTR3bTYWVEMatYWLOxW755555hlQXZI5uC02F2U"
 }
```
Copy the token (exclude quotation mark) Then, type in the shell like this.
```
ACCESSTOKEN=<Paste your copied token here>
```
Now create “deviceInstance.json” (sample is on your MMM-AssistantMk2 directory)
```
nano deviceInstance.json
```
and write this and save.
```
{
    "id": “my_mirror_001”,
    "model_id": “YOUR_MODEL_ID”,
    "nickname": “My 1st Mirror”,
    "client_type": "SDK_SERVICE"
}
```
`YOUR_MODEL_ID` will be get from your Google Project console. (You've already get this and `YOUR_PROJECT_ID` when you created your project)
Then,
```
curl -s -X POST -H "Content-Type: application/json" \
-H "Authorization: Bearer $ACCESSTOKEN" -d @deviceInstance.json \
https://embeddedassistant.googleapis.com/v1alpha2/projects/YOUR_PROJECT_ID/devices/
```
 If success, your contents of deviceInstanc.json will be displayed again.
 Now, `my_mirror_001` is your deviceInstanceId

Then, modify configuration of MMM-AssistantMk2, and rerun.
```
deviceModelId: "YOUR_MODEL_ID",
deviceInstanceId: "my_mirror_001",
```

Now you can see your mirror on Google Home App in your phone.
