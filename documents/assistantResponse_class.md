# assistantResponse Class

```
/library/
  response.class.js
  (response.js) <- default
/library/responseUI
  response.js samples per UI
```

User need to copy one of `/library/responseUI/respose.samples.js` then paste it into `/library/` as `response.js`
By example;
- response.fullscreen.js
- response.800x600.js
- response.onlyicon.js
- response.simple.js


`response.js`(**AssistantResponse**) should be child-class of `response.class.js`(**AssistantResponseClass**).
So you just override members what UI needs.
