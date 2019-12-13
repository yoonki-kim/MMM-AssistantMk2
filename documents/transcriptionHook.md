# transcriptionHook

## Structure
```js
transcriptionHooks: {
  "HOOK_1": {
    pattern: "test" // Or use regular expression pattern. (e.g: "test ([a-z 0-9]+)$" )
    command: "COMMAND_1", // Describe command name to execute
  },
  "HOOK_2": {
    pattern: "turn (on|off) the radio",
    command: "COMMAND_TURN_RADIO"
  },
  ...
}

```
