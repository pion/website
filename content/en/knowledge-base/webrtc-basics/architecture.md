---
title: "WebRTC Architecture"
description: "An overview of the common components in a WebRTC enabled deployment."
---
This article covers the major components used in a WebRTC deployment.
<br><br>
Please note that the article assumes you have a basic understanding of WebRTC. Consider reading trough the [WebRTC Introduction](../webrtc-intro/) if you are new to WebRTC.

## Signaling server
The first step in setting up a WebRTC connection is what's known as [signaling](../webrtc-intro#signaling). This is en exchange of information needed to safely connect two peers to each other. The WebRTC API provides this data in a plain text a format known as [SDP](../sdp-overview/). It is up to the user to safely exchange this information between the two peers who want to establish a connection.
<br><br>
WebRTC deployments commonly use what's known as a signaling server to accomplish this task. This server usually consists of a HTTPS or Secure WebSocket server tasked with exchanging the signaling information between the correct peers.
<br><br>
The Pion family doesn't contain an of-the-shelf signaling server yet. However, there is an example implementation available under the [pions/signaler](https://github.com/pions/signaler) repository.

## STUN Server
As the name suggests a STUN server is a server that speaks the [STUN](../stun-overview/) protocol. This server allows a peer to discover it's own public IP address. This IP address is sent to the remote peer during the [signaling](../webrtc-intro#signaling) step in order to establish the peer to peer connection.
<br><br>
A STUN server has low resource requirements. Because of this there are public STUN servers available. However, it is not recommend to rely on a public STUN server for production use.
<br><br>
The Pion [TURN server](#turn-server) can be configured to act as a STUN server specifically.

## TURN Server
As the name suggests a TURN server is a server that speaks the [TURN](../turn-overview/) protocol. This server is used to relay WebRTC traffic around a strict [NAT](../webrtc-intro#network-address-translation) or firewall. This server is used as a fallback in case the WebRTC protocol can't find another way to connect two peers. A TURN server is not required in order to setup a WebRTC connection. However, it does enable a broader spectrum of users to use your WebRTC enabled application. It is often users behind strict corporate NAT/firewalls that require a TURN server in order to make a WebRTC connection.
<br><br>
A TURN server usually has high bandwidth requirements since it has to forward all the data send over a WebRTC connection. Because of this there are little to no public TURN servers available. You can rent a TURN server or set-up your own. Most TURN servers also act as a [STUN server](#stun-server).
<br><br>
The Pion TURN Server can be found under the [pions/turn](https://github.com/pions/turn) repository.

## Media server
A media server refers to any server that does server side processing on the WebRTC media. This processing can take many forms, including: routing, mixing, recording and transcoding.
<br><br>
The Pion Media Server can be found under the [pions/media-server](https://github.com/pions/media-server) repository.
