#!/bin/bash
# +--------------------------------+
# | npm postinstall                |
# | AMK2 v3 Installer by Bugsounet |
# +--------------------------------+

# get the installer directory
Installer_get_current_dir () {
    SOURCE="${BASH_SOURCE[0]}"
    while [ -h "$SOURCE" ]; do
      DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
      SOURCE="$(readlink "$SOURCE")"
      [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
    done
    echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"

source utils.sh
# del last log
rm installer.log 2>/dev/null

# logs in installer.log file
Installer_log

# check version
Installer_version="$(cat ../package.json | grep version | cut -c15-19 2>/dev/null)"

# Let's start !
Installer_info "Welcome to AssistantMk2 v $Installer_version postinstall"
echo

# Check not ran as root
if [ "$EUID" -eq 0 ]; then
    Installer_error "npm install must not be used as root" 
    exit 1
fi

# Check platform compatibility
dependencies=(git sox wget libasound2-dev sox libsox-fmt-all gcc-7 nano)
case "$OSTYPE" in
    linux*)     platform="linux"
                arch="$(uname -m)"
                os_name="$(cat /etc/*release | grep ^ID= | cut -f2 -d=)"
                os_version="$(cat /etc/*release | grep ^VERSION_ID= | cut -f2 -d= | tr -d '"')"
                dependencies+=(alsamixer aplay arecord libsox-fmt-mp3)
                ;;
    darwin*)    platform="osx"
                arch="$(uname -m)"
                os_name="$(sw_vers -productName)"
                os_version="$(sw_vers -productVersion)"
                dependencies+=(osxdep)
                ;;
    *)          Installer_error "$OSTYPE is not a supported platform"
                exit 1;;
esac

if  [ "$platform" == "osx" ]; then
  Installer_error "Actualy not completed for $OSTYPE"
  echo
  exit 1
fi

Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
source utils_$platform.sh
echo

# check dependencies
Installer_info "Check all dependencies..."
Installer_check_dependencies
Installer_success "All Dependencies needed are installed !"
echo

# force gcc v7
Installer_info "Check GCC Version..."
Installer_check_gcc7
Installer_success "GCC 7 is set by default"
echo

# all is ok than electron-rebuild
Installer_info "Electron Rebuild" 
Installer_electronrebuild
Installer_success "Electron Rebuild Complete!"

# the end...
Installer_exit "AssistantMK2 is now installed !"
