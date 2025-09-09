---
title: Making a game with Pion
Description: Cross platform multiplayer without proprietary APIs is possible thanks to Pion!
date: 2025-09-09
authors: ["Srayan Jana"]
---

First of all to get some stuff out of the way, instead of using the "super complicated" WebRTC datachannels, why don't we use something simpler?

Websockets?
- Too slow (Most games use UDP + reliability layer on top)
- Fine for games that are turn-based/slow-paced though
- Runescape
- For more details, see:
- https://gafferongames.com/post/udp_vs_tcp/
- https://gafferongames.com/post/client_server_connection/
Web Transport
- Replacement for Websockets, uses QUIC instead of TCP
- Has been in development for a long time, and I want to get started now
- https://caniuse.com/webtransport
- The official demos from https://github.com/w3c/webtransport do not work on Firefox on
Windows!
- https://github.com/w3c/webtransport/issues/675
- https://bugzilla.mozilla.org/show_bug.cgi?id=1969090
- Will probably solve most of my problems once its finished.
Datachannels
- A piece of the WebRTC api that's easy to miss
- Killer feature: let’s us send unreliable packets over the web using SCTP
- We don’t need WebTransport, we can use this today!
Benefits of WebRTC
● Do not need to host servers - Players can make their own
○ No more need for port forwarding or Hamachi!
● Only need one server for signaling
● It’s a specification, not a library
○ There are a lot of options out there for making your own WebRTC based thing
Drawbacks
● Setting up WebRTC is a paaaaaaaaaaaain
● You do need to host or use two different servers instead of one (Signaling +
STUN/TURN)
● Can just use Google’s STUN, but would be nice to somehow combine
signaling and STUN into one server.
List of WebRTC implementations (that I know of)
● https://github.com/webrtc-sdk/libwebrtc?tab=readme-ov-file
○ this is (a fork of) the OG webrtc implementation
● https://github.com/paullouisageneau/libdatachannel - C/C++
● https://github.com/pion/webrtc - Go
● https://github.com/webrtc-rs/webrtc - Rust (using Tokio Runtime)
● https://github.com/algesten/str0m - Rust (sans-io)
● https://github.com/sipsorcery-org/sipsorcery - C# (poor datachannels support)
● https://github.com/ValveSoftware/GameNetworkingSockets
○ Doesn’t actually implement WebRTC, but does use ICE and STUN/TURN for Peer to Peer
● https://github.com/kyren/webrtc-unreliable - Rust, unreliable data channels
Existing game networking libraries using WebRTC
● https://github.com/geckosio/geckos.io
○ A client-server abstraction for WebRTC Datachannels written in Node.js
○ Have used this before, really nice, but a bit inefficient, see
https://github.com/geckosio/geckos.io/issues/269
● https://github.com/poki/netlib
○ Peer-to-peer webrtc datachannel library for TypeScript
● https://github.com/johanhelsing/matchbox
○ Webrtc datachannel library for Rust, can compile to both native and WASM
● https://github.com/peers/peerjs
○ Not actually a game networking library, but great for browser-only apps/games
● https://github.com/rameshvarun/netplayjs
○ Haven’t tested this too much, but seems to work alright
● https://github.com/godotengine/webrtc-native
○ Official Godot bindings to libdatachannel for Godot’s own multiplayer API
This was an intended use case
https://news.ycombinator.com/item?id=13264952
![WebRTC Team Comment](/img/comment_from_webrtc_team.png)
Why Go?
● It Just Gets The Job Done
● Has a pure-Go implementation of WebRTC (Pion)
● Don’t need any external dependencies (Like OpenSSL)
Why not Rust?
● I like Rust a lot!
● Go has a much bigger scene/easier to get help when it comes to WebRTC
● One of the few languages (besides C, C++, and C#) that can compile to game
consoles
● (Rust cannot yet)
● It’s really fast to code in compared to Rust
Why Ebitengine?
● 2D game engine that works on a whole bunch of platforms
● Potentially: Nintendo Switch + PC + Browser (!!!) crossplay
Show off Pion PR here
● https://github.com/pion/example-webrtc-applications/pull/351
● (Also show version that works with the web if we have time)
● github.com/ValorZard/gopher-combat
●
Games that use WebRTC
● https://toughlovearena.com/
● https://www.counterpicklabs.com/
● https://2dsoccer.com/
● https://github.com/TeamHypersomnia/Hypersomnia
● Probably more!
WebXash3D
● https://github.com/yohimik/webxash3d-fwgs
○ https://github.com/ololoken/xash3d-launcher -half life death match
○ https://turch.in/cs/index.html - Counter Strike 1.6
● Reimplementation of Half Life 1 + Counter Strike 1.6 using WebRTC for multiplayer
![Counter Strike](/img/counter_strike_on_the_web.png)
Possibilities
- Host a minecraft style game without dedicated servers/port forwarding
- Could have players host everything themselves, no need for VPN/Hamachi
- Probably more!
Questions?
Thanks!
This wouldn’t be possible without
● The pion discord
● The libdatachannel discord
● The ebitengine discord
● The rust gamedev discord
And more! I stand on the shoulders of giants.
