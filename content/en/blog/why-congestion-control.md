---
title: Congestion Control and Bandwidth Estimation for Real-time Media
Description: Solving Congestion Collapse for Real-time Media Streaming
date: 2022-03-25
authors: ["Mathis Engelbart"]
---

## Congestion Collapse and Fair Resources Sharing

The internet protocol (IP) provides a best-effort transmission service. IP
packets sent by an endpoint are forwarded hop-by-hop until they reach their
destination. Depending on the path they take, they may be re-ordered or even
lost on the way. Any additional features, such as reliability (guaranteed
delivery) or ordered delivery, must be added on top of the IP protocol.
Transport protocols, like TCP, use acknowledgments and retransmission-timers to
identify and retransmit lost packets: If a packet has not been acknowledged by
the receiver before a timer expires, the packet is assumed to be lost and will
be retransmitted.

On their path from the sender to the receiver, packets can pass several nodes
that the connection shares with other connections:

<!-- % TODO: Add Picture of Path between endpoints: {S1, S2} <-> Router1 <-> Router2 <-> {R1, R2} -->

When the amount of packets going over one of the links exceeds the capacity of
the link, packets may be buffered on the node before being forwarded. Buffering
increases the delay between sending and receiving a packet and thus also
increases the RTT. If the RTT becomes too large, the retransmission timer will
expire while the packet is still in transit and the sender will send another
copy of the same packet. The duplicate of the packet adds further load on the
network, increasing the amount of data to transmit and buffer and in turn
increasing the RTT even further, causing more retransmisisons. At some point, a
buffer at a network node might be full and the node starts dropping packets.
Although eventually some copy of each packet will arrive at the receiver, the
throughput will only be a fraction of the actual capacity. This situation is
called congestion collapse and was first described for TCP in the 1980s.

<!-- TODO: Add reference to congestion collapse -->

Another type of congestion collapse leads to degraded performance occurs when a
high amount of packets is dropped by a downstream link: When the sender
continous to send more packets into the network even though most of the packets
are dropped at the last link, it creates congestion even on earlier links in the
path, which is degrading the performance of other network connections sharing
the earlier links, even when these connections themselves don't use the link
with the high drop rate.

To avoid congestion collapse, using congestion control ensures that senders
don't send more data into the network than it can handle. Since network paths
can change all the time and connections can come and go, the bandwidth between
two endpoints can change anytime. The best-effort network doesn't provide any
information on current congestion and thus the endpoints have to implement
congestion control *end-to-end*. To quickly adapt to the changing environment,
transport protocols constantly need to monitor the network and update the rate
at which they send data.

