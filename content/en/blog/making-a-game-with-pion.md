---
title: Making a game with Pion
Description: Cross platform multiplayer without proprietary APIs is possible thanks to Pion!
date: 2025-09-09
authors: ["Srayan Jana"]
---

(The following was adapted from a talk I gave at [DWeb Weekend 2025](https://dwebseminar.org/weekend/) at the Internet Archive in San Francisco on August 17, 2025)

# Simplifying WebRTC Datachannels for Games

First of all, to get some stuff out of the way, instead of using the "super complicated" WebRTC datachannels, why don't we use something simpler?

## Why Not Use Websockets?

- **Too slow**: Most games use UDP with a reliability layer on top.
- **Suitable for turn-based games**: Fine for games that are turn-based/slow-paced, like Runescape.
- For more details, see:
  - [UDP vs TCP](https://gafferongames.com/post/udp_vs_tcp/)
  - [Client-Server Connection](https://gafferongames.com/post/client_server_connection/)

## The Case for Web Transport

- Replacement for Websockets, uses QUIC instead of TCP.
- However, it has been in development for a long time, and I want to get started on making games now.
- Current issues:
  - [Caniuse WebTransport](https://caniuse.com/webtransport)
  - Official demos on [GitHub](https://github.com/w3c/webtransport) do not work on Firefox on Windows.
  - [GitHub Issue](https://github.com/w3c/webtransport/issues/675)
  - [Firefox Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1969090)
- **Potential**: Will probably solve most problems once finished and would be the best choice for making a multiplayer game on the web.

## Datachannels: A Hidden Gem of WebRTC

- **Feature**: Lets us send unreliable packets over the web using SCTP.
- Advantage: We don’t need WebTransport; we can use this today.
- They were created in part for exactly this use case 
  - [See the reasoning for unreliable datachannels in the official specification itself](https://datatracker.ietf.org/doc/html/rfc8831#name-use-cases-for-unreliable-da)
  - [Not to mention that one of the original implementers of WebRTC wanted to enable this usecase](https://news.ycombinator.com/item?id=13264952)
![Comment from original WebRTC team member](/img/comment_from_webrtc_team.png)

## Benefits and Drawbacks of WebRTC

### Benefits

- **Host flexibility**: Do not need to host servers - players can make their own.
  - No more need for port forwarding or Hamachi!
- **Minimal server requirements**: Only need one server for signaling.
- **Community-supported specification**: There are many options for making your own WebRTC-based app.

### Drawbacks

- **Complex setup**: Setting up WebRTC is challenging.
- **Server dependence**: You need to host or use two different servers (Signaling + STUN/TURN).
  - Can use Google’s STUN, but combining signaling and STUN into one server would be nice.

## WebRTC Implementations

- [libwebrtc](https://github.com/webrtc-sdk/libwebrtc?tab=readme-ov-file) - (a fork of) the original WebRTC implementation.
- [libdatachannel](https://github.com/paullouisageneau/libdatachannel) - C/C++.
- [Pion WebRTC](https://github.com/pion/webrtc) - Go.
- [webrtc-rs](https://github.com/webrtc-rs/webrtc) - Rust (using Tokio Runtime).
- [str0m](https://github.com/algesten/str0m) - Rust (sans-io).
- [sipsorcery](https://github.com/sipsorcery-org/sipsorcery) - C#
- [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets) 
  - Uses ICE and STUN/TURN for Peer to Peer.
  - Created by Valve and made for Steam, which means if you've ever played a game like Counter Strike or Deadlock, you've already seen this library in action!

### Existing Game Networking Libraries Using WebRTC

- [Geckos.io](https://github.com/geckosio/geckos.io)
  - A client-server abstraction for WebRTC Datachannels written in Node.js.
  - Past experience: Really nice but a bit inefficient. See [GitHub Issue](https://github.com/geckosio/geckos.io/issues/269).
- [Netlib](https://github.com/poki/netlib) - Peer-to-peer WebRTC datachannel library for TypeScript.
- [Matchbox](https://github.com/johanhelsing/matchbox) - WebRTC datachannel library for Rust, compiles to both native and WASM.
- [PeerJS](https://github.com/peers/peerjs) - Great for browser-only apps/games, not specifically for game networking.
- [Netplayjs](https://github.com/rameshvarun/netplayjs) - Untested but seems to work well.
- [Godot Engine's WebRTC Native](https://github.com/godotengine/webrtc-native) - Official Godot bindings to libdatachannel for Godot’s multiplayer API.

## Real-World Uses

- **WebXash3D**: Reimplementation of Half-Life 1 + Counter-Strike 1.6 using WebRTC.
  - [GitHub WebXash3D](https://github.com/yohimik/webxash3d-fwgs)
  - [Xash3D Launcher](https://github.com/ololoken/xash3d-launcher)
  - [Counter Strike 1.6 on the web](https://turch.in/cs/index.html)
  - ![Counter Strike](/img/counter_strike_on_the_web.png)
- **Hypersomnia** - Open source 2D shooter made with C++ and libdatachannel
  - Has cross platform capabilities between both 
    - The [native Steam port](https://store.steampowered.com/app/2660970/Hypersomnia/) 
    - And in the browser (On [CrazyGames](https://www.crazygames.com/game/hypersomnia) and [the official website](https://hypersomnia.io/))
  - [Github Link](https://github.com/TeamHypersomnia/Hypersomnia)
## Why Go for Development?

- Efficient: It just gets the job done.
- Pion: Has a pure-Go implementation of WebRTC.
- Minimal dependencies: No need for external dependencies like OpenSSL.

## Why Not Rust?

- Preference: I like Rust, but Go has a more active scene/easier help for WebRTC.
- Speed of development: It's faster to code in Go compared to Rust.

## Why Ebitengine for Game Development?
- [Website Link](https://ebitengine.org/)
- **Versatile**: 2D game engine that works across various platforms.
  - The creator, [Hajime Hoshi](https://hajimehoshi.com/), has ported the engine (and the Go language!) to [the Nintendo Switch](https://ebitengine.org/en/blog/native_compiling_for_nintendo_switch.html) and other game consoles
- **Battle Tested**: Has been used for actual games like 
  - [From Madness with Love](https://playism.com/en/game/frommadness-withlove/)
    - [Steam Link](https://store.steampowered.com/app/2101130/From_Madness_with_Love/)
  - Coral & The Abyss
    - [Steam Link](https://store.steampowered.com/app/3123920/Coral__The_Abyss/)
    - [Nintendo eShop Link](https://www.nintendo.com/us/store/products/coral-and-the-abyss-switch/)
  - Rakuen
    - [Steam Link](https://store.steampowered.com/app/559210/Rakuen/)
    - [Nintendo eShop Link](https://www.nintendo.com/us/store/products/rakuen-deluxe-edition-switch/)
  - And more on the [Ebitengine Showcase Page](https://ebitengine.org/en/showcase.html)
- **Potential Crossplay**: You could make a cross platform multiplayer game in pure Go that works between the Nintendo Switch, PC, and the browser!

## Official Pion Example
- We now have an official example using Ebitengine in the Pion [example-webrtc-applications](https://github.com/pion/example-webrtc-applications) repository
- This includes an bundled in signaling server so you can host your own lobby, and connect with another player.
- [**Github Link to Game**](https://github.com/pion/example-webrtc-applications/tree/master/ebiten-game)
- **PR where it was merged in**: [Example WebRTC Applications](https://github.com/pion/example-webrtc-applications/pull/351)
- **Limitations**
  - Right now, this can only support two players on the same computer
    - Could probably work between two different computers, but we would need to figure out how to setup CORS properly for the signaling server
    - The machinery is there to support more than two players in a lobby, but as of writing this article it is [currently hardcoded](https://github.com/pion/example-webrtc-applications/blob/5c7005933879d34fa19b4d0c744bb884a247f5dc/ebiten-game/game/main.go#L154) to just two
![Picture of game](/img/game_on_web_and_desktop.png)

## Other Games That Use WebRTC

- [Tough Love Arena](https://toughlovearena.com/)
- [Counterpick Labs](https://www.counterpicklabs.com/)
- [2D Soccer](https://2dsoccer.com/)

## Possibilities with WebRTC

- Hosting a Minecraft-style game without dedicated servers or port forwarding.
- Players host everything themselves: no need for VPN/Hamachi.

---

## Community Acknowledgements

- A big thanks to:
  - [The Pion Discord](https://pion.ly/discord)
  - [The libdatachannel Discord](https://discord.gg/jXAP8jp3Nn)
  - [The Ebitengine Discord](https://discord.gg/3tVdM5H8cC)
  - [The Rust gamedev Discord](https://discord.com/invite/game-development-in-rust-676678179678715904)
- And many more who made this journey possible. I stand on the shoulders of giants.

