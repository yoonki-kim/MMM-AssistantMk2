#!/bin/bash
# -----------------------
# Linux specific commands
# v1.0.0
# -----------------------
 
#   Installer_update
Installer_update () {
    sudo apt-get update -y >/dev/null
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
    sudo apt-get install -y $@ >/dev/null
    sudo apt-get clean >/dev/null 
}

# remove packages, used for uninstalls
#
# $@ - list of packages to remove
Installer_remove () {
    sudo apt-get remove $@ >/dev/null
}
