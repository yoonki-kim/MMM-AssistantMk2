#!/bin/bash

# ------------------------
# Linux Check Audio Script
# v1.0.0
# ------------------------

## Check Audio outpout
Installer_checkaudio () {
  play_hw="${play_hw:-hw:0,0}"
  while true; do
    if Installer_info "Checking audio output..."
      Installer_yesno "Make sure your speakers are on press [Yes].\nPress [No] if you don't want to check." true >/dev/null; then
      echo
      Installer_debug "Actual test input config: $play_hw"
      aplay -D plug$play_hw "../resources/beep_check.wav" 2>/dev/null || Installer_error "Current configuration not working !"
      Installer_yesno "Did you hear Google beep?" true >/dev/null && break
      echo
      Installer_warning "Selection of the speaker device"
      #aplay -l
      devices="$(aplay -l | grep ^car)"
      Installer_info "$devices"
      read -p "Indicate the card # to use [0-9]: " card
      read -p "Indicate the device # to use [0-9]: " device
      play_hw="hw:$card,$device"
      Installer_info "you have selected: $play_hw"
      Installer_debug "Set Alsa conf"
      #update_alsa $play_hw $rec_hw
    else
      play_hw=""
      break
    fi
  done
}

# Check Microphone
Installer_checkmic () {
  audiofile="../tmp/testmic.wav"
  rec_hw="${rec_hw:-hw:0,0}"
  rm -f $audiofile
  while true; do
    if Installer_info "Checking audio input..."
      Installer_yesno "Make sure your microphone is on, press [Yes] and say something.\nPress [No] if you don't want to check." true >/dev/null; then
      echo
      Installer_debug "Actual test input config: $rec_hw"
      arecord -D plug$rec_hw -r 16000 -c 1 -d 3 -t wav -f S16_LE $audiofile 2>/dev/null || Installer_error "Current configuration not Working !"
      if [ -f $audiofile ]; then
      play $audiofile # trying with play ...
      Installer_yesno "Did you hear yourself?" true >/dev/null && break
    fi
      echo
      Installer_warning "Selection of the microphone device"
      #arecord -l
      devices="$(arecord -l | grep ^car)"
      Installer_info "$devices"
      read -p "Indicate the card # to use [0-9]: " card
      read -p "Indicate the device # to use [0-9]: " device
      rec_hw="hw:$card,$device"
      Installer_info "you have selected: $play_hw"
      #update_alsa $play_hw $rec_hw
    else
      rec_hw=""
      break
    fi
      rm -f $audiofile
  done
 }
 
# Updates alsa user config at ~/.asoundrc
# $1 - play_hw
# $2 - rec_hw
update_alsa () { # usage: update_alsa $play_hw $rec_hw
    Installer_warning "Updating ~/.asoundrc..."
    cat<<EOM > ~/.asoundrc
pcm.!default {
  type asym
   playback.pcm {
     type plug
     slave.pcm "$1"
   }
   capture.pcm {
     type plug
     slave.pcm "$2"
   }
}
EOM
    Installer_warning "Reloading Alsa..."
    sudo /etc/init.d/alsa-utils restart
}

Installer_debug "[LOADED] audio.sh"
# main test
#source utils.sh # load utils.sh
#Installer_checkaudio
#echo
#Installer_checkmic
#echo
#Installer_warning "This is your working configuration :"
#Installer_warning "Speaker: $play_hw"
#Installer_warning "Microphone : $rec_hw"
#echo
#Installer_yesno "Do you want to write new ALSA configuration ?" || exit 1
#update_alsa
