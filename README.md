## MMM-AssistantMk2
`MMM-AssistantMk2` is an embedded google assistant on MagicMirror.

### Screenshot
[![2.1.0 demo](https://img.youtube.com/vi/7yI_9NfhpwI/1.jpg)](https://youtu.be/7yI_9NfhpwI)

### New Update
#### [2.1.2] - 2018.12.12
- Fixed: Youtube playlist playing bug
- Added:
  - youtubePlayerVars
  - youtubePlayQuality - This is not worked any more. It is deprecated from Youtube API. Sorry.
- For update from 2.1.0
```
cd ~/MagicMirror/modules/MMM-AssistantMk2
git pull
```

### Install & Update
Read [INSTALL.md](/INSTALL.md)

### Configuration
Read [CONFIGURATION.md](/CONFIGURATION.md)

### Usage
Read [USAGE.md](/USAGE.md)


#### Incoming Notifications as ASSISTANT request.
|Notification|Payload|Description|
|---|---|---|
|ASSISTANT_ACTIVATE|{profile:`String`}|Assistant will start with this profile name.
|ASSISTANT_CLEAR|null|Current playing video or content will be disappeared. And Assistant turns to sleep mode for waiting invocation.
|ASSISTANT_QUERY| `String` | Ask to Assistant about `String`,
|ASSISTANT_SAY| `String` or `{text:String, lang:"en-US"}` | Assistant will say this `String`

#### Outgoing Notifications as ASSISTANT response.
|Notification|Payload|Description|
|---|---|---|
|ASSISTANT_ACTIVATED|null|Assistant is started now.
|ASSISTANT_DEACTIVATED|null|Assistant is stopped now.
|ASSISTANT_HOOK|{hook:"`HOOKED_STRING`"}|Your defined hooking phrase is caught in your speech.
|ASSISTANT_ACTION|`FOUND_ACTION_OBJECT`|When the response is defined or customized action of Assistant.


### Tested
- MagicMirror : 2.5.1
- nodeJS : 8.11.3 & 10.0.x
- SBC : Asus TinkerBoard & Raspberry Pi 3 / Kiosk mode and Serveronly mode both work.
- `Raspbian Stretch` is recommended. Many problems would be possible in `Raspbian Jessie`.
- on Pi Zero (or ARMv6 Architecture), You might need to rebuild modules from source. That is out of my ability, so I cannot help about that.


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
sudo apt-get install gcc-5
```
- grpc Electron-rebuild issues. (until proper binaries provided)
`grpc` was updated recently, but their team havn't dispatched proper binaries for new version. So it could make problem when you try electron-rebuild.
Here are some experimental trials;
1) use `grpc-js` instead `grpc`
```
cd ~/MagicMirror/modules
rm -rf MMM-AssistantMk2/
git clone https://github.com/eouia/MMM-AssistantMk2
cd MMM-AssistantMk2
npm install
cd node_modules
rm -rf grpc
cd ..
npm install @grpc/grpc-js
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild
```
2) downgrade grpc to v1.13
```
cd ~/MagicMirror/modules
rm -rf MMM-AssistantMk2/
git clone https://github.com/eouia/MMM-AssistantMk2
cd MMM-AssistantMk2
npm install
cd node_modules
rm -rf grpc
cd ..
npm install grpc@1.13
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild
```


### Old Updates
#### [2.1.1] - 2018.11.23
- TTS feature is added. Now, Other modules can order MMM-AssistantMk2 to say something. It can be used like something similar TEXT-TO-SPEECH. By example, you can build your customClock module say current time via MMM-AssistantMk2
  - USAGE:
    - `this.sendNotification("ASSISTANT_SAY", "Time to go to bed")`
    - `this.sendNotification("ASSISTANT_SAY", {text:"C'est trop chaud", lang:"fr-FR"})`
  - NOTICE:
    - This feature is somekind of Assistant hooking. If you say "Repeat after me SOMETHING", Google Assistant will repeat SOMETHING. So, there could be a possibility of not responding as intend. Too long or complex text might be not available.
    - Currently I can't find correspondence of `Repeat after me` for **German/Japanese/Korean** language. PR please.
  - Thanks to [Valerio Pilo](https://github.com/vpilo). His brilliant idea and PR could make this feature.
- For TelegramBot, TTS feature is also added. Now you can make your Home Mirror to say something with MMM-TelegramBot even you are in your office.
  - `/s Please open the door, mom!`
- Youtube playing status in frontend dev console added.
  - At least you can get status of Youtube player event when video fails to be played.
- For update from 2.1.0
```
cd ~/MagicMirror/modules/MMM-AssistantMk2
git pull
```

#### [2.1.0] - 2018.11.14
- Customizable `command` feature is added. Now you can control your device and MM without other module's help.
  And notification system of `transcriptionHook` is changed. New configuration is needed.
- Prepared hook commands. Say these (Or customize them in configuration)
  - `hide all` : modules on screen will be hidden
  - `show all` : hidden modules will be shown again
  - `reboot yourself` : reboot device
  - `shutdown yourself` : shutdown device
  - `go to sleep` : LCD power off (you might need to modify `/scripts/screenoff.sh`)
  - `wake up` : LCD power on (you might need to modify `/scripts/screenon.sh`)
- `onIdle` feature be added. After `timer` without no query after last query, `command` will be activated. (By default, after 30min All modules will be hidden.)
- And `onActivate` feature is added. When you activate Assistant, this `command` will be executed after `timer`. (By default, modules hidden by `onIdle` will be shown again)
- For update from 2.0.0
```
cd ~/MagicMirror/modules/MMM-AssistantMk2
git pull
cd scripts
chmod +x *.sh
```
#### [2.0.0] - 2018.11.05
- Whole new build-up.
- Annoying `speaker` dependencies deprecated
- More stable. (I think)
- Choppy sound issue solved(I think), If you get still this issue, that might be the lack of computing power of your device.
- NotificationTrigger dependency free. Now you can activate without NotificationTrigger (But If you want, you can still use it.)
- Making Hook and GAction becomes easier
- `MMM-TelegramBot` supproted


#### [1.1.1] - 2018.10.22
- Speaker device configurable(`audio.speakerDevice`) (It might be able to fix some bugs about playing `ding.wav`)


#### [1.1.0] - 2018.10.04
- MP3 Output is supported. Now you can get more unchunky sound result.(Set `audio.encodingOut` to `MP3` // `OGG` is not yet supported.)
- `ding.wav` will be played when Assistant is ready to hear your voice.
- For update from prior version
```
sudo apt-get install mpg321
cd ~/MagicMirror/modules/MMM-AssistantMk2
git pull
npm install --save wav
```

#### [1.0.1] - 2018.07.25.
- Youtube playlist can be playable
- Some uncaught youtube videos are caught now
- On youtube player error, error code is shown
- notifyPlaying option is added.


### TODO
- debugging??
- Touchscreen friendly
- If response has additional info with external web page, showing full website. (But... how to control? eg. scrolling???)
- map or carousel displaying... (screenOut for Assistant was developed for TV device, so not perfectly matched with UX on Mirror.)
