---
tags: ["webrtc", "everywhere"]
title: "pion/webrtc多平台展示"
authors:
  - Michiel De Backker (adwpc译)
---

我们来看一下[pion/webrtc](https://github.com/pion/webrtc)的适用场景。

## 服务端
第一个示例展示了pion/webrtc在服务端的使用。它使你可以穿越[NAT](../webrtc-intro#network-address-translation)连接到浏览器或其他WebRTC服务器。它是纯Go写的，Go能运行的地方都可以运行。包括：Linux/MaxOS/Windows(x86或ARM)等，参考[Go运行平台](https://golang.org/doc/install#requirements)。

<br><br>
如果你在一个未知平台上运行[pion/webrtc](https://github.com/pion/webrtc)，请告知我们表现如何。

## 移动端
参考[Go on Mobile](https://github.com/golang/mobile)你也可以在手机上运行Pion WebRTC。参考[all-go apps](https://godoc.org/golang.org/x/mobile/app)和[SDK](https://godoc.org/golang.org/x/mobile/cmd/gobind)来实现app。
<br><br>
如果你在一个移动平台上运行[pion/webrtc](https://github.com/pion/webrtc)，请告知我们表现如何。

## 浏览器
我们刚刚通过[landed](https://github.com/pion/webrtc/pull/479)实现了对[WebAssembly](https://webassembly.org/)也就是WASM的支持。编译时使用环境变量`GOOS=js GOARCH=wasm`，用起来像一个JS WebRTC API的封装，服务器和客户端是看起来相同的API。参考[WebAssembly examples](https://github.com/pion/webrtc/tree/master/examples#webassembly)
<br><br>
如果你在一个浏览器运行[pion/webrtc](https://github.com/pion/webrtc)，请告知我们表现如何。

## Node.js
我们刚刚通过[landed](https://github.com/pion/webrtc/pull/479)实现了对[WebAssembly](https://webassembly.org/)也就是WASM的支持。[Node.js](https://nodejs.org/en/)也支持WebAssembly。Pion WebRTC编译出WASM用起来和JS API一样。这个API，Node默认不可用。然而，你可以使用[wrtc](https://www.npmjs.com/package/wrtc)
<br><br>
如果你在Node上运行[pion/webrtc](https://github.com/pion/webrtc)，请告知我们表现如何。
