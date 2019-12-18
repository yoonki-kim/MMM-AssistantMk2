# plugin
`plugin` is some kind of `monkey patch` for external recipe or module to control MMM-AssistantMk2's program logic.

## Example;
You can do something on `ready` phase of MMM-AssistantMk2 module.
```js
plugins: {
  onReady: "DO_SOMETHING",
  onBeforeActivated: "DO_ANOTHERTHING"
},

commands: {
  "DO_SOMETHING": {
    functionExec: ()=> {
      console.log("This will be executed when `onReady` phase.")
    }
  },
  "DO_ANOTHERTHING": {
    moduleExec: {
      module: ["MMM-Another"],
      exec: (payload)=> {
        console.log("MMM-AssistantMk2 is receiving ASSISTANT_ACTIVATED with payload", payload)
      }
    }
  }
}

```


## available plugins
```
onReady: ()=>{}
onBeforeAudioResponse: //NOT YET PREPARED
onAfterAudioResponse: //NOT YET PREPARED
onBeforeScreenResponse: //NOT YET PREPARED
onAfterScreenResponse: //NOT YET PREPARED
onBeforeInactivated: //NOT YET PREPARED ... I think this point meaningless....
onAfterInactivated: ()=>{}
onBeforeActivated: (payload)=>{} //payload of ASSISTANT_ACTIVATE
onAfterActivated: (payload)=>{} //payload of ASSISTANT_ACTIVATE
onError: //NOT YET PREPARED
onBeforeNotificationReceived: (noti, payload)=>{}
onAfterNotificationReceived: (noti, payload)=>{}
onBeforeSocketNotificationReceived: //NOT YET PREPARED
onAfterSocketNotificationReceived: //NOT YET PREPARED
```
More points would be added before release.
