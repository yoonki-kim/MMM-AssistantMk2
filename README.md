## MMM-AssistantMk2 [Archived and Deprecied]
`MMM-AssistantMk2` is an embedded Google assistant on MagicMirror.

### Screenshot
[![2.1.0 demo](https://img.youtube.com/vi/7yI_9NfhpwI/1.jpg)](https://youtu.be/7yI_9NfhpwI)

### New Update
#### [2.1.4] - 2019.03.26
- Added : Now you can use `recipes`. https://github.com/eouia/MMM-AssistantMk2/wiki/Usage#recipes
    
  `recipe` is an external js file containing definitions of `command`, `transcriptionHook` and `action`. Your configuration could be shorter.
  
  Feel free to request PR to share your recipes to others.
- Changed : `onIdle`, `onDetected` features are disabled by default.

- For update from 2.1.0
```
cd ~/MagicMirror/modules/MMM-AssistantMk2
git pull
```

### Install & Update
Read [WIKI:Installation](https://github.com/eouia/MMM-AssistantMk2/wiki/Installation)

### Configuration
Read [WIKI:Configuration](https://github.com/eouia/MMM-AssistantMk2/wiki/Configuration)

### Usage
Read [WIKI:Usage](https://github.com/eouia/MMM-AssistantMk2/wiki/Usage)


#### Incoming Notifications as ASSISTANT request.
|Notification|Payload|Description|
|---|---|---|
|ASSISTANT_ACTIVATE|{profile:`String`}|Assistant will start with this profile name.
|ASSISTANT_CLEAR|null|Current playing video or content will disappear. Assistant will turn to sleep mode for waiting invocation.
|ASSISTANT_QUERY| `String` | Ask to Assistant about `String`,
|ASSISTANT_SAY| `String` or `{text:String, lang:"en-US"}` | Assistant will say this `String`

#### Outgoing Notifications as ASSISTANT response.
|Notification|Payload|Description|
|---|---|---|
|ASSISTANT_ACTIVATED|null|Assistant is started now.
|ASSISTANT_DEACTIVATED|null|Assistant is stopped now.
|ASSISTANT_HOOK|{hook:"`HOOKED_STRING`"}|Your defined hooking phrase caught from your speech.
|ASSISTANT_ACTION|`FOUND_ACTION_OBJECT`|When the response is defined or customized action of Assistant.


### Last Tested (2019-Jul-17)
- MagicMirror : 2.8.0
- nodeJS : 8.11.3 & 10.16.x
- SBC(OS) : Asus TinkerBoard(TinkerOS) & Raspberry Pi 3 B+(Raspbian Buster), Raspberry Pi 4 B+(Raspbian Buster).
- Raspbian Jessie or RPI 0 will not work.
