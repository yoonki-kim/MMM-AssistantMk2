#!/bin/bash
# ---------------------
# OSX specific commands
# v0.1.0 NOT TESTED
# ---------------------
 
#   Installer_update
Installer_update () {
  if ! hash brew 2>/dev/null; then
    if Installer_yesno "You need Homebrew package manager, install it?"; then
      ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null 2> /dev/null
    fi
  fi
  brew update
}

# indicates if a package is installed
# 
# $1 - package to verify
Installer_is_installed () {
  hash "$1" 2>/dev/null || brew ls --versions "$1" >/dev/null
}

# install packages, used for dependencies
#
# $@ - list of packages to install
Installer_install () {
  if ! hash brew 2>/dev/null; then
    if Installer_yesno "You need Homebrew package manager, install it?"; then
      ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" < /dev/null 2> /dev/null
    fi
  fi
  local to_install=""
  for formula in "$@"; do
    Installer_is_installed "$formula" || to_install+=" $formula"
  done
  [ -z "$to_install" ] && return # nothing to install
  brew install $@
}

# remove packages, used for uninstalls
#
# $@ - list of packages to remove
Installer_remove () {
  # assuming brew is installed
  local to_remove=""
  for formula in "$@"; do
    Installer_is_installed "$formula" && to_remove+=" $formula"
  done
  [ -z "$to_remove" ] && return # nothing installed to remove
  echo "The following packages will be REMOVED:"
  echo "$to_remove"
  Installer_yesno "Do you want to continue?" && brew uninstall $to_remove
}
Installer_debug "[LOADED] utils_osx.sh"
