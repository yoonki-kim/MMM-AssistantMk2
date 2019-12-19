# `assistantResponse`
I did refactoring to collect all the logics about `response` to `assistantResponse` class.

You can access a instance of this class with `this.assistantResponse` of `MMM-AssistantMk2`

I tried to keep many legacy codes from before-refactoring, but many parts would be missing. especially about icon and chime.

Major pulic methods will be these. (Usable in outside of class)

- AssistantResponse.tunnel(tunnel_payload)
- AssistantResponse.playChime(sound)
- AssistantResponse.status(statusText)

For other methods, I hope you don't need. Javascript doesn't support encapsulation. If was possible, I would have made all of methods as `private`.
