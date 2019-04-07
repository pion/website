---
title: "Pion WebRTC v2.0.0 Release Notes"
authors:
---

The Pion team is very excited to annouce v2.0.0, our 4th release that includes 5th months of work! With this release we have lots of new features, performance improvements and bug fixes.

This release does introduce a few breaking changes. We had accumulated a fair amount of technical debt, and these changes were needed to allow us to move forward on things like ORTC and TURN.

Please read these changes carefully, most of these things aren't caught at compile time and could save a lot of time debugging. Each change will have a linked commit, so looking at `examples/` should show what code you need to change in your application.

## Breaking Changes

### Imports have changed
#### We now use 'github.com/pion'
We have moved from `github.com/pions/webrtc` -> `github.com/pion/webrtc`. Thank you to Ion Pana for making `github.com/pion` available!

#### This release is a new major version
This moves us from `github.com/pion/webrtc` -> `github.com/pion/webrtc/v2`. We version our libraries, allowing us to distribute old versions still if we need.

To quickly rewrite everything you can use the following commands
```
    find . -type f -name '*.go' | xargs sed -i '' 's/github.com\/pion\/webrtc/github.com\/pion\/webrtc\/v2/g'
    find . -type f -name '*.go' | xargs sed -i '' 's/github.com\/pions\/webrtc/github.com\/pion\/webrtc\/v2/g' # If you are still using github.com/pions/webrtc
```

### Unified Plan is now the default SDP format
This change will effect you if you are receiving media, or sending multiple tracks. If you have already done this migration for your Javascript this will feel very similar.

#### You must call AddTransceiver for every incoming track
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


This was changed with [1202db](https://github.com/pion/webrtc/commit/1202db)


### The RTC prefix was removed from structs in the webrtc package
- This makes it so the names don't studder when the package name is added.
- `webrtc.RTCPeerConnection` became `webrtc.PeerConnection`, for example

This was changed with [0e7086](https://github.com/pion/webrtc/commit/0e7086)

### `SetLocalDescription` is no longer called implicitly by `CreateOffer` and `CreateAnswer`
Before `CreateOffer` and `CreateAnswer` would implicitly call `SetLocationDescription` for you, now you need to call it explicitly.

This was changed because it diverged from the WebRTC RFC. To fix this update your code like below

#### Before
```
  answer, err := peerConnection.CreateAnswer(nil)
  if err != nil {
    return err
  }
```

#### After
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

This was changed with [b67f73](https://github.com/pion/webrtc/commit/b67f73)

### Media API
The Track API has been rewritten to remove Channels from the public API. This was done because we ran into the following issues.

* Using tight loops to read/write from Channels to exchange RTP/RTCP packets is more expensive then I realized
* We were unable to return errors when reading/write RTP or RTCP
* We were unable to close channels (or risk causing a panic if the user writes to them)
* Packet drops because the buffered channel (size 15) is not large enough to handle surges.

We also gained some unforeseen benefits moving to the new API.

* A Track can be added to multiple `PeerConnections` now. The most common use-case so far has been building SFUs, and this feature will reduce complexity for everyone. This also more closely follows the browser implementation of WebRTC.

#### RTPReceiver is now emitted via `onTrack`

##### Before
```
peerConnection.OnTrack(func(track *webrtc.Track) {
})
```

##### After
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
})
```

#### RTCP is now received via `RTPSender` and `RTPReceiver` instead of `Track`

##### Before
```
peerConnection.OnTrack(func(track *webrtc.Track) {
    <-track.RTCPPackets
})
```

##### After
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
    pkt, header, err := receiver.ReadRTCP()
})
```

#### RTP is now received via `Read` or `ReadRTP` on `Track`, instead of a channel

##### Before
```
peerConnection.OnTrack(func(track *webrtc.Track) {
    <-track.Packets
})
```

##### After
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
    pkt, err := track.ReadRTP()
})
```


#### RTP is now written via `Write`,  `WriteRTP` or `WriteSample` on `Track`, instead of send on a channel

##### Before
```
peerConnection.OnTrack(func(track *webrtc.Track) {
    vp8Track.RawRTP <- &rtp.Packet{}
})
```

##### After
```
peerConnection.OnTrack(func(track *webrtc.Track, receiver *webrtc.RTPReceiver) {
    i, err := track.WriteRTP(&rtp.Packet{})
})
```

#### Raw and Sample tracks now share a constructor
The only behavior difference is that the user must supply a SSRC for Sample tracks. A random uint32 is all that should be needed in most cases.

###### Before
```
    peerConnection.NewRawRTPTrack(outboundPayloadType, outboundSSRC, "video", "pion")
    pcOffer.NewSampleTrack(DefaultPayloadTypeVP8, "video", "pion")
