---
tags: ["webrtc", "data channel"]
title: "用Go实现WebRTC Data Channel"
authors:
  - 作者Michiel De Backker (adwpc译)
---

今天我们来看一下如何通过[Go](https://golang.org/)写的[pion/webrtc](https://github.com/pion/webrtc)实现一个Data Channel连接。新手请先阅读[WebRTC](/knowledge-base/webrtc/)。你可以从这里[full examples](#full-examples)查看代码。

## 准备工作
快速上手[pion/webrtc](https://github.com/pion/webrtc)。
如果你熟悉go可以进入下一章节[next section](#peer-connection)。
可以使用`go get`来下载[pion/webrtc](https://github.com/pion/webrtc):
{{< highlight sh "" >}}
go get github.com/pion/webrtc
{{< / highlight >}}

接下来把包导入到你的工程:

{{< highlight go >}}
package main

import (
	"github.com/pion/webrtc"
)
{{< / highlight >}}

## Peer Connection
好了，我们设置一下WebRTC连接配置，创建一个PeerConnection来代表我们的连接：
{{< highlight go >}}
// 创建一个配置
config := webrtc.Configuration{
    ICEServers: []webrtc.ICEServer{
        {
            URLs: []string{"stun:stun.l.google.com:19302"},
        },
    },
}

// 创建一个RTCPeerConnection
peerConnection, err := webrtc.NewPeerConnection(config)
if err != nil {
    panic(err) // Please handle your errors correctly!
}
{{< / highlight >}}

我们配置了一个[STUN Server](/knowledge-base/webrtc/webrtc-architecture/#stun-server)来穿越[NAT](/knowledge-base/webrtc/webrtc-intro/#network-address-translation).

## Data Channels
接下来我们配置data channel。这里我们需要区分连接的两端。我们下一章深入讲解连接的两端。

连接的一端建立Data Channel：
{{< highlight go >}}
// Create a datachannel with label 'data'
dataChannel, err := peerConnection.CreateDataChannel("data", nil)
if err != nil {
    panic(err) // Please handle your errors correctly!
}
{{< / highlight >}}

连接的另一端将会收到过来的Data Channel：
{{< highlight go >}}
// Register data channel creation handling
peerConnection.OnDataChannel(func(dataChannel *webrtc.DataChannel) {
    fmt.Printf("New DataChannel %s %d\n", dataChannel.Label, dataChannel.ID)

    // Handle data channel
}
{{< / highlight >}}

现在要配置Data Channel。Data Channel打开时，我们才能使用，所以需要提前注册`OnOpen`回调：
{{< highlight go >}}
dataChannel.OnOpen(func() {
    fmt.Printf("Data channel '%s'-'%d' open.\n", dataChannel.Label, dataChannel.ID)

    // Now we can start sending data.
}
{{< / highlight >}}

我们可以注册`OnMessage`回调来接收Data Channel的消息
{{< highlight go >}}
// Register text message handling
d.OnMessage(func(msg webrtc.DataChannelMessage) {
    fmt.Printf("Message from DataChannel '%s': '%s'\n", dataChannel.Label, string(msg.Data))

    // Handle the message here
})
{{< / highlight >}}

最后我们可以发消息了：
{{< highlight go >}}
// Send the message as text
err := dataChannel.SendText(message)
if err != nil {
    panic(err) // Please handle your errors correctly!
}
{{< / highlight >}}

记住，`OnOpen`回调之后，才能发消息。先启动连接时才能打开Data Channel，下一章会介绍。

## 信令
首先，为了介绍WebRTC连接首先要了解[信令](/knowledge-base/webrtc/webrtc-intro/#signaling)。这里我们通过信令交换一些数据来发现彼此。

之前提到WebRTC连接有两个端：

- 请求端，发起一个offer给对端。
- 应答端：接收到offer之后，使用它来创建一个answer。answer在本次信令交互结束时发送给对方。
在我们的示例中，信令内容通过复制/黏贴来传给对方。实际部署时需要通过[信令服务器](/knowledge-base/webrtc/webrtc-architecture/#signaling-server)来完成。
<br><br>
先来看一下请求端：
{{< highlight go >}}
// 创建一个offer发送给浏览器
offer, err := peerConnection.CreateOffer(nil)
if err != nil {
    panic(err) // Please handle your errors correctly!
}

// 设置本地SDP，启动UDP监听
err = peerConnection.SetLocalDescription(offer)
if err != nil {
    panic(err) // Please handle your errors correctly!
}

// 输出offer的base64转码，黏贴到浏览器
fmt.Println(signal.Encode(offer))

// 等待黏贴answer
answer := webrtc.SessionDescription{}
signal.Decode(signal.MustReadStdin(), &answer)

// 设置远程SDP为answer
err = peerConnection.SetRemoteDescription(answer)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}
{{< / highlight >}}

接收端如下：
{{< highlight go >}}
// 等待黏贴offer
offer := webrtc.SessionDescription{}
signal.Decode(signal.MustReadStdin(), &offer)

// 设置远程SDP
err = peerConnection.SetRemoteDescription(offer)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}

// 创建一个answer
answer, err := peerConnection.CreateAnswer(nil)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}

// 设置本地SDP，启动UDP监听
err = peerConnection.SetLocalDescription(answer)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}
{{< / highlight >}}

就这么多，简单吧，你学会了通过WebRTC Data Channel发送数据。

## 完整示例
代码在这里[pion/webrtc](https://github.com/pion/webrtc):

- 发送端示例[data-channels-create](https://github.com/pion/webrtc/tree/master/examples/data-channels-create)
- 接收端示例[data-channels](https://github.com/pion/webrtc/tree/master/examples/data-channels)
