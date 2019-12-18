#!/bin/bash

# debug mode
Installer_debug=false

# directory where the script is installed
Installer_dir=

# user's platform (linux, osx)
platform=

# user's architecture (armv7l, x86_64)
arch=

# user's OS name (raspbian, ubuntu, Mac OS X...)
os_name=

# check if all dependencies are installed
Installer_check_dependencies () {
	Installer_debug "Test Wanted dependencies: ${dependencies[*]}"
    local missings=()
    for package in "${dependencies[@]}"; do
        Installer_is_installed "$package" || missings+=($package)
    done
    if [ ${#missings[@]} -gt 0 ]; then
        Installer_warning "You must install missing dependencies before going further"
        for missing in "${missings[@]}"; do
            Installer_error "Missing package: $missing"
        done
        Installer_yesno "Attempt to automatically install the above packages?" || exit 1
        Installer_info "Installing missing package..."
        Installer_update || exit 1
        Installer_install ${missings[@]} || exit 1
    fi
    
    if [[ "$platform" == "linux" ]]; then
        if ! groups "$(whoami)" | grep -qw audio; then
            Installer_warning "Your user should be part of audio group to list audio devices"
            Installer_yesno "Would you like to add audio group to user $USER?" || exit 1
            sudo usermod -a -G audio $USER # add audio group to user
            Installer_warning "Please logout and login for new group permissions to take effect, then restart npm install"
            exit
        fi
    fi
}

# check the version of GCC and downgrade it if it's not 7
Installer_check_gcc7 () {
	Installer_debug "gcc: $Installer_gcc"
	Installer_debug "gcc revision: $Installer_gcc_rev"
	Installer_debug "gcc version: $Installer_gcc_version"
	if [[ "$Installer_gcc_version" != "7" ]]; then
		Installer_debug "Forced script to reconize as GCC 8"
		Installer_warning "You are using GCC $Installer_gcc_version, this is not compatible with this program."
		Installer_warning "You have to downgrade to GCC 7."
		Installer_yesno "Do you want to make changes ?" || exit 1
		Installer_info "Installing GCC 7..."
		sudo apt-get install gcc-7 >/dev/null || exit 1
		Installer_success "GCC 7 installed"
		Installer_info "Making GCC 7 by default..."
		sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 10 >/dev/null || exit 1
		sudo update-alternatives --config gcc >/dev/null | exit 1
	fi
}


# Do electron rebuild
Installer_electronrebuild () {
	cd ..
	Installer_pwd="$(pwd)"
	Installer_debug "Current diectory: $Installer_pwd"
	Installer_info "Installing electron-rebuild..."
	Installer_debug "npm install --save-dev electron-rebuild"
	npm install --save-dev electron-rebuild >/dev/null || exit 1
	Installer_success "Electron-rebuild installed"
	Installer_info "Execute electron-rebuild..."
	Installer_warning "It could takes 10~30 minutes."
	Installer_debug "./node_modules/.bin/electron-rebuild"
	./node_modules/.bin/electron-rebuild 2>/dev/null || exit 1
}
	
# add timestamps and delete colors code for log file
Installer_add_timestamps () {
    while IFS= read -r line; do
        echo "$(date "+%D %H:%M") $line" | sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]//g"
    done
}

# color codes
_reset="\033[0m"
_red="\033[91m"
_orange="\033[93m"
_green="\033[92m"
_gray="\033[2m"
_blue="\033[94m"
_cyan="\033[96m"
_pink="\033[95m"

# Display a message in color
# $1 - message to display
# $2 - message type (error/warning/success/debug/question)
# $3 - color to use
Installer_message() {
	if $Installer_debug; then
        echo -e "$3[$2] $1$_reset"
    else
        echo -e "$3$1$_reset"
    fi
}

# Displays question in cyan
Installer_question () { Installer_message "$1" "Question" "$_cyan" 1>&2 ;}

# Displays a error in red
Installer_error() { Installer_message "$1" "Error" "$_red" 1>&2 ;}

# Displays a warning in yellow
Installer_warning() { Installer_message "$1" "Warning" "$_orange" ;}

# Public: Displays a success in green
Installer_success() { Installer_message "$1" "Success" "$_green" ;}

# Displays an information in blue
Installer_info() { Installer_message "$1" "Info" "$_blue" ;}

# Displays debug log in gray (if debug actived)
Installer_debug() { 
  if $Installer_debug; then
    Installer_message "$1" "Debug" "$_gray" ;
  fi
}

# Asks user to press enter to continue
Installer_press_enter_to_continue () {
    Installer_question "Press [Enter] to continue"
    read
}

# Exit 
Installer_exit () {
	echo
	Installer_success "$1"
	Installer_press_enter_to_continue
       
    # reset font color
    echo -e "$_reset\n"
    
    exit
}
    
# YesNo prompt from the command line
Installer_yesno () {
    while true; do
		Installer_question "$1 [Y/n] "
        read -n 1 -p "$(echo -e $_cyan"Your choice: "$_reset)"
        echo # new line
        [[ $REPLY =~ [Yy] ]] && return 0
        [[ $REPLY =~ [Nn] ]] && return 1
    done
}

# Log to installer.log
Installer_log () {
	exec > >(tee >(Installer_add_timestamps >> installer.log)) 2>&1
}

# display gcc version
Installer_gcc="$(gcc --version | grep gcc)"
Installer_gcc_rev="$(echo "${Installer_gcc#g*) }")" 
Installer_gcc_version="$(echo $Installer_gcc_rev | cut -c1)"