```

###### After
```
    peerConnection.NewTrack(outboundPayloadType, outboundSSRC, "video", "pion")
```

This was changed with [6aeb34](https://github.com/pion/webrtc/commit/6aeb34)

### Correct incorrect API
- Instead of returning `ice.ConnectionState` the `OnICEConnectionStateChange` callback should return a `webrtc.RTCIceConnectionState`. This was changed with [bf422e0](https://github.com/pion/webrtc/commit/bf422e0)
- `webrtc.AddIceCandidate` should take a `webrtc.RTCIceCandidateInit` instead of a string. This was changed with [0e619e2](https://github.com/pion/webrtc/commit/0e619e2)
- Trickle ICE: Changed candidate gathering from synchronous to asynchronous. **This change has not landed in master yet**

### Names were made more consistent across the codebase
- `Track`: `Ssrc` renamed `SSRC`
- `OAuthCredential`: `MacKey` renamed `MACKey`
- `SessionDescription`: `Sdp` renamed `SDP`
- `sdp.AttrKeyRtcpMux` renamed `sdp.AttrKeyRTCPMux`

This was changed with [9cba54](https://github.com/pion/webrtc/commit/9cba54)

### DataChannel API
The RTCDataChannel API, specifically the Payload objects, feels weird. One alternative was suggested in webrtc#365: Instead of passing a single byte in `Send` and `OnMessage` we could experiment with passing `io.Reader`s. This has the added advantage that it can work with any message size.

**TODO: update docs**

### Don't expose locks
The RTCPeerConnection object used to expose their Lock. These locks are now made private.

This was changed because the user never has to hold this lock, and could cause a deadlock if they did

This was changed with [5fcbc7](https://github.com/pion/webrtc/commit/5fcbc7)

### Expose state safely
Previously state was exposed via attributes. This cannot safely be used concurrently. The state is now exposed using methods instead. This allow the library to add locking when needed.

## New Features

### `example-webrtc-applications` repository
We know have a repository for examples that use 3rd party libraries, or are more complicated then the standard example.

We would love to see what the community can build, come check out what we have and contribute more at [example-webrtc-applications](https://github.com/pion/example-webrtc-applications)

### WASM
Experimental support for WASM has been added. You can now compile Pion WebRTC with `goos=js goarch=wasm`. When setting `goos=js` the Pion API will act as a wrapper around the JavaScript WebRTC API. This change allows you to use the same code on the server and in the browser in many cases. We aim to keep the API for both implementations as similar as possible.

### ORTC
The ORTC API has been added. Internally the WebRTC API is now also backed by the ORTC API.

### QUIC
Experimental support for webrtc-quic has been added. This has been tested between two pion clients. It has not yet been tested with chromium's or other experimental implementations.

### Out of tree
All code that is re-usable has been moved outside of the `pion/webrtc` repository. We want to share our work with the greater Go community.

- [pion/dtls](https://github.com/pion/dtls) (restructured to fit the common package structure.)
- [pion/sdp](https://github.com/pion/sdp)
- [pion/rtp](https://github.com/pion/rtp)
- [pion/rtcp](https://github.com/pion/rtcp)
- [pion/srtp](https://github.com/pion/srtp)
- [pion/sctp](https://github.com/pion/sctp)
- [pion/datachannel](https://github.com/pion/datachannel)
- [pion/quic](https://github.com/pion/quic)
