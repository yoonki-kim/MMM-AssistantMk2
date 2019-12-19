# Developer Notes
---
# Change Logs
## 2019/12/18 -- eouia
- Refactoring logics about handling response.
  - Many codes are missing due to Refactoring, sorry.
- plugins, transcriptionHooks, actions be implemented. (Some features still could be missing. I'll do later). Read added docs.
- Basically, I want to keep this module as simple and universal as possible. If extended features be needed, it should be extendable with a recipe instead adding specific code for that feature to module source.
By Example, I don't want to add `YouTube` related feature to module code itself. Instead, serve `youtube.recipe.js` for that. If needed, some kind of code which be required for making extended recipe, could be implemented, but not specific feature itself.


## 2019/12/17
- Create postinstall script
- Remove MyMagicWord and take place to new

## 2019/12/15 &3 -- Bugsounet
- Upload myMagicWord help documents

## 2019/12/15 &2 -- Bugsounet
- Add SoundExec code in hook
- Create recipe `test_with_soundExec.js` sample

## 2019/12/15 -- Bugsounet
- Correct recipe issue in `MMM-Assistant.js`
- Adjust `Hook icon` and by-pass
- correct lockidentifier in `fullScrenn()`
- (add visual `demo()` icons ... maybe for later)

## 2019/12/14 -- Bugsounet
- Add Hook icon (not tested recipe issue)
- Write `displayTranscription(text)` for write text in AMK2_TRANSCRIPTION field
- Add `MyMagicWord` Feature For IFTTT magicword real say mode
- Add default Translation to EN and complete FR
- Add `TelegramBot Command /s & /q`
- Add code `ASSISTANT_SAY <text>` / `ASSISTANT_QUERY <text>`

## 2019/12/13 -- Bugsounet
- **my approach of the end of the foundHook code** -- test ok by force-mode (conf developer)
- create endHook(sound) payload : name of the mp3 sound to play for confirm
- correct fullScreen(screen) screen: true -> fullscren mode // false -> close fullscreen (with animation)

## 2019/12/13 -- eouia
**[commit:eouia_191213]**
- Still working, not completed. just snap.
- basic `commands`, `plugins`, `transcriptionHooks` mechanism added.
- Replace `HOTWORD_RESUME` or similar works to `plugins` (See `recipes/with-MMM-Hotword.js`)
- I'll refactor strategy of conversation and response flow. I don't like current.

## 2019/12/10 -- Bugsounet
- Correct fullscreen Hidden / Showing
- Add Official Google Open / Close Beep (will be use later)

## 2019/12/10 -- eouia
**[commit:eouia_191210_1]**
- configuration merging with `configAssignment` - **this.config.debug will not set for components (Bugsounet)**

## 2019/12/09 -- eouia
**[commit:eouia_191209]**
- Retry Query by TEXT when transcription exists but not `done:true`
- *fix configuration merging.* - **It will back again tomorrow. I found some mistakes.**
- Cleaning indentation convention. (Sorry, I prefer `2 spaces` conventions than `tab` on github project.)

## 2019/12/09 -- Bugsounet

- create translation FR / EN for error
- create chime (activate / error / continue) and feature UseChime (true/false)
- create if UsefullScreenAnswer set to false (only show icon)
- correct showmodule (true/false)
- correct little bug with continuous conversation and display
- create script to display status when activeassistant (using types / continous converstation)
- css dispatch fullscreen or not
- send status notification to other modules
- create logo for AMk2 v3 (big and small)

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/3-dev/resources/AMk2_Small.png)

## 2019/12/08 -- Bugsounet

- write fullscreen css AMK2 v3
- create icon and display style with full animated icons

## 2019/12/06 -- Bugsounet

- add FullScreenAnswer Feature
- to eouia > correct merge this.config / this.default / this.helperConfig
- temp code to correct this merge

## 2019/12/04 -- Bugsounet

- write main loop
- debug -> continue conversation seems to be ok (see eouia inspection)
- to eouia > can you see MMM-Hotword, afterRecordLimit does not work when there is silence but when there some noise <---- ok issue closed
- ret.key -> change it : ret.key = "modules/MMM-Hotword/" + afterRecord
- create tmp folder -> error when writing tmp file


## 12/06 -- eouia
- Annoying case - `TOO_SHORT` : Usually it happenes when transcription Recognition fails from Google.
```
[AMK2:AS] CONVERSATION:TRANSCRIPTION { transcription: 'how is the way', done: false }
[AMK2:AS] CONVERSATION:TRANSCRIPTION { transcription: 'how is the weather', done: false }
[AMK2:AS] CONVERSATION:RESPONSE
[AMK2:AS] CONVERSATION_ALL_RESPONSES_RECEIVED
[AMK2:AS] CONVERSATION_END:COMPLETED
[AMK2:AS] CONVERSATION_PP:RESPONSE_AUDIO_TOO_SHORT_OR_EMPTY -  50
[AMK2] { session: 1575819784757,
  error: 'TOO_SHORT',
  action: null,
  text: null,
  screen: null,
  audio: null,
  transcription: { transcription: 'how is the weather', done: false },
  continue: false,
  lastQuery:
   { type: 'WAVEFILE',
     profile: { profileFile: 'default.json', lang: 'ko-KR' },
     key:
      '/Users/eouia/Documents/nodeJS/MagicMirror/modules/MMM-Hotword/temp/afterRecording.wav',
     lang: null,
     useScreenOutput: true,
     useAudioOutput: true,
     session: 1575819784757 } }
```
- Have you experienced? In this case,(If `TOO_SHORT` && `transcription.done:false` && `transcription.transcription:something not null`), Is it better to query again by TEXT with `transcription.transcription` ?
- Bugsounet ->> I have it sometime, i have not inpect this bug

---
# Testing

## RPI and Debian Testing (Bugsounet) (2019/15/12)
### Debian : Buster -- Dev VM platform on Windows 10
### RPI : Buster
- grpc: 1.23.4
- google-assistant : 0.60
- node: v10.17.0
- gcc: 7.3.0
- electron-rebuild: 1.8.8
- MagicMirror: 2.9.0
- npm: 6.13.2
--> install : ok
--> run : ok
--> It run in prod for discover some bugs
---
# BuGs to solves
* ?
---
# Todo (2019/12/15)
* test in other platform --> ?
* review *design code* --> eouia
* screen_output.css --> bugsounet
* real translate error (inventory) --> bugsounet / eouia
* RPI optimization --> eouia
* Real Cleaning...
* npm install --> bugsounet
