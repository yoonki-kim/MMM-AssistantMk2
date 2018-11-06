# USAGE

## GAction
Read :  [gaction/README.md](/gaction/README.md)

## TranscriptionHook
- You can hook some phrase from your spoken transcription to make your custom notification command to control MM.
- When you saying something and it is defined in `transcriptionHook`, some notification will be emitted. Your other module can catch that notification then can do its job.

#### Example
```
transcriptionHook: {
  "MY_COMMAND1": {
    pattern: "who is the best mc",
    notification: "SHOW_ALERT"
    payload: {
      message: "Of course, It's you.",
      timer: 3000,
    }
  },
  "MY_COMMAND2": {
    pattern: "test ([a-zA-Z0-9 ]*)$",
    notification: (obj) => {
      if (obj.match[1] == "unicorn") {
        return "SHOW_ALERT"
      } else {
        return "SOME_OTHER_NOTIFICATION"
      }
    },
    payload: (obj)=>{
      return {
          message: obj.match[1],
          timer: 3000,
      }
    }
  },
},
```
With this,
- If you say `"who is the best mc"` then `Of course, It's you.` will be shown as `alert`
- If you say `"test unicorn"` then `unicorn` will be shown as `alert`.

`transcriptionHook` could have lots of your custom command objects. Each custom command would have 3 property.
- pattern **REQUIRED**
  - Regular Expression String for catching phrase.
  - Matched pattern will be delivered to `notification` and `payload`
- notification
  - **null** : When omitted, `ASSISTANT_HOOK` will be used.
  - **String** : That string will be used as notification name. In above example, "SHOW_ALERT" is that.
  - **Function** : You can use javascript function for more dynamic control.
- payload
  - **null** : When omitted, matched result of `pattern` will be used as payload.
  - **Object or Variables** : That static values will be used as payload.
  - **Function** : You can use javascript function for more dynamic control.

#### Notice
- `TranscriptionHook` is a hook mechanism out of Google Assistant. So with this hook, you cannot control Assistant Itself. (It means you cannot get vocal response of Assistant when hooked)
- Take care of `Side effects`. If hooked phrase is reserved or used by Assistant, there could be unintended side effects. By exmaple, don't assign **add event** as hook phrase. This might be used Google Assistant itself. She will try making an event to your Google Calendar but you hooked this process, so failed. And that makes unintended continous conversations.



## Youtube
```
youtubeAutoplay: true,
//If set as true, found Youtube video will be played automatically.

pauseOnYoutube: true,
//If set as true, You cannot activate Assistant during youtube playing. Recommended for the performance (Because always listening of hotword detector might make performance lower)
```


## MMM-TelegramBot & Other module can query.
- If you are using `MMM-TelegramBot`, `/q YOUR_QUERY` could be transmitted to Assistant. The response will come to MM.

- Or your other module can also request query with notification
```
this.sendNotification("ASSISTANT_QUERY", "what time is it now")
```
