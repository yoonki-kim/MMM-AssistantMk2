# Installation

In AMK2 v3, we have created automatic installer for RaspberryPi and Linux machines.

Auto install script will propose to install needed dependencies, compatible gcc version and rebuild `grpc` module for electron of MagicMirror.

It can also check your audio configuration and allows the generation of your micConfig section.

Of course you can also, if you wish, do a manual installation. (npm install will ask you)

For OSX machines, auto install script is not yet implented, manuel installation is nedeed.

## Requirements:
 * MagicMirror V2.10.0 and more
 * if you use raspberry pi: Raspbian Buster is needed

## 1. Auto install (for RaspberryPi or Debian Linux machines only)
```sh
cd <YOUR_MAGIC_MIRROR_DIRECTORY>

cd modules
git clone https://github.com/bugsounet/MMM-AssistantMk2

cd MMM-AssistantMk2
npm install

```

## 2. Manual Install

- Required dependencies
```sh
sudo apt-get install libasound2-dev sox libsox-fmt-all
```
> If you are using OSX, use `brew` instead `apt`

```sh
brew install sox
```
- GCC 7 Required (GCC 8 could make fails on Raspbian)
```sh
sudo apt-get install gcc-7
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 10
sudo update-alternatives --config gcc
```
> You might not need this step on OSX

- Module installation
```sh
cd <YOUR_MAGIC_MIRROR_DIRECTORY>

cd modules
git clone https://github.com/bugsounet/MMM-AssistantMk2

cd MMM-AssistantMk2
npm install
```

Then, you need to rebuild `grpc` module for electron of MagicMirror.
```sh
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild
```

## 3. Troubleshooting
console message : ```mmap() failed: cannot allocate memory.``` and no audio response is played.
* solved by `useHTML5: false` and using `playProgram: "mpg321"` in config.js file
* or by removing pulseaudio package if you don't use bluetooth

We are working around this issue
 
