## MMM-AssistantMk2
`MMM-AssistantMk2` is an embedded google assistant on MagicMirror.

### Screenshot
[![2.1.0 demo](https://img.youtube.com/vi/7yI_9NfhpwI/1.jpg)](https://youtu.be/7yI_9NfhpwI)

### New Update
#### [2.1.4] - 2019.03.26
- Added : Now you can use `recipes`. https://github.com/eouia/MMM-AssistantMk2/wiki/Usage#recipes
    
  `recipe` is an external js file containing definitions of `command`, `transcriptionHook` and `action`. Your configuration could be more shorter.
  
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
|ASSISTANT_CLEAR|null|Current playing video or content will disappear. And Assistant will turn to sleep mode for waiting invocation.
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


### Known Issues
- Invalid Parameters when youtube playing : Most of those cases, owner of video doesn't allow playing video out of youtube. try another.
- Sometimes response without voice. : Yes, Google Tech team also knows that.
- Some functions are not supported : Originally, screen output is made for REAL SMART TV (e.g. LG TV) with Google Assistant, thus REAL TV can interact the screen output with remotecontroller or something automatic processed. but we aren't.
- Result of Image search? web search? : I'm considering how it could be used. it is not easy as my expectation.

#### Some Troubleshootings more
- Error: /urs/lib/arm-linux-gnueabihf/libstdc++.so.6: version 'GLIBCXX_3.4.21' not found
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install build-essentials
sudo apt-get install gcc-5   #or gcc-7
```
- grpc Electron-rebuild or `Raspbian Buster` issues. (on Raspbian Buster)
Downgrade your gcc to gcc7. (default of Buster would be gcc8)
```sh
sudo apt-get install gcc-7
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 10
sudo update-alternatives --config gcc
# Then select gcc-7 
```
Then try `electron-rebuild` again.

### TODO
- debugging??
- Touchscreen friendly
- If response has additional info with external web page, showing full website. (But... how to control? eg. scrolling???)
- map or carousel displaying... (screenOut for Assistant was developed for TV device, so not perfectly matched with UX on Mirror.)
