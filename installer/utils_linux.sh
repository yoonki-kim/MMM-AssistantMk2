#!/bin/bash
# -----------------------
# Linux specific commands
# v1.0.1
# -----------------------
 
#  Installer_update
Installer_update () {
  sudo apt-get update -y
}

# indicates if a package is installed
# 
# $1 - package to verify
Installer_is_installed () {
  hash "$1" 2>/dev/null || (dpkg -s "$1" 2>/dev/null | grep -q "installed")
}

# install packages, used for dependencies
#
# $@ - list of packages to install
Installer_install () {
  sudo apt-get install -y $@
  sudo apt-get clean 
}

# remove packages, used for uninstalls
#
# $@ - list of packages to remove
Installer_remove () {
  sudo apt-get remove $@
}

Installer_debug "[LOADED] utils_linux.sh"
