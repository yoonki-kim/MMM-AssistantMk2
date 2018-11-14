# HOW TO ADD GACTION FOR YOUR MAGICMIRROR

## 1. Download gaction CLI
[Download Here](https://developers.google.com/actions/tools/gactions-cli)

```
#example for RPI
cd ~/MagicMirror/modules/MMM-AssistantMk2/gaction
wget hhttps://dl.google.com/gactions/updates/bin/linux/arm/gactions
chmod +x gactions
```

## 2.  Modify actions.json or just leave it.
I already prepared these actions for working example. You can modify or add your owns or just leave it.

- Prepared available commands
  - "reboot"
    - "reboot immediately", "reboot after 5 mins", ...
  - "page"
    - "previous page", "change the page to 1", "page increase", ...

After modifying, You should validate the json file. https://jsonlint.com/ will be help.

## 3. Register and Activate `actions.json`
### Register and get auth.
```
./gactions update --action_package actions.json --project YOUR_PROJECT_ID
```
At first execution, It will show some URL to get credentials. copy that URL to browser, and process the auth process.

### Activate & Refresh
```
./gactions test --action_package actions.json --project YOUR_PROJECT_ID
```
Currently, the life of test action is 30 days. So you'd better put this script into your crontab to use again.
For your convenience, `MMM-AssistantMk2` can refresh this by itself when MM is booted.
(But the first trial - Registering and getting Auth should be done in console.)

To refresh your actions automatically, set below values in your config.
```
useGactionCLI: true,
projectId: "YOUR_PROJECT_ID",
```

## 4. Catch the command from response of Assistant
Add belows in your config.
```
action: {
  "com.example.commands.REBOOT" : {
    command: "REBOOT"
  },
  "com.example.commands.PAGE" : {
    command: "PAGE"
  },
},

command: {
  ...

  "PAGE": {
    notification:(params)=>{
      if (params.number) {
        return "PAGE_SELECT"
      } else if (params.incordec == "INC") {
        return "PAGE_INCREMENT"
      } else {
        return "PAGE_DECREMENT"
      }
    },
    payload:()=>{
      if (params.number) {
        return params.number
      } else {
        return null
      }
    }
  },

  ...
},
```
