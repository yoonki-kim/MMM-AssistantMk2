This is a step-by-step example of making gAction for timer.
My module is using `Assistant SDK for devices - Google Assistant Service`. It doesn't support the timer feature by SDK level. So I will show you how to make your custom gAction command to make timer.

## Goal 
Making commands like these;
- "10 minutes timer"
- "alert after 2 hours"

And `SHOW_ALERT` after that time.

## Instruction
- Read [this](https://github.com/eouia/MMM-AssistantMk2/tree/master/gaction) first.

### 1. To define gAction
Replace below codes as `gaction/actions.json`
```json
{
    "manifest": {
        "displayName": "MagicMirror",
        "invocationName": "magic mirror",
        "category": "PRODUCTIVITY"
    },
    "actions": [
        {
            "name": "com.example.actions.TIMER",
            "availability": {
                "deviceClasses": [
                    {
                        "assistantSdkDevice": {}
                    }
                ]
            },
            "intent": {
                "name": "com.example.intents.TIMER",
                "parameters": [
                    {
                        "name": "delay",
                        "type": "SchemaOrg_Number"
                    },
                    {
                        "name": "unit",
                        "type": "Unit"
                    }
                ],
                "trigger": {
                    "queryPatterns": [
                        "alert after $SchemaOrg_Number:delay $Unit:unit",
                        "$SchemaOrg_Number:delay $Unit:unit timer"
                    ]
                }
            },
            "fulfillment": {
                "staticFulfillment": {
                    "templatedResponse": {
                        "items": [
                            {
                                "simpleResponse": {
                                    "textToSpeech": "Timer is set."
                                }
                            },
                            {
                                "deviceExecution": {
                                    "command": "com.example.commands.TIMER",
                                    "params": {
                                        "delay": "$delay",
                                        "unit": "$unit"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    ],
    "types": [
        {
            "name": "$Unit",
            "entities": [
                {
                    "key": "SEC",
                    "synonyms": [
                        "second",
                        "seconds"
                    ]
                },
                {
                    "key": "MIN",
                    "synonyms": [
                        "minute",
                        "minutes"
                    ]
                },
                {
                    "key": "HOUR",
                    "synonyms": [
                        "hour",
                        "HOURS"
                    ]
                }
            ]
        }
    ]
}
```
gAction `"com.example.commands.TIMER"` is defined in this example. It can be triggered with `"alert after $delay $unit"`, `"$delay $unit timer"`. (e.g: `alert after 10 minutes`, `2 hours timer`)


## 2. Activate your gAction
Register and activate your gAction with instruction :  https://github.com/eouia/MMM-AssistantMk2/tree/master/gaction#3-register-and-activate-actionsjson

If success, `Your app for the Assistant for project YOUR_PROJECT_ID is now ready for testing on Actions on Google enabled devices or the Actions Web Simulator...` will be displayed.

## 3. Configure module
Open `config.js` and modify it. This is a definition of action to be evaluated.
```js
action: {
  "com.example.commands.TIMER" : {
    command: "TIMER",
  },
  ... // your other actions, if exists.
},
```
It means, when module gets "com.example.commands.TIMER" action(defined in actions.json), module will execute "TIMER" command.

Now, add "TIMER" command.

```js
command: {
  "TIMER": {
    moduleExec: {
      module: ["MMM-AssistantMk2"],
      exec: (module, params, key) => {
        var delay = 0
        if (params["unit"] == "HOUR") delay = params["delay"] * 3600000
        if (params["unit"] == "MIN") delay = params["delay"] * 60000
        if (params["unit"] == "SEC") delay = params["delay"] * 1000
        setTimeout(()=>{
          module.sendNotification("SHOW_ALERT", {message:"It's time you've set.", timer:3000})
        }, delay)
      }
    }
  },
  ... // Your other commands, if exists.
},
```

There is no sound (it just show ALERT on your mirror), no cancel method. but this is just an example. you can expand it.