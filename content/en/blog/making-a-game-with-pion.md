---
title: Making a game with Pion
Description: Cross platform multiplayer without proprietary APIs is possible thanks to Pion!
date: 2025-09-09
authors: ["Srayan Jana"]
---

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
- Has been in development for a long time, and I want to get started now.
- Current issues:
  - [Caniuse WebTransport](https://caniuse.com/webtransport)
  - Official demos on [GitHub](https://github.com/w3c/webtransport) do not work on Firefox on Windows.
  - [GitHub Issue](https://github.com/w3c/webtransport/issues/675)
  - [Firefox Bugzilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1969090)
- **Potential**: Will probably solve most problems once finished.

## Datachannels: A Hidden Gem of WebRTC

- **Feature**: Lets us send unreliable packets over the web using SCTP.
- Advantage: We don’t need WebTransport; we can use this today.

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
- [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets) - Uses ICE and STUN/TURN for Peer to Peer.

### Existing Game Networking Libraries Using WebRTC

- [Geckos.io](https://github.com/geckosio/geckos.io)
  - A client-server abstraction for WebRTC Datachannels written in Node.js.
  - Past experience: Really nice but a bit inefficient. See [GitHub Issue](https://github.com/geckosio/geckos.io/issues/269).
- [Netlib](https://github.com/poki/netlib) - Peer-to-peer WebRTC datachannel library for TypeScript.
- [Matchbox](https://github.com/johanhelsing/matchbox) - WebRTC datachannel library for Rust, compiles to both native and WASM.
- [PeerJS](https://github.com/peers/peerjs) - Great for browser-only apps/games, not specifically for game networking.
- [Netplayjs](https://github.com/rameshvarun/netplayjs) - Untested but seems to work well.
- [Godot's WebRTC Native](https://github.com/godotengine/webrtc-native) - Official Godot bindings to libdatachannel for Godot’s multiplayer API.

## Real-World Uses

- **WebXash3D**: Reimplementation of Half-Life 1 + Counter-Strike 1.6 using WebRTC.
  - [GitHub WebXash3D](https://github.com/yohimik/webxash3d-fwgs)
  - [Xash3D Launcher](https://github.com/ololoken/xash3d-launcher)
  - [Counter Strike 1.6 on the web](https://turch.in/cs/index.html)
  - ![Counter Strike](/img/counter_strike_on_the_web.png)

## Why Go for Development?

- Efficient: It just gets the job done.
- Pion: Has a pure-Go implementation of WebRTC.
- Minimal dependencies: No need for external dependencies like OpenSSL.

## Why Not Rust?

- Preference: I like Rust, but Go has a more active scene/easier help for WebRTC.
- Compilation: Big ecosystem, besides C, C++, and C#, that can compile to game consoles (Rust cannot yet).
- Speed of development: It's faster to code in Go compared to Rust.

## Why Ebitengine for Game Development?

- **Versatile**: 2D game engine that works across various platforms.
- **Potential Crossplay**: Nintendo Switch, PC, and browser.

## Showcase

- **Pion PR**: [Example WebRTC Applications](https://github.com/pion/example-webrtc-applications/pull/351)
- If time permits: Show a version that works with the web at [ValorZard](https://github.com/ValorZard/gopher-combat)

## Games That Use WebRTC

- [Tough Love Arena](https://toughlovearena.com/)
- [Counterpick Labs](https://www.counterpicklabs.com/)
- [2D Soccer](https://2dsoccer.com/)
- [Hypersomnia](https://github.com/TeamHypersomnia/Hypersomnia)

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