Another aspect of congestion control is fairness. Each connection should receive
a fair share of the available bandwidth. Thus, congestion control algorithms
should not always try to send as much data as possible because that could starve
other flows traversing the same bottleneck node. Instead, they should behave
reasonably fair when new flows arrive or are already present on the path. There
are [different measures](https://en.wikipedia.org/wiki/Fairness_measure)
available to evaluate the fairness of congestion control algorithms.

## AIMD: Additive Increase, Multiplicative Decrease

The basic idea of end-to-end congestion control is to prevent the sender from
overloading the network with too much data. A lot of research has gone into
developing different algorithms to achieve this goal over the past decades.
Today there are many different congestion control algorithms available for
different transport protocols and applications that fullfil different
requirements.

Window-based congestion control uses a congestion window (CWND). The idea of the
congestion control window is similar to the flow control window: A sender
maintains a window size that indicates how many un-acknowledged bytes (in-flight
bytes) it can send. A counter keeps track of how many bytes are actually in
flight and when the number of bytes in flight reaches the size of the congestion
window, the sender must pause until more acknowledgments arrive. The size of the
congestion window can be changed dynamically and determines how fast a sender
pushes data to the network.

The first implementations of TCP congestion control detected congestion through
packet loss. Assuming congested nodes start dropping packets, the sender assumes
that as long as no packet loss occurs, the link is uncongested. An AIMD sender
starts with a small congestion window which it gradually increases as long as no
congestion is detected. With each round trip, the congestion window is increased
by adding some constant. When congestion increases and packets get lost, the
congestion window is decreased by a factor between 0 and 1.

This method leads to a pattern of alternating between filling and draining
buffers on the network nodes. As long as no congestion occurs and the congestion
window is increased, the buffer on the slowest node fills up. When packets start
to get lost and the congestion window (and thus the rate at which packets are
sent) is decreased, the bottleneck buffer can slowly drain and reduce congestion
again.

<!-- TODO: Cite AIMD stability? -->

<!-- TODO: Write about pacing? -->

## Real-time Media Streaming

Alternating between high and low buffer fillings is fine when you want to
transmit a file or perform any other kind of bulk transfer, where the only
requirement is that some bytes be transferred to a receiver. In real-time media
transmissions, however, things are slightly different. We might for example want
to transmit a video stream and an audio stream from a webcam and microphone in a
videoconference using the Real-time Transport Protocol (RTP). A crucial
requirement for the videoconference is interactivity, which means that the
participants can talk to each other without delays. The higher the delay, the
harder it gets to have a useful conversation. Since filled network buffers as
created by loss-based congestion control also leads to higher RTTs and thus
higher end-to-end latencies, we need different algorithms for congestion
controlling real-time media.

<!-- TODO: Visualize Operation Point (see BBR paper)? -->

Instead of waiting for packet loss to occur, low-latency congestion control uses
the end-to-end delay to monitor congestion. This works by monitoring the growth
of the delay between the packet departure from the sender and its arrival at the
receiver. The IETF had a [working group working on congestion control for
interactive real-time media](https://datatracker.ietf.org/wg/rmcat/about/).
Within this working group, three different algorithms were proposed: [Google
Congestion Control
(GCC)](https://datatracker.ietf.org/doc/draft-ietf-rmcat-gcc/), [Self-Clocked
Rate Adaptation for Multimedia
(SCReAM)](https://datatracker.ietf.org/doc/rfc8298/) and [Network-Assisted
Dynamic Adaptation (NADA)](https://datatracker.ietf.org/doc/rfc8698/). GCC,
SCReAM and NADA all make use of different signals of congestion, including in
some form the delay between packet departure and arrival.

### Media Encoding and Bandwidth Estimation

Another difference between real-time media streaming and bulk transfers is how
the data to send is generated. In a file transfer for example, the whole file
eventually needs to be sent and thus all the bytes of which the file consists
will eventually be queued for sending on the network. Live-media on the other
hand is created at a steady rate and needs to be transmitted at roughly the same
rate to avoid growing a queue. Instead of directly sending the raw media, the
media is usually first encoded by some media encoder and to adapt to the
available bandwidth, media producers can for example choose different video
resolutions, frame rates or encoder compression rates.

To help a sender choose the corrrect media encoding configurations and adapt to
new bandwidths over time, GCC, NADA and SCReAM provide a bandwidth estimation.
The estimation can guide the sender to re-configure the encoder to an
appropriate target bitrate.

Media encoders can only be configured to a target bitrate, which they try to
achieve on average but they do not guarantee to output encoded media at exactly
this rate. The actual output can change very dynamically, key frames tend to
create spikes, while non-key frames produce less data. Additionally, frequent
rate changes can have a negative impact on the perceived quality and thus most
of the time, we only want to use a small number of pre-configured different
configurations. The sender can then switch to higher or lower levels depending
on the level of congestion observed on the network. This makes it harder to
probe for higher bandwidth, though, since it is now impossible to send more data
than generated by the encoder. To solve this, we can send additional data
packets just to probe for higher bandwidths before switching to the next higher
encoder configuration. Instead of sending empty or padding only packets it is
also possible to use redundant data such as [Forward Error Correction
(FEC)](https://datatracker.ietf.org/doc/rfc8854/) packets for probing.

## Congestion Signaling

We have talked a lot about how loss and delay can be used to infer congestion to
implement different congestion control algorithms. One thing we ignored so far
is how the sender can actually monitor loss and delay. In TCP, acknowledgments
and retransmission timeouts can be used to infer packet loss. RTP doesn't have
acknowledgments itself. Retransmissions are also not always desirable in RTP,
since we do not need to retransmit frames if we know they would arrive to late
to be played out in real-time at the receiver. But next to RTP we do have the
RTP Control Protocol (RTCP). RTCP offers a lot of features to exchange control
data such as synchronization information or quality statistics between peers.
RTCP offers different message types for different kinds of control data and
specifically for implementing congestion control there are two proposed formats
available: [Transport-wide Congestion
Control (TWCC)](https://datatracker.ietf.org/doc/html/draft-holmer-rmcat-transport-wide-cc-extensions-01)
and [RTP Control Protocol (RTCP) Feedback for Congestion
Control (RFC 8888)](https://datatracker.ietf.org/doc/rfc8888/).

Both proposals provide a message format for media receivers to give feedback
about the received RTP packets to the sender. The feedback reports include
information about which exact RTP packets arrived and for each packet a
timestamp describing the time at which the packet arrived at the receiver. Using
TWCC or RFC 8888 senders can implement any of the algorithms GCC, SCReAM or
NADA.

<!-- TODO: Go into detail with TWCC and RFC 8888? -->

An alternative to using the proposed feedback formats to send the feedback from
the receiver to the sender is to run the bandwidth estimation algorithm at the
receiver side. In this case, we still need some RTCP feedback, but here it will
not include detailed information about the received packets, but instead give
the sender periodic updates about the estimated available bandwidth, so that it
can reconfigure the encoder. One way to implement this setup is to use the [RTCP
message for Receiver Estimated Maximum Bitrate
(REMB)](https://datatracker.ietf.org/doc/draft-alvestrand-rmcat-remb/). Since
the receiver side bandwidth estimation still relies on the growths of the
end-to-end delay, which it can only calculate if it knows the departure and
arrival times of the packets, the sender can use an RTP header extension called
"Absoulte Sender Time", to give this information to the receiver. The "Absoulte
Sender Time" header extension is described in the same document as REMB.

## Conclusion

This post describes the reasons for using congestion control and the basic
functionality of congestion control algorithms for different purposes. While the
first congestion control algorithms relied on packet loss to detect congestion
control, this is not applicable to real-time streaming. To achieve low-latency
streaming, we have to make use of congestion control algorithms that minimize
end-to-end delay instead. In a follow-up post, we will look into the details of
congestion control techniques such as GCC and TWCC/RFC 8888 and how they are
implemented in Pion.
