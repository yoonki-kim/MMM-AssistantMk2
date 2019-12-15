# command

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
  - notification
  - payload
- shellExec
  - exec
  - options
- moduleExec
  - module
  - exec
- functionExec
  - exec
- soundExec
  - chime
  - say

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
