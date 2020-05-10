---
tags: ["webrtc", "data channel"]
title: "WebRTC Data Channels in Go"
authors:
  - Michiel De Backker
---

Today we'll walk through setting up a Data Channel connection in [Go](https://golang.org/) using [pion/webrtc](https://github.com/pion/webrtc). Check out our knowledge base articles on [WebRTC](/knowledge-base/webrtc/) if you're new to it. You can also skip to the [full examples](#full-examples) if you just want to look at the code.

## Preparation
Let's quickly cover how to get started with [pion/webrtc](https://github.com/pion/webrtc). If you're familiar with Go you can skip to the [next section](#peer-connection). To start you can download the library using `go get`:
{{< highlight sh "" >}}
go get github.com/pion/webrtc
{{< / highlight >}}

Next, import the library into your project:

{{< highlight go >}}
package main

import (
	"github.com/pion/webrtc"
)
{{< / highlight >}}

## Peer Connection
Ok, now let's start setting up the WebRTC connection. To do this we'll create a PeerConnection which is used to represent our connection:
{{< highlight go >}}
// Prepare the configuration
config := webrtc.Configuration{
    ICEServers: []webrtc.ICEServer{
        {
            URLs: []string{"stun:stun.l.google.com:19302"},
        },
    },
}

// Create a new RTCPeerConnection
peerConnection, err := webrtc.NewPeerConnection(config)
if err != nil {
    panic(err) // Please handle your errors correctly!
}
{{< / highlight >}}

Note that we provide a [STUN Server](/knowledge-base/webrtc/webrtc-architecture/#stun-server) to the configuration to allow the WebRTC connection to punch trough a [NAT](/knowledge-base/webrtc/webrtc-intro/#network-address-translation).

## Data Channels
Next we configure the data channels. Here we need to differentiate between two sides of the connection. We'll go into more depth about the two sides of the connection in the next section.

One side of the connection will create the Data Channel:
{{< highlight go >}}
// Create a datachannel with label 'data'
dataChannel, err := peerConnection.CreateDataChannel("data", nil)
if err != nil {
    panic(err) // Please handle your errors correctly!
}
{{< / highlight >}}

The other side of the connection will receive the incoming Data Channel:
{{< highlight go >}}
// Register data channel creation handling
peerConnection.OnDataChannel(func(dataChannel *webrtc.DataChannel) {
    fmt.Printf("New DataChannel %s %d\n", dataChannel.Label, dataChannel.ID)

    // Handle data channel
})
{{< / highlight >}}

Now we have a Data Channel configured. However, in order to use it we first have to wait for the Data Channel to be opened. To do this we register the `OnOpen` callback:
{{< highlight go >}}
dataChannel.OnOpen(func() {
    fmt.Printf("Data channel '%s'-'%d' open.\n", dataChannel.Label(), dataChannel.ID())

    // Now we can start sending data.
})
{{< / highlight >}}

We also need a way to receive messages from the Data Channel. This is done by registering the `OnMessage` callback:
{{< highlight go >}}
// Register text message handling
dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
    fmt.Printf("Message from DataChannel '%s': '%s'\n", dataChannel.Label(), string(msg.Data))

    // Handle the message here
})
{{< / highlight >}}

Finally, we can start sending messages on our Data Channel. This is done as follows:
{{< highlight go >}}
// Send the message as text
err := dataChannel.SendText(message)
if err != nil {
    panic(err) // Please handle your errors correctly!
}
{{< / highlight >}}

Remember, this should only be called after the `OnOpen` callback is fired. In order to open the Data Channel we have to start the connection first. This is covered in the next section.

## Signaling
The first step in starting up a WebRTC connection is known as [signaling](/knowledge-base/webrtc/webrtc-intro/#signaling). Here we exchange some data between the peers so they can find each other.

As mentioned before there are two sides in a WebRTC connection. These sides are:

- The offerer. This side creates an offer. The offer should be sent to the other side.
- The answerer: This side receives the offer and uses it to create an answer. This answer is sent back to the offerer in order to conclude the signaling step.

In our example the signaling data is exchanged by copy/pasting it to the other side. WebRTC deployments commonly use a [Signaling Server](/knowledge-base/webrtc/webrtc-architecture/#signaling-server) to accomplish this task.
<br><br>
Let's look at the offering side first:
{{< highlight go >}}
// Create an offer to send to the browser
offer, err := peerConnection.CreateOffer(nil)
if err != nil {
    panic(err) // Please handle your errors correctly!
}

// Sets the LocalDescription, and starts our UDP listeners
err = peerConnection.SetLocalDescription(offer)
if err != nil {
    panic(err) // Please handle your errors correctly!
}

// Output the offer in base64 so we can paste it in browser
fmt.Println(signal.Encode(offer))

// Wait for the answer to be pasted
answer := webrtc.SessionDescription{}
signal.Decode(signal.MustReadStdin(), &answer)

// Apply the answer as the remote description
err = peerConnection.SetRemoteDescription(answer)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}
{{< / highlight >}}

The answering side looks as follows:
{{< highlight go >}}
// Wait for the offer to be pasted
offer := webrtc.SessionDescription{}
signal.Decode(signal.MustReadStdin(), &offer)

// Set the remote SessionDescription
err = peerConnection.SetRemoteDescription(offer)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}

// Create an answer
answer, err := peerConnection.CreateAnswer(nil)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}

// Sets the LocalDescription, and starts our UDP listeners
err = peerConnection.SetLocalDescription(answer)
if err != nil {
    panic(err)  // Please handle your errors correctly!
}
{{< / highlight >}}

And that's it! You now know how to send data over a WebRTC Data Channel in Go.

## Full examples
The full examples corresponding covered in this post can be found in the [pion/webrtc](https://github.com/pion/webrtc) repository:

- The [data-channels-create](https://github.com/pion/webrtc/tree/master/examples/data-channels-create) example shows the offering side of the connection.
- The [data-channels](https://github.com/pion/webrtc/tree/master/examples/data-channels) example shows the answering side of the connection.
