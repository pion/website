---
title: "Pion WebRTC v2.0.0 发布"
authors:
---

PION团队很高兴发布了Annouce 2.0.0，这是我们的第4个版本，包括5个月的工作！有了这个版本，我们有了许多新特性、性能改进和错误修复。

这个版本确实引入了一些突破性的变化。我们已经积累了相当数量的技术债务，这些改变使我们可以向一些事情更进一步，比如ORTC and TURN。

请仔细阅读这些更改，其中大部分内容在编译时不会被捕获，可以节省大量的调试时间。每个更改都有一个链接的提交，因此查看“examples/”应该可以显示您需要在应用程序中更改的代码。

## 突破性的进展

### 导入的改进
#### 我们现在使用'github.com/pion'
我们把`github.com/pions/webrtc`迁移到`github.com/pion/webrtc`，感谢你的使用。

#### 这次发布的是一个主要版本
我们把`github.com/pion/webrtc`迁移到`github.com/pion/webrtc/v2`, 增加了版本，确保向后兼容。

你可以使用下面的命令来快速修改
```
    find . -type f -name '*.go' | xargs sed -i '' 's/github.com\/pion\/webrtc/github.com\/pion\/webrtc\/v2/g'
    find . -type f -name '*.go' | xargs sed -i '' 's/github.com\/pions\/webrtc/github.com\/pion\/webrtc\/v2/g' # If you are still using github.com/pions/webrtc
```

### Unified Plan现在是默认的SDP格式
如果你在接收媒体，或者发送多个track，这个改动会影响你。如果你在JS上边做过类似的该动，这会很类似。

#### 你必须调用对每个到来的track调用AddTransceiver
```
	// Allow us to receive 1 audio track, and 2 video tracks
	if _, err = peerConnection.AddTransceiver(webrtc.RTPCodecTypeAudio); err != nil {
		panic(err)
	} else if _, err = peerConnection.AddTransceiver(webrtc.RTPCodecTypeVideo); err != nil {
		panic(err)
	} else if _, err = peerConnection.AddTransceiver(webrtc.RTPCodecTypeVideo); err != nil {
		panic(err)
	}
```


改动在这里[1202db](https://github.com/pion/webrtc/commit/1202db)


### webrtc包里结构体的RTC前缀被删掉了
- 这使得添加包名称时不会结巴
- 比如`webrtc.RTCPeerConnection`变为`webrtc.PeerConnection`

改动在这里[0e7086](https://github.com/pion/webrtc/commit/0e7086)

### `SetLocalDescription`不再被`CreateOffer`和`CreateAnswer`隐式调用
之前`CreateOffer``CreateAnswer`会自动`SetLocationDescription`现在你需要手动调用

因为之前和WebRTC RFC相违背了

#### 之前
```
  answer, err := peerConnection.CreateAnswer(nil)
  if err != nil {
    return err
  }
```

#### 现在
```
  answer, err := peerConnection.CreateAnswer(nil)
  if err != nil {
    return err
  }

  err = peerConnection.SetLocalDescription(answer)
  if err != nil {
    return nil
  }

```

改动在这里[b67f73](https://github.com/pion/webrtc/commit/b67f73)

### 媒体接口
Track接口被重写了，从公共接口删除了channel，为了实现下面的issues

* 我认识到使用循环从channel中读写RTP/RTCP包代价是非常昂贵的
* 读/写RTP或RTCP时无法返回错误
* 无法关闭channel（用户写入时有panic的风险）
* 包被丢弃了，因为缓冲channel（大小15）不够大来应对激增问题

由于转移到新的API我们还获得了一些不可预见的好处。

* 一个Track现在可以被加入到多个`PeerConnections`了，最常见的用例就是在构建SFU时, 这给大家大大降低了开发复杂度。这里实现的和浏览器端WebRTC是非常类似的。

#### RTPReceiver现在可以`onTrack`触发

##### 原来这样
```
peerConnection.OnTrack(func(track *webrtc.Track) {
})
```

##### 现在这样
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
})
```

#### RTCP现在通过`RTPSender``RTPReceiver`来替代曾经的`Track`接收

##### 原来这样
```
peerConnection.OnTrack(func(track *webrtc.Track) {
    <-track.RTCPPackets
})
```

##### 现在这样
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
    pkt, header, err := receiver.ReadRTCP()
})
```

#### RTP现在通过`Track`的`Read``ReadRTP`来接收，替代了channel

##### 原来这样
```
peerConnection.OnTrack(func(track *webrtc.Track) {
    <-track.Packets
})
```

##### 现在这样
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
    pkt, err := track.ReadRTP()
})
```


#### RTP现在通过`Track`的`Write``WriteRTP``WriteSample`来发送，替代了channel

##### 原来这样
```
peerConnection.OnTrack(func(track *webrtc.Track) {
    vp8Track.RawRTP <- &rtp.Packet{}
})
```

##### 现在这样
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
    i, err := track.WriteRTP(&rtp.Packet{})
})
```

