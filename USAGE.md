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
