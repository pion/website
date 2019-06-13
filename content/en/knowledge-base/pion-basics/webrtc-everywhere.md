---
tags: ["webrtc", "everywhere"]
title: "WebRTC Everywhere"
authors:
  - Michiel De Backker
---

In this post we'll take a look at all the places you can run [pion/webrtc](https://github.com/pion/webrtc).

## Server
The first use-case for a Go WebRTC library naturally is running WebRTC on the server. This enables you to connect to browsers and other WebRTC servers directly while punching through [NAT](../webrtc-intro#network-address-translation)s. Because the Pion WebRTC stack is written completely in Go, you can run it anywhere Go runs. And that's a lot of [places](https://golang.org/doc/install#requirements), including: Linux, macOS and Windows on both x86 and ARM.
<br><br>
Please reach out to us if you run [pion/webrtc](https://github.com/pion/webrtc) on an unconventional platform. We'd love to hear about it and feature it here!

## Mobile
With the introduction of [Go on Mobile](https://github.com/golang/mobile) you can run Go on mobile devices. This means you can run Pion WebRTC on mobile devices as well. Go mobile supports writing [all-go apps](https://godoc.org/golang.org/x/mobile/app) or you can write an [SDK](https://godoc.org/golang.org/x/mobile/cmd/gobind) in Go and use it in your existing mobile app.
<br><br>
Please reach out to us if you run [pion/webrtc](https://github.com/pion/webrtc) on mobile. We'd love to hear about it and feature it here!

## Browser
We recently [landed](https://github.com/pion/webrtc/pull/479) initial support for [WebAssembly](https://webassembly.org/), also know as WASM. When compiling Pion WebRTC with `GOOS=js GOARCH=wasm` the library will act as a wrapper around the JavaScript WebRTC API that's available in the browser. This means you can use the same API on both the server and client side. Check out the [WebAssembly examples](https://github.com/pion/webrtc/tree/master/examples#webassembly) to get started.
<br><br>
Please reach out to us if you run [pion/webrtc](https://github.com/pion/webrtc) in the browser. We'd love to hear about it and feature it here!

## Node.js
As mentioned in the previous section, we recently [landed](https://github.com/pion/webrtc/pull/479) initial support for [WebAssembly](https://webassembly.org/). [Node.js](https://nodejs.org/en/) also has support for WebAssembly. As mentioned, Pion WebRTC will act as a wrapper to the JavaScript API when compiled to WASM. This API isn't available in Node by default. However, you can use the [wrtc](https://www.npmjs.com/package/wrtc) package to make it available.
<br><br>
Please reach out to us if you run [pion/webrtc](https://github.com/pion/webrtc) from Node. We'd love to hear about it and feature it here!
