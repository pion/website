---
title: "FAQ"
---

### What is WebRTC
WebRTC is a standardized protocol for P2P communication. It allows two peers to exchange media and data. It is encrypted by default, and handles connectivity establishment in many different network conditions. It is supported in browsers, and has multiple out of browser implementations.

### What is Pion WebRTC
Pion WebRTC is pure Go implementation of WebRTC. It implements the [W3C WebRTC RFC](https://www.w3.org/TR/webrtc/)

### When running any Pion WebRTC code I get `cannot find package "github.com/pion/webrtc/v2"`
Go modules must be enabled to use Pion WebRTC. You can enable them by setting the following environment variable `GO111MODULE=on`

Other dependency management tools are not actively supported, but we have some documentation solutions. Please submit a PR if you have a fix for other tooling!

* dep is adding support in [This PR](https://github.com/golang/dep/pull/1963)


### Why should I use Pion WebRTC instead of $x
We have a dedicated article written on this topic [Why Pion](/knowledge-base/pion-basics/why-pion/)

### Any talks on Pion?
* [CommCon 2019](https://youtu.be/iEYLvkaNTLc?t=447)
* [Seattle Video Tech 2018](https://www.youtube.com/watch?v=ezZYd5NsxE4)
