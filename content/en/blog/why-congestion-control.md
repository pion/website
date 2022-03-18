---
title: Congestion Control and Bandwidth Estimation for Real-time Media
Description: The reasons for using congestion control and bandwidth estimation
date: 2022-03-18
authors: ["Mathis Engelbart"]
---

### Internet Congestion

The internet protocol (IP) provides a best-effort transmission service. Packets
travel between endpoints on a path of nodes. IP packets are forwarded hop-by-hop
until they reach their destination, and they may be lost or re-ordered on the
way. Nodes can temporarily buffer packets when they arrive faster than they can
be forwarded. When the buffer of a node is full, packets may be dropped.

Any additional features, such as reliability or ordered delivery, must be added
on top of the IP protocol. For example, transport protocols can use
acknowledgments to identify and retransmit lost packets or sequence numbers and
receive buffers to restore the correct order of re-ordered packets. 

The bandwidth between two endpoints is determined by the bandwidth of the
slowest node on the path, the *bottleneck bandwidth*. Nodes can be shared by
different paths, and thus the bottleneck is also shared among the connections.

If an endpoint wants to send data to a peer, it must not send more data than the
network path can handle. Otherwise, packets will get lost, causing the sender to
retransmit them, putting even more load on the network. Thus, transport
protocols need to apply *congestion control* to avoid overloading the network
with too much data.

Congestion control ensures the sender does not send more data into the network
than it can handle. Since network paths can change all the time and connections
can come and go, the bandwidth between two endpoints can change anytime. To
quickly adapt to the changing environment, transport protocols constantly need
to monitor the network and update the speed at which they exchange data.

### Congestion Signaling

Different protocols and applications can use different algorithms for congestion
control, depending on their specific requirements. A class of congestion control
algorithms operates on packet loss. Loss-based algorithms are widely used in
TCP, where the protocol is optimized for bulk transmissions such as file
transfers. Loss-based algorithms utilize the buffering of nodes on the network
path between sender and receiver. To find the bottleneck bandwidth, they
increase the speed of sending data into the network until they observe packet
loss. Then, they treat the packet loss as a signal that a buffer is overflowing
on the bottleneck node and reduce their sending speed. Examples of loss-based
congestion control algorithms are Reno, NewReno, and Cubic. The differences
between these algorithms are mainly the functions by which they increase and
decrease the sending speed. Another signal that can be used as a congestion
signal is the growth of the end-to-end delay between sender and receiver.
Growing delays signal a growing buffer. Shrinking delays indicate that a packet
queue is being emptied.

Congestion Control for Real-time Media Real-time media transmission has some
notable differences to file transfers that impact how congestion control can be
implemented. While a file is basically an array of bytes, present on a drive or
in memory. Each byte can be sent as fast as congestion control allows. On the
other hand, real-time media is - as the name suggests - created in real-time.
The frame needs to be sent at low latency to be played out in real-time at the
receiver. Each byte of a real-time media stream has a deadline, after which it
becomes useless to transmit. Since video data can become quite large, senders
can switch between different resolutions and frame rates or change the target
bitrate of the encoding. Applications use congestion control mechanisms to
estimate the available bandwidth and then calculate the optimal settings for a
media encoder. Due to the low latency requirement, loss-based algorithms are
less applicable to real-time media. As seen before, loss-based algorithms
usually fill the buffers of network nodes to cause packet loss. However, filled
network queues lead to longer delays, increasing the latency at which the media
can be played out at the receiver. Therefore, real-time media applications need
to use congestion control algorithms based on the end-to-end delay. The encoder
settings can be set to higher quality levels as long as the end-to-end delays
stay constant or are decreasing. As soon as the delay increases, there must be
some buffer on a network node filling up, leading to higher latencies. As a
response to the filling buffer, the sender can update the encoder settings to a
lower target bitrate, leading to lower delays due to the shrinking network
queue.

### Fairness

One aspect of congestion control we have not looked at yet is fairness.
As we have seen before, nodes can be part of different paths between different
endpoints simultaneously. Each connection should receive a fair share of the
available bandwidth. Thus, congestion control algorithms should not always try
to send as much data as possible because that could starve other flows
traversing the same bottleneck node. Instead, they should behave reasonably fair
when new flows arrive or are already present on the path. There are [different
measures](https://en.wikipedia.org/wiki/Fairness_measure) available to evaluate
the fairness of congestion control algorithms.

### Conclusion

This post describes the reasons for using congestion control and the basic
functionality of congestion control algorithms for different purposes. In a
follow-up post, we will look into the details of congestion control and
bandwidth estimation for real-time media and how it is implemented in Pion.

