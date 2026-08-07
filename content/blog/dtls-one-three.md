---
title: DTLS 1.3 is a sweet upgrade
description: DTLS 1.3 uses less data, connects faster, more secure and handles bad networks better.
date: 1970-01-01
authors: ["Theodor Midtlien", "Jo Turk", "Adriano Sela Aviles", "R Chiu", "Sean DuBois"]
---

## What is DTLS?
DTLS is the Datagram (UDP) variant of TLS. You might not be familiar with TLS, but you use it extensively!
TLS is the protocol used for secure communication across the Internet (and Intranets). Most Web browsing and many emails/VPNs run over it.

(D)TLS solves three things.
* Encryption - Prevent attackers from seeing the protected data
* Authentication - Confirm who you are communicating with
* Integrity - Detect tampered or corrupted packets

To accomplish this TLS standardized a handshake so two TLS peers can agree upon a Cipher and Keying material. DTLS extends/modifies the TLS
handshake so it can work over a lossy protocol.

If you are curious about deeper details on the protocol see [WebRTC for the Curious - Securing](https://webrtcforthecurious.com/docs/04-securing/)

## DTLS 1.3 Upgrades
DTLS 1.3 had quite a few changes. These are the ones we noticed/were most exciting to us.

### Uses Less Data
Each DTLS 1.2 packet has a header with metadata required for the session.
Each packet used a fixed 13-byte record header:

```text
      0 1 2 3 4 5 6 7
     +-+-+-+-+-+-+-+-+
     |  Content Type |  1 byte
     +-+-+-+-+-+-+-+-+
     |    Version    |  2 bytes
     +               +
     |               |
     +-+-+-+-+-+-+-+-+
     |     Epoch     |  2 bytes
     +               +
     |               |
     +-+-+-+-+-+-+-+-+
     |               |
     +               +
     |               |
     +    Sequence   +  6 bytes
     |     Number    |
     +               +
     |               |
     +-+-+-+-+-+-+-+-+
     |     Length    |  2 bytes
     +               +
     |               |
     +-+-+-+-+-+-+-+-+
```

DTLS 1.3 use a variable-length unified header that can be as small as 2 bytes:

```text
      0 1 2 3 4 5 6 7
     +-+-+-+-+-+-+-+-+
     |0|0|1|C|S|L|E E|  1 byte
     +-+-+-+-+-+-+-+-+
     | Connection ID |  optional, variable length
     |   (if any)    |
     +-+-+-+-+-+-+-+-+
     |  8- or 16-bit |  1 or 2 bytes
     |Sequence Number|
     +-+-+-+-+-+-+-+-+
     | 16-bit Length |  optional, 2 bytes
     +-+-+-+-+-+-+-+-+

     C = Connection ID present
     S = Sequence number length
     L = Length present
     E = Epoch
```

With a MTU of 1280 (default for WebRTC) you could save 47 MB for a 5GB transfer! That might not sound like a lot, but at scale that will be massive savings.

### Connects Faster
DTLS 1.3 connects faster for two reasons

First DTLS 1.3 has explicit ACKS. During handshaking if a packet was lost in 1.2 both sides would wait and then retransmit on timeout. With DTLS 1.3
each side now sends explicit ACK messages. This means it can detect and recover from a packet loss immediately.

Second DTLS 1.3 allows key sharing in the Client Hello. This removes an entire round trip, the client no longer waits for the ServerHello!
This allow the handshake to be shrunk down to only 1 RTT (from 2 in DTLS 1.2)

Below is a simplified version of the handshake, but note how the client only has to wait for one message for the server to send encrypted data (Application Data)
in DTLS 1.3 vs waiting for two messages from the server to start.

#### DTLS 1.2

```text
Client                                               Server
------                                               ------
                                  Flight 1
ClientHello                       -------->

                                  Flight 2
                                  <--------          ServerHello, ServerHelloDone

                                  Flight 3
ClientKeyExchange,                -------->
ChangeCipherSpec, Finished

                                  Flight 4
                                  <--------          ChangeCipherSpec, Finished, Application Data

                     Server data after 2 RTTs
```

#### DTLS 1.3

```text
Client                                    Server
------                                    ------
                           Flight 1
ClientHello + key_share    ----->

                           Flight 2
                           <-----         ServerHello, Finished, Application Data

                         Server data after 1 RTT
```

### Loss Resilence
### More Secure
### Network Mobility
### Easier to Scale

## DTLS 1.3 an implementors perspective
### More complex then you expect
### ACKs (instead of timeouts) make me so happy
### IoT improvements are a big deal