#### Raw和Sample tracks现在共享一个constructor
唯一的不同是用户必须提供一个SSRC给Sample tracks。通常采用一个随机uint32。

###### 原来这样
```
    peerConnection.NewRawRTPTrack(outboundPayloadType, outboundSSRC, "video", "pion")
    pcOffer.NewSampleTrack(DefaultPayloadTypeVP8, "video", "pion")
```

###### 现在这样
```
    peerConnection.NewTrack(outboundPayloadType, outboundSSRC, "video", "pion")
```

This was changed with [6aeb34](https://github.com/pion/webrtc/commit/6aeb34)

### 修正错误的API
- `OnICEConnectionStateChange` 回调返回 `webrtc.RTCIceConnectionState`替代了`ice.ConnectionState`。改动在这里 [bf422e0](https://github.com/pion/webrtc/commit/bf422e0)
- `webrtc.AddIceCandidate`使用`webrtc.RTCIceCandidateInit`替代了字符串. 改动在这里[0e619e2](https://github.com/pion/webrtc/commit/0e619e2)
- Trickle ICE: 改变了candidate收集方式，从同步改为异步 **这个该动还没有放到master**

### 命名更加常量化
- `Track`: `Ssrc` 重命名为`SSRC`
- `OAuthCredential`: `MacKey` 重命名为`MACKey`
- `SessionDescription`: `Sdp` 重命名为`SDP`
- `sdp.AttrKeyRtcpMux` 重命名为`sdp.AttrKeyRTCPMux`

该动在这里[9cba54](https://github.com/pion/webrtc/commit/9cba54)

### DataChannel API
RTCDataChannel API, specifically the Payload objects, feels weird. One alternative was suggested in webrtc#365: Instead of passing a single byte in `Send` and `OnMessage` we could experiment with passing `io.Reader`s. This has the added advantage that it can work with any message size.

**TODO: update docs**

### 隐藏锁
RTCPeerConnection对象的锁现在改为私有不再暴露。

用户不需要关心这个锁，否则容易死锁。

改动在这里[5fcbc7](https://github.com/pion/webrtc/commit/5fcbc7)

### 更安全的显示状态
之前状态通过属性来显示，现在改为方法。如有需要可以加锁。

## 新特性

### `example-webrtc-applications`仓库
我们现在有个仓库专门存放那些用到了第三方库或比较复杂的示例。

很高兴看到大家在[example-webrtc-applications](https://github.com/pion/example-webrtc-applications)作出更多参与和贡献。

### WASM
增加了实验性对WASM的支持。可以用`goos=js goarch=wasm`来构建。当设置`goos=js`Pion用起来像JavaScript WebRTC API。这个该动使你可以用相同的代码跑在服务端和浏览器上。我们尽可能的使API类似。

### ORTC
增加了ORTC API。在内部，WebRTC API现在由ORTC API支持。

### QUIC
实验性增加了webrtc-quic的支持。已经通过两个pion客户端测试过。目前没有通过chromium或类似的实现来测试。

### Out of tree
所有的可重用代码被移出了`pion/webrtc`。我们想把成果共享给Go社区。

- [pion/dtls](https://github.com/pion/dtls) (重构为通用包)
- [pion/sdp](https://github.com/pion/sdp)
- [pion/rtp](https://github.com/pion/rtp)
- [pion/rtcp](https://github.com/pion/rtcp)
- [pion/srtp](https://github.com/pion/srtp)
- [pion/sctp](https://github.com/pion/sctp)
- [pion/datachannel](https://github.com/pion/datachannel)
- [pion/quic](https://github.com/pion/quic)
