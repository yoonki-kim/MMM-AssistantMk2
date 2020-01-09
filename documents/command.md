# command
- `command` will be the main job of all Hooks (transcriptionHook, action, plugin, responseHook)



## Structure
```js
commands: {
  "COMMAND_1": {
    notificationExec: {
      notification: "SHOW_ALERT",
      payload: {title:"TEST", message:"This is a test.", ...}
    }
  },
  ...
}

```

## command types
- notificationExec
  - notification : string || (param, from)=>{ return string}
  - payload : object || variables || (param, from)=> {return object or variable}
- shellExec
  - exec : string || (param, from)=>{ return string}
  - options : string || (param, from)=>{ return string}
- moduleExec
  - module : string || Array of string || (param, from)=>{ return string or Array of string}
  - exec : (module, param, from)=>{}
- functionExec
  - exec : (param, from)=>{}
- soundExec
  - chime : string (open or close) 
  - say : text

## static and dynamic execution.
### Static example
```js
commands: {
  "COMMAND_1": {
    notificationExec: {
      notification: "SHOW_ALERT",
      payload: {title:"TEST", message:"This is a test.", ...}
    }
  },
  ...
}
```

### Dynamic example
```js
commands: {
  "COMMAND_1": {
    notificationExec: {
      notification: (params, from)=> {
        if (from === "HOOK_1") {
          return "SHOW_ALERT"
        } else {
          return "SOME_NOTIFICATION"
        }
      }
      payload: (params, from)=> {
        ...
        return { ... }
      }
    }
  },
  ...
}
```
`from` would be the name/id of trigger. It could be derived from transcriptionHooks, responseHooks, actions, plugins.
`params` would be Result of Regular Expression excution when it is transferred from `transcriptionHook`.

## soundExec command

### `chime` play official google open / close beep

`chime: "open"` for open
`chime: "close"` for close

### `say` real speak response **can be only used if `myMagicWord` is defined in configuration**
`say: "some text"`
