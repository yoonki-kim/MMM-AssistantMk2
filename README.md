# MMM-AssistantMk2
![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/AMk2_Big.png)
`MMM-AssistantMk2` is an embedded Google assistant on MagicMirror.

## NEW UPDATES

**3.1.0-4 (XX/02/2020)**
 * **ADD**: add new function for addons-recipe (socketExec, onSocketExec)
 * **BUG**: continous conversation bug - infinite loop on no user response

**3.1.0-3 (07/02/2020)**
 * **BUG**: correct issue with no response audio and play-sound (freeze)
 
**3.1.0-2 (05/02/2020)**
 * **DELETE/MOVE**: addonsConfig:{} is noved to addons/addons.js
 * **ADD/CONFIG**: addons: BOOLEAN to activate or not addons.js
 * **ADD**: touch icon to activate assistant

## [**Preview Video**](https://youtu.be/e7Xg95mL8JE)

## Screenshot
- Classic UI

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/previewUI.jpg)

- FullScreen UI

![](https://raw.githubusercontent.com/eouia/MMM-AssistantMk2/master/resources/previewFS.jpg)

## What is updated on V3
- Fully rebuild from scratch.
- More stable.
- Installer is served. (For Raspbian or any Debian-based Linux)
- Annoying audio output dependencies are deprecated. Simply using standard HTML5 audio output.
- `plugin` and `responseHook` are added.
- screen output is more controllable.
- customizable UI.
- pre-built recipes are served.
- Easier `custom action` managing.

## Installation & Guides
Read the docs in [wiki](https://github.com/eouia/MMM-AssistantMk2/wiki)

## Update from 2.x
Not easy. Remove existence then reinstall fresh.
- You'd better backup your `credentials.json` and profiles.

## UPDATE HISTORY

**3.1.0-1 (30/01/2020)**
  * **ADD/CONFIG:** ability to add a personal addons in node_helper (addons.js)
  * **ISSUE:** correct mmap issue :
    * choice HTML5 audio or native audio
  * **CONFIG:** reduce CPU usage by ability to disable animated icons
  * **ADD:** volume control via [MMM-Volume](https://github.com/eouia/MMM-Volume)
  * **ADD/CONFIG:** ability to use static icons
  * **CONFIG:** ability to use personal chimes
  * **ADD:** npm install with new dependencies
  * **ADD:** added update script (npm run update)

**3.0.2 (2020-01-23)**
- CHANGED : To use smaller memory, `bufferToWav` is changed to `bufferToMP3` and some logic improved.

**3.0.1 (2020-01-22)**
- fixed: `node-record-lpcm16` issue. (Mic not working issue.)


## Last Tested
- MagicMirror : 2.10.0
- RPI 3B+ / raspbian 10 /nodeJS v10.17.0 / npm 6.13.2
- MacOS Catalina 10.15.2 / MacBookPro 2017 15" / nodeJS v11.12.0 / npm v6.9.0
- debian 10 / nodeJS v10.18.0 / npm v6.13.4




## Credits
- Author :
  - @eouia
  - @bugsounet
  - @Anonym-tsk
- License : MIT
  - **By terms of Google Assistant SDK, You are not allowed to use or provide this module for commercial purpose.**
