---
title: "WebRTC架构"
description: "WebRTC部署中常见的组件"
---
本文介绍WebRTC部署中使用的主要组件。
<br><br>
请注意，本文假设您对WebRTC有基本了解。如果您是WebRTC新手，请考虑阅读[WebRTC Introduction](../webrtc-intro/)

## 信令服务器
建立webrtc连接的第一步是所谓的[信令](../webrtc-intro#signaling)。为了安全地将两个对等端连接，需要交换数据。webrtc api以纯文本格式提供此数据，称为[SDP](../sdp-overview/)。
<br><br>

WebRTC部署通常使用所谓的信令服务器来完成此任务。此服务器通常由一个HTTPS或安全WebSocket服务器组成，其任务是在正确的对等端之间交换信号信息。
<br><br>
Pion还没有现成的信令服务器，但是在[pion/signaler](https://github.com/pion/signaler)下有一个示例。

## STUN服务器
顾名思义，stun服务器是一个使用[STUN](../stun-overview/)协议的服务器。此服务器允许对端发现自己的公共IP地址。此IP地址在[signaling](../webrtc-intro#signaling)步骤期间发送到远程对端，以便建立对等连接。
<br><br>
STUN服务器只占用很少的资源。因此，有公共的STUN服务器可以用。但是不建议在生产环境使用公共服务器。
<br><br>
Pion[TURN server](#turn-server)可以配置成一个STUN服务器

## TURN服务器
顾名思义，turn服务器是一个使用[TURN](../turn-overview/)协议的服务器。这个服务器用来中继WebRTC流量，可以穿透[NAT](../webrtc-intro#network-address-translation)和防火墙。用来作为WebRTC协议无法连接两端时的备用方案。配置TURN服务器不是必须的。然而，它可以使你的WebRTC应用适用面更广。通常严格限制的企业NAT或防火墙后面的用户需要一个TURN服务器来建立WebRTC连接。
<br><br>
TURN服务器通常需要大带宽来代理WebRTC数据。因此，很少有公共的TURN服务器可以用。你可以自己搞一个。多数TURN服务器仅仅作为[STUN服务器](#stun-server)来用。
<br><br>
Pion的TURN服务器在这里[pion/turn](https://github.com/pion/turn)。

## 媒体服务器
媒体服务器是指在服务器端处理WebRTC媒体的服务器。这种处理可以有多种形式，包括：分发、混流、录制和转码。
<br><br>
Pion媒体服务器在这里[pion/media-server](https://github.com/pion/media-server)。
