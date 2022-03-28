---
title: Congestion Control and Bandwidth Estimation for Real-time Media
Description: Solving Congestion Collapse for Real-time Media Streaming
date: 2022-03-25
authors: ["Mathis Engelbart"]
---

## Congestion Collapse and Fair Resources Sharing

The Internet Protocol (IP) provides a best-effort transmission service. IP
packets sent by an endpoint are forwarded hop-by-hop until they reach their
destination. Depending on their path, they may be re-ordered or even lost on the
way. Any additional features, such as reliability (guaranteed delivery) or
ordered delivery, must be added by transport protocols on top of IP. TCP, for
example, uses acknowledgments and retransmission-timers to identify and
retransmit lost packets: If a packet has not been acknowledged by the receiver
before a timer expires, the packet is assumed to be lost and will be
retransmitted.

On their path from the sender to the receiver, packets can pass several nodes
that the connection shares with other connections:

![Topology](/img/cc-example-topology.png)

When the amount of packets going over one of the links exceeds the link's
capacity, packets may be buffered on the node before being forwarded. Buffering
increases the delay between sending and receiving a packet and thus also
increases the Round-Trip Time (RTT). If the RTT becomes too large, the
retransmission timer will expire while the packet is still in transit. The
sender will then send another copy of the same packet. The duplicate of the
packet adds additional load on the network, increasing the amount of data to
transmit and buffer and, in turn, increasing the RTT even further, causing more
retransmissions. When a buffer at a network node becomes full, the node starts
dropping packets. Although eventually, some copy of each packet will arrive at
the receiver, the throughput will only be a fraction of the actual capacity.
This situation is called congestion collapse and was first [described for TCP in
the 1980s](https://datatracker.ietf.org/doc/html/rfc896).

A second type of congestion collapse that leads to degraded performance occurs
when a high amount of packets is dropped by a downstream link. In the
illustration above, this could happen, when a lot of packets are dropped on the
link between *Router B* and *Receiver 2*. If *Sender 2* continous to send more
packets than the last link can handle, it creates congestion on the link between
*Router A* and *Router B*, which negatively impacts the connection between
*Sender 1* and *Receiver 1*, even if this connection doesn't use the link with
the high drop rate.

Another aspect of congestion control is fairness. Each connection should receive
a fair share of the available bandwidth. Thus, congestion control algorithms
should not always try to send as much data as possible because that could starve
other flows traversing the same bottleneck node. Instead, they should behave
reasonably fair when new flows arrive or are already present on the path. There
are [different measures](https://en.wikipedia.org/wiki/Fairness_measure)
available to evaluate the fairness of congestion control algorithms.

Congestion control ensures that senders don't send more data into the network
than the network can handle. Since network paths can change all the time and
connections can come and go, the bandwidth between two endpoints can change
anytime, too. The best-effort network doesn't provide any information on current
congestion, and thus the endpoints have to implement congestion control in the
endpoints, which is called *end-to-end* congestion control. Transport protocols
must constantly monitor the network and update the send rate to quickly adapt to
the changing environment.

## Window based Congestion Control 

The basic idea of end-to-end congestion control is to prevent the sender from
overloading the network with too much data. A lot of research has been done to
develop different algorithms to achieve this goal over the past decades. Today,
many different congestion control algorithms are available for different
transport protocols and applications that fulfill different requirements.

Window-based congestion control uses a congestion window (CWND) to control the
sending speed. The idea of the congestion control window is similar to the flow
control window: A sender maintains a window size that indicates how many
un-acknowledged bytes it can send. A counter keeps track of how many bytes are
actually in flight, and when the number of bytes in flight reaches the size of
the congestion window, the sender must pause until more acknowledgments arrive.
The size of the congestion window can be changed dynamically and determines how
fast a sender pushes data to the network. Depending on the current level of
congestion, a sender can either increase the congestion window size to send
faster or decrease the congestion window size to send slower.

Many TCP congestion control algorithms detect congestion through packet loss.
Assuming congested nodes start dropping packets, the sender assumes that the
link is uncongested as long as no packet loss occurs. An AIMD sender starts with
a small congestion window which gradually increases as long as no congestion is
detected. With each round trip, the congestion window increases by adding some
constant. When congestion increases and packets get lost, the congestion window
is decreased by a factor between 0 and 1.

This method leads to an alternating pattern between filling and draining buffers
on the network nodes. The slowest node's buffer fills up as long as no
congestion is observed and the congestion window increases. When packets start
to get lost and the congestion window (and thus the rate at which packets are
sent) decreases, the bottleneck buffer can slowly drain and reduce congestion
again. Alternating between high and low buffer fillings is fine when you want to
transmit a file or perform any other kind of bulk transfer, where the only
requirement is that some bytes be transferred to a receiver. However,
alternating between filling and draining queues also leads to frequent RTT
changes which together with the frequently changing sending rate is problematic
for real-time media streaming.

<!-- TODO: Cite AIMD stability? -->

<!-- TODO: Write about pacing? -->

## Real-time Media Streaming

In real-time media transmissions, we might, for example, want to transmit a
video stream and an audio stream from a webcam and microphone in a
videoconference using the Real-time Transport Protocol (RTP). A crucial
requirement for videoconferences is interactivity, which means that the
participants can talk to each other without delays. The higher the delay, the
harder it gets to have an interactive conversation. Since filled network buffers
created by loss-based congestion control also lead to higher RTTs and thus
higher end-to-end latencies, we need different algorithms for congestion
controlling real-time media. Additionally, sending media at frequently changing
sending rates leads to a lot of quality changes of the transmitted media stream.

<!-- TODO: Visualize Operation Point (see BBR paper)? -->

Instead of waiting for packet loss, low-latency congestion control uses the
end-to-end delay to monitor congestion. The core idea of delay based congestion
control is based on an observation of the interplay between buffers in the
network and the available bandwidth. On each path between two endpoints, there
is one link, which acts as the bottleneck link, that determines the available
bandwidth between the two nodes. While the buffer on the bottleneck node is
empty, the available bandwidth is not reached, but as soon as the buffer starts
filling up, the bandwidth is determined by the speed at which the node can send
packets from the buffer to the next hop. The level to which the buffer is filled
does not make any difference to the bandwidth, but the higher the filling level,
the more increases the one-way delay. The one-way delay reaches a maximum, when
the buffer overflows and packets start being dropped. ([There is a nice
illustration of this observation in the publication of BBR, a new congestion
control algorithm developed by
Google](https://queue.acm.org/detail.cfm?id=3022184))

Delay based congestion controllers monitor this one-way delay and try to achieve
a sending rate at the point between fully utilizing the available bandwidth and
keeping the buffer as empty as possible. The IETF had a [working group working
on congestion control for interactive real-time
media](https://datatracker.ietf.org/wg/rmcat/about/). Within this working group,
three different algorithms were proposed: [Google Congestion Control
(GCC)](https://datatracker.ietf.org/doc/draft-ietf-rmcat-gcc/), [Self-Clocked
Rate Adaptation for Multimedia
(SCReAM)](https://datatracker.ietf.org/doc/rfc8298/) and [Network-Assisted
Dynamic Adaptation (NADA)](https://datatracker.ietf.org/doc/rfc8698/). GCC,
SCReAM, and NADA all use different congestion signals, including the delay
between packet departure and arrival, to keep the end-to-end delay as low as
possible. By keeping the sending rate close to the point between highest
bandwidth and lowest delay instead of alternating between increasing and
decreasing rates, delay based algorithms also solve the problem that frequent
sending rate changes lead to unpleasently frequent changes in the received media
stream.

### Media Encoding and Bandwidth Estimation

Another difference between real-time media streaming and bulk transfers is how
the data to send is generated. For example, in a file transfer, the whole file
eventually needs to be sent. Thus, all the bytes of which the file consists will
be queued for shipping on the network. Live media, on the other hand, is created
at a steady rate and needs to be transmitted at roughly the same speed to avoid
growing a queue. Instead of directly sending the raw media, the media is usually
first encoded by some media encoder, and to adapt to the available bandwidth,
media producers can, for example, choose different video resolutions, frame
rates, or encoder compression rates. (See [WebRTC for the
Curious](https://webrtcforthecurious.com/docs/06-media-communication/#video-101)
for a brief introduction to video compression for RTP).

To help a sender choose the correct media encoding configurations and adapt to
new bandwidths over time, GCC, NADA, and SCReAM provide a bandwidth estimation.
The estimation can guide the sender to reconfigure the encoder to an appropriate
target bitrate. When a media encoder is configured to a target bitrate, it tries
to achieve this rate on average, but it doesn't guarantee to output encoded
media at precisely this rate. The actual output can change very dynamically.
Keyframes tend to create spikes, while non-key frames result in fewer bytes to
send. Again, frequent rate changes can harm the perceived quality. Thus, we only
want to use a small number of pre-configured configurations most of the time.
The sender can then switch to higher or lower levels depending on the congestion
observed on the network. This makes it harder to probe for higher bandwidth,
though, since it is now impossible to send more data than generated by the
encoder. To solve this, we can send additional data packets just to probe for
higher bandwidths before switching to the next higher encoder configuration.
Instead of sending empty or padding only packets, it is also possible to use
redundant data such as [Forward Error Correction
(FEC)](https://datatracker.ietf.org/doc/rfc8854/) packets for probing.

## Congestion Signaling

We have talked a lot about how loss and delay can be used to infer congestion to
implement different congestion control algorithms. One thing we have ignored so
far is how the sender can actually monitor loss and delay. In TCP,
acknowledgments and retransmission timeouts can infer packet loss. RTP doesn't
have acknowledgments itself. Retransmissions are also not always desirable in
RTP since we do not need to retransmit frames if we know they would arrive too
late to be played out in real-time at the receiver. But next to RTP, we have the
RTP Control Protocol (RTCP). RTCP offers many features to exchange control data,
such as synchronization information or quality statistics between peers. RTCP
offers different message types for different kinds of control data.
Specifically, for implementing congestion control, there are two proposed
formats available: [Transport-wide Congestion Control
(TWCC)](https://datatracker.ietf.org/doc/html/draft-holmer-rmcat-transport-wide-cc-extensions-01)
and [RTP Control Protocol (RTCP) Feedback for Congestion Control (RFC
8888)](https://datatracker.ietf.org/doc/rfc8888/).

Both proposals provide a message format for media receivers to give feedback
about the received RTP packets to the sender. The feedback reports include
information about which exact RTP packets arrived and, for each packet, a
timestamp describing the time at which the packet arrived at the receiver. Using
TWCC or RFC 8888, senders can implement any of the algorithms GCC, SCReAM, or
NADA.

<!-- TODO: Go into detail with TWCC and RFC 8888? -->

An alternative to using the proposed feedback formats to send the feedback from
the receiver to the sender is to run the bandwidth estimation algorithm at the
receiver side. In this case, we still need some RTCP feedback. This time, it
will not include detailed information about the received packets but instead
give the sender periodic updates about the estimated available bandwidth to
reconfigure the encoder. One way to implement this setup is to use the [RTCP
message for Receiver Estimated Maximum Bitrate
(REMB)](https://datatracker.ietf.org/doc/draft-alvestrand-rmcat-remb/). The
receiver side bandwidth estimation still relies on the growths of the end-to-end
delay, which it can only calculate if it knows the departure and arrival times
of the packets. The sender can use an RTP header extension called "Absoulte
Sender Time" to give this information to the receiver. The "Absoulte Sender
Time" header extension is described in the same document as REMB.

## Conclusion

This post describes the reasons for using congestion control and the basic
functionality of congestion control algorithms for different purposes. While the
first congestion control algorithms relied on packet loss to detect congestion
control, this does not apply to real-time streaming. To achieve low-latency
streaming, we have to use congestion control algorithms that minimize end-to-end
delay. In a follow-up post, we will look into the details of congestion control
techniques such as GCC and TWCC/RFC 8888 and how they are implemented in Pion.

