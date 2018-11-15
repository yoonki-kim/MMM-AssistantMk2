# INSTALLATION (2.0.0)

## I. Sound Check
### 1. Mic for recording
  - You should be able to record your voice with at least one of these programs.
   - arecord (default, recommended for Raspbian or Debian)
   - rec
   - sox
  - You should know your mic device Id (card and number). By example, in below case, your mic device will be `plughw:1,0`. Remember it.
```
arecord --device=plughw:1,0 test.wav
```

### 2. Speaker for playing
  - You should be able to play any `.mp3` or `.wav` in your Shell terminal with command.
  - Different with Mic, Speaker will be set as default device in most of environments. But if it needs, find a proper device Id.
  - Below player programs are supported
    - mpg321 (default, recommended)
    - mplayer
    - afplay
    - mpg123
    - play
    - omxplayer (not recommended, because there could be some time gap before playing.)
    - aplay (As I know, MP3 is not able to be played with this program. WAV only. You should modify config when you use this program.)
    - cmdmp3
  - If you want to install `mpg321`, follow below.
```
sudo apt-get install mpg321
```

## II. Update from previous (1.x.x) version
### When you have no problem with previous version
```
cd ~/MagicMirror/modules/MMM-AssistantMk2
git pull
npm install --save play-sound
```
- Some config structures are changed. Rewrite your configuration.
- You also need new update of `MMM-Hotword` if you want to use Hotword activating.

### Who want fresh installation
- First, backup your `profiles` directory and your `credentials.json`
- Remove your `MMM-AssisntaMk2` directory.
- Do `III. Install module` steps and skip `IV. Google Assistant Setup`.
- Restore your backups to expected locations.

## III. Installation
### 1. Install pre-dependencies
```sh
sudo apt-get install libasound2-dev sox libsox-fmt-all
```

### 2. Install Module
```sh
git clone https://github.com/eouia/MMM-AssistantMk2.git
cd MMM-AssistantMk2
npm install
cd scripts
chmod +x *.sh
```
There could be some warnings, but it gives no harm for using.

If your mirror is running as `SERVERONLY` mode(executed by `node serveronly`), no other installation step is needed.


### 3. Post-Installation
But if you want to run your mirror as `KIOSK` mode(executed by `npm start`), you should rebuild binaries to match with electron. You will meet this or something similar errors on running MM.

```
NODE_MODULE_VERSION 59. This version of Node.js requires
NODE_MODULE_VERSION 57. Please try re-compiling or re-installing
```

If then, try this.
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild   # It could takes 10~30 minutes.
```

When you meet this kinds of errors;
```
gyp ERR! stack Error: make failed with exit code: 2
```
See this page;
https://github.com/nodejs/node-gyp/issues/809


## IV. Google Assistant Setup
### Get Auth and credentials to make profile.
1. Create or open a project in the [Actions Console](https://console.actions.google.com/)
2. After creation, Enable `Google Assistant API` for your project in the [Cloud Platform Console](https://console.cloud.google.com/)
3. Return to Actions Console and Follow the instructions to [register a device model](https://developers.google.com/assistant/sdk/guides/service/python/embed/register-device)<br>
(If you cannot find `Device registration` menu, you can use this URL https://console.actions.google.com/u/[0]/project/[yourprojectId]/deviceregistration/) (change [] to your project) or [Manual registration](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual))

4. In register steps(step 2), you can download your `credentials.json` for OAuth. Carefully store it in `MMM-AssistantMk2` directory.
 - Or you can find your credentials from [Cloud Platform Console](https://console.cloud.google.com/) (Your Project > APIs & Services > Credentials)
5. In your SBC, you can run auth-tool for authentification. (not via SSH)
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
node auth_and_test.js
```
   a. If you meet some errors related with node version, execute `npm rebuild` and try again.

   b. At first execution, this script will try opening a browser and getting permission of a specific user for using this Assistant. (So you'd better to execute this script in your RPI shell, not via SSH)

   c. After confirmation, Some code (`4/ABCD1234XXXXX....`) will appear in the browser. Copy that code and paste in your console's request (`Paste your code:`)

   d. On success, Prompt `Type your request` will be displayed. Type anything for testing assistant. (e.g; `Hello`, `How is the weather today?`)

   e. Now you can find `token.json` in your `MMM-AssistantMk2` directory. Move it under `profiles` directory with rename `default.json`. This will be used in module as `default` profile.

 ```sh
 mv token.json ./profiles/default.json
 ```
  f. If you want to make more profiles(for your family??), do the step 5 again. and move the `token.json` generated to profiles directory with another profile name, and don't forget setting your configuration.
```sh
mv token.json ./profiles/mom.json
```

### Get `deviceModelId` and `deviceInstanceId`
> If you are not an expereienced developer or don't need `gactions` implements, pass this section.

If you want not only pure Assistant embeding but also customized gactions for device, you might need to get `deviceModelId` and `deviceInstanceId`. To help understanding, **deviceModel** is something like `Volkswagen Golf` or `MagicMirror` and **deviceInstance** is something like `mom's car` or `mirror in living room`.

#### For `deviceModelId`
You can get `deviceModelId` as a result of previous [register a device model](https://developers.google.com/assistant/sdk/guides/service/python/embed/register-device) step. In `Device registration` menu in `Actions Console`, you can find it.

#### For `deviceInstanceId`
You need additional `google-assistant-sdk` library. See [
Manually Register a Device with the REST API](https://developers.google.com/assistant/sdk/reference/device-registration/register-device-manual#get-access-token) page.

## V. Additional
- If you want to activate this module with your voice, you need `MMM-Hotword`. Install it also. (https://github.com/eouia/MMM-Hotword)
