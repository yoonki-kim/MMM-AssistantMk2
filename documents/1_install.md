# Installation

In AMK2 v3, we have created automatic installer for RaspberryPi and Linux machines.

Auto install script will propose to install needed dependencies, compatible gcc version and rebuild `grpc` module for electron of MagicMirror.

It can also check your audio configuration and allows the generation of your micConfig section.

Of course you can also, if you wish, do a manual installation. (npm install will ask you)

For OSX machines, auto install script is not yet implented, manuel installation is nedeed.

## 1. Auto install (for RaspberryPi or Debian Linux machines only)
```sh
cd <YOUR_MAGIC_MIRROR_DIRECTORY>

cd modules
git clone https://github.com/eouia/MMM-AssistantMk2

cd MMM-AssistantMk2
npm install

```

## 2. Manual Install

> For OSX Auto install script is not yet implented
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
git clone https://github.com/eouia/MMM-AssistantMk2

cd MMM-AssistantMk2
npm install
```

Then, you need to rebuild `grpc` module for electron of MagicMirror.
```sh
npm install --save-dev electron-rebuild
./node_modules/.bin/electron-rebuild
```

## 3. Troubleshooting
> I hope this would not be long, and we will be reactive :)

