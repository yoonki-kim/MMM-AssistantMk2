## 1. Pre-dependencies
```sh
sudo apt-get install libatlas-base-dev sox libmagic-dev
```

## 2. Install Snowboy from repository
```sh
cd ~/MagicMirror/modules/MMM-AssistantMk2
git clone https://github.com/Kitt-AI/snowboy.git
cd snowboy
npm install
```
There could be many warnings or errors. No matter what, do these;
```sh
./node_modules/node-pre-gyp/bin/node-pre-gyp clean configure build
```
Then Check these two points.
- whether `index.js` exists in `snowboy/lib/node`
```sh
ls lib/node
```
- whether `snow.node` exists in `snowboy/lib/node/binding/Release/[YOUR_ENVIRONMENT]`
```sh
ls lib/node/binding/Release
```
There could be some directory similar with `node-V67-darwin-x64` or `node-V48-linux-arm` or something.
And there sould be `snow.node`.

## 3. Electron rebuilding
For `Electron` of MagicMirror, it should be rebuilt.
```sh
cd ~/MagicMirror/modules/MMM-Hotword/node_modules/snowboy
npm install electron-rebuild
./node_modules/.bin/electron-rebuild
```
If success, you should have a directory which has `electron-v2.0-darwin-x64` or `electron-v2.0-linx-arm` or somthing similar as name in `snowboy/lib/node/binding/Release`.
```sh
ls lib/node/binding/Release
```
