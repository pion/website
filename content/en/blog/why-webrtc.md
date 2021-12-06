---
title: Why WebRTC?
Description: Why WebRTC? An implementer and user perspective.
date: 2021-12-05
author: Sean DuBois
---

This is a question I get in lots of different forms. Why should I use WebRTC instead of my
preferred video protocol? Why does WebRTC need to be in my browser? Why does WebRTC have to
be so complicated? Why do you continue to work on WebRTC projects?

These are my answers to the Why's of WebRTC. Lots of nuance exists, and these answers are heavily
influenced by the work I do. I have been working with WebRTC since 2013. In that time I worked on two implementations [Pion](https://github.com/pion/webrtc)
and [KVS WebRTC](https://github.com/awslabs/amazon-kinesis-video-streams-webrtc-sdk-c). I also co-authored a book [WebRTC for the Curious](https://webrtcforthecurious.com/).
I have used WebRTC at [startups](https://golightstream.com/) and [corporate](https://9to5mac.com/2021/06/11/hands-on-heres-a-first-look-at-how-facetime-works-in-a-web-browser/) projects.

### WebRTC supports more then just your use case

WebRTC supports a diverse set of use cases. It is hard to appreciate all of them when you are focused on your problem.

* Multiple tracks of bi-directional audio and video
* Media negotiation, codecs and media events like adding and removing tracks
* P2P connectivity with optimal path discovery, Client/Server can be built as well.
* Binary and text communication, lossy and unordered data with flow control APIs
* Mandatory encryption, secure by default and requires no developer configuration

Supporting a wide set of features has some big benefits. Most WebRTC developers only care about a specific use case, and
improve WebRTC for their needs. However, they coincidentally improve it for everyone. Lots of money has been invested in WebRTC by
conferencing companies. These changes have empowered Open Source project, startups and others that don't have the same resources.
Projects like [Snowflake](https://snowflake.torproject.org/) are only possible because others pushed WebRTC to it's present day quality.

### WebRTC is a standard

WebRTC is a IETF/W3C standard. Multiple individuals have been involved since its creation. Beyond that WebRTC is made up of multiple existing
standards. The majority of what WebRTC defines is how to combine these existing complicated subsystems.

I use WebRTC because I know it has a safe future. Protocols that are owned by a single corporation or project can be changed at any
time. As an individual you also have a chance to influence WebRTC. You can get involved in the standards or write your own WebRTC software and tools.

### WebRTC has multiple implementations and is in the browser

WebRTC is available in every major browser and most major languages. WebRTC isn't just a browser technology!

* [C#](https://github.com/sipsorcery-org/sipsorcery)

* [C++](https://github.com/paullouisageneau/libdatachannel)

* [C++](https://github.com/rawrtc/rawrtc)

* [C++](https://webrtc.googlesource.com/src/)

* [C](https://github.com/awslabs/amazon-kinesis-video-streams-webrtc-sdk-c)

* [Elixir](https://www.membraneframework.org/)

* [GStreamer](https://gstreamer.freedesktop.org/documentation/webrtc/index.html)

* [Go](https://github.com/pion/webrtc)

* [Node.js](https://github.com/node-webrtc/node-webrtc)

* [Python]( https://github.com/aiortc/aiortc)

* [Rust](https://github.com/webrtc-rs/webrtc)

* [Typescript](https://github.com/shinyoshiaki/werift-webrtc)

You also have a wealth of servers to choose from

* [ant media server](https://antmedia.io/)

* [galène](https://github.com/jech/galene)

* [ion-sfu](https://github.com/pion/ion-sfu)

* [janus-gateway](https://github.com/meetecho/janus-gateway)

* [jitsi](https://github.com/jitsi/jitsi-meet)

* [kurento](https://github.com/kurento/)

* [licode](https://github.com/lynckia/licode)

* [livekit](https://livekit.io/)

* [mediasoup](https://mediasoup.org/)

* [medooze](https://github.com/medooze)

WebRTC's wide availability makes it easy to build with. Developers can use the language, paradigm and tools they are most comfortable with.
Just worry about learning WebRTC and not a new language. WebRTC also has a high bus factor. If a single developer or company stops supporting
their software you have lots of alternatives.

### WebRTC supports all skill levels

You can build a simple 1:1 audio+video communication application in 50 lines of Javascript. You don't need any knowledge of VoIP or networking.
WebRTC also allows a great degree of flexibility if you have more niche needs. You can ship your own Congestion Control and Error Correction for media.
You can choose your own algorithm for path selection when establishing the connection. Even if you make these changes you will still be standards compliant
and can connect to existing WebRTC clients!

WebRTC's accessibility allows a wide range of applications to be built with it. You don't need to be a video and networking expert to build your
cool idea. I continue to stay involved with WebRTC because it has a rich ecosystem of developers. Life becomes stale if you build the same thing
over and over again. With WebRTC I have had a chance to interact with so many different projects. Remote surgery, drones, robotics, file sharing,
one hundred thousand viewer events, sub-second bidding for cattle, game streaming, VPNs in the browser, real-time voice translation, and these are
just the public projects! WebRTC lets beginners bring their interesting ideas to life.
