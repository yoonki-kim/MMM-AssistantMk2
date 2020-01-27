#!/bin/bash
# +--------------------------------+
# | switch to dev branch           |
# | Rev 1.0.0                      |
# +--------------------------------+

cd ~/MagicMirror/modules/MMM-AssistantMk2
git branch dev
git checkout -f dev
git pull origin dev
