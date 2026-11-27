---
title: You do not need STUN or TURN for WebRTC
Description: How to direct connect to a public server or someone on the same local network!
date: 2025-09-11
authors: ["Srayan Jana"]
---

After I published [my previous blog post](https://pion.ly/blog/making-a-game-with-pion/), I got a comment from the creator of [libdatachannel](https://github.com/paullouisageneau/libdatachannel) Paul-Louis Ageneau on their official Discord:

![Comment from Paul](/img/comment_from_paul_louis.png)

Wait, what?

Sure enough, if you take the [pion-to-pion](https://github.com/pion/webrtc/tree/master/examples/pion-to-pion) example, and change [line 44 in answer/main.go](https://github.com/pion/webrtc/blob/634a904ba9d5e0a71ad62b33d4a2983bd9599104/examples/pion-to-pion/answer/main.go#L44) and [line 48 in offer/main.go](https://github.com/pion/webrtc/blob/634a904ba9d5e0a71ad62b33d4a2983bd9599104/examples/pion-to-pion/offer/main.go#L48) to:

``config := webrtc.Configuration{}``

They still connect:

```
PS C:\github\webrtc\examples\pion-to-pion\answer> go run .
Peer Connection State has changed: connecting
Peer Connection State has changed: connected
New DataChannel data 824636419654
Data channel 'data'-'824636419654' open. Random messages will now be sent to any connected DataChannels every 5 seconds
Sending 'lNvvvVoiaJovwvc'
Message from DataChannel 'data': 'wLxIGjlgKSKzmue'
Sending 'jWxUUNvVdNusRKI'
Message from DataChannel 'data': 'LyNhyhMxmQinOsq'
```

```
PS C:\github\webrtc\examples\pion-to-pion\offer> go run .
Peer Connection State has changed: connecting
Peer Connection State has changed: connected
Data channel 'data'-'824635869196' open. Random messages will now be sent to any connected DataChannels every 5 seconds
Sending 'wLxIGjlgKSKzmue'
Message from DataChannel 'data': 'lNvvvVoiaJovwvc'
Sending 'LyNhyhMxmQinOsq'
```

So why is that? I thought that you *needed* STUN or TURN for WebRTC to function? Not so!

In the following blog post, I hope to explain why it's not necessary, and dig into the specifics of how ICE, STUN, TURN, and SDP all work.

## TODO: Fill out the rest of this blog post with a high-level overview of ICE and how it works


## Possible use cases
So why would you even want to direct connect to an IP? Well, the example off the top of my mind is connecting to a dedicated server for a multiplayer video game. You don't need to set up STUN/TURN for your game if everything is just using dedicated servers. Something like this would work right out of the box:

![Connect to Minecraft Server (Image taken from Apex Hosting)](/img/connect_to_minecraft_server.png)

Also, this exact technique of direct connecting to a server is apparently how [Revolt](https://revolt.chat/) does their WebRTC voice call implementation.

## Acknowledgements

A big thanks to Paul Lous and [Nemirtingas
](https://github.com/Nemirtingas) from [the libdatachannel Discord](https://discord.gg/jXAP8jp3Nn) to clearing up my mind on this.