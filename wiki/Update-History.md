#### Lastest: [2.1.4] - 2019.03.26
- Added : Now you can use `recipes`. `recipe` is extern js file to contain definitions of `command`, `transcriptionHook` and `action`. Your configuration could be more shorter.
- Changed : `onIdle`, `onDetected` features are disabled by default.


#### [2.1.3] - 2019.03.07
- Changed : `verbose:true` by default for convenience of debugging
- Added : Two notifications are added (Request from @ejay-ibm)
  - ASSISTANT_UNDERSTOOD : this notification will be bursted when user saying is finished and understood by Assistant.
  - ASSISTANT_RESPONSE_END : this notification will be bursted when Assistant's voice responsing is ended.

#### [2.1.2] - 2018.12.12
- Fixed: Youtube playlist playing bug
- Added:
  - youtubePlayerVars
  - youtubePlayQuality - This is not worked any more. It is deprecated from Youtube API. Sorry.


#### [2.1.1] - 2018.11.23
- TTS feature is added. Now, Other modules can request MMM-AssistantMk2 to say something. It can be used like something similar TEXT-TO-SPEECH. By example, you can build your customClock module to say the current time via MMM-AssistantMk2
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