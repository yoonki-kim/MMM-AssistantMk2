# Developer Notes

## 2019/12/06 -- Bugsounet

- add FullScreenAnswer Feature
- to eouia > correct merge this.config / this.default / this.helperConfig
- temp code to correct this merge

## 2019/12/04 -- Bugsounet

- write main loop
- debug -> continue conversation seems to be ok (see eouia inspection)
- to eouia > can you see MMM-Hotword, afterRecordLimit does not work when there is silence but when there some noise
- ret.key -> change it : ret.key = "modules/MMM-Hotword/" + afterRecord
- create tmp folder -> error when writing tmp file
