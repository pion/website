---
title: DTLS 1.3 is a sweet upgrade
description: DTLS 1.3 uses less data, connects faster, it's more secure, and handles bad networks better.
date: 1970-01-01
authors: ["Theodor Midtlien", "Jo Turk", "Adriano Sela Aviles", "R Chiu", "Sean DuBois"]
---

## What is DTLS?
DTLS is the Datagram (UDP) variant of TLS. You might not be familiar with TLS, but you use it extensively!
TLS is the protocol used for secure communication across the Internet (and intranets). Most web browsing and many emails/VPNs run over it.

(D)TLS solves three things:

* Encryption - Prevent attackers from seeing the protected data
* Authentication - Confirm who you are communicating with
* Integrity - Detect tampered or corrupted records

To accomplish this, TLS standardized a handshake so two TLS peers can agree on a cipher and keying material. DTLS extends and modifies the TLS
handshake so it can work over a lossy protocol.

If you are curious about deeper details on the protocol, see [WebRTC for the Curious - Securing](https://webrtcforthecurious.com/docs/04-securing/).

## DTLS 1.3 Upgrades
DTLS 1.3 had quite a few changes. These are the ones we noticed and found most exciting.

### Uses Less Data
Each DTLS 1.2 record has a header with metadata required for the session.
Each record uses a fixed 13-byte record header:

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

DTLS 1.3 uses a variable-length unified header that can be as small as 2 bytes:

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

With an MTU of 1280 (the default for WebRTC), you could save 47 MB on a 5 GB transfer! That might not sound like a lot, but at scale, that will be massive savings.

### Connects Faster
DTLS 1.3 connects faster for two reasons.

First, DTLS 1.3 has explicit ACKs. During handshaking, if a datagram was lost in DTLS 1.2, both sides would wait and then retransmit on timeout. With DTLS 1.3,
each side now sends explicit ACK messages. This means it can detect and recover from a datagram loss immediately.

Second, DTLS 1.3 allows key sharing in the ClientHello. This removes an entire round trip, the server no longer waits for the ClientKeyExchange!
This allows the handshake to be shrunk down to only 1 RTT (from 2 in DTLS 1.2).

Below are simplified versions of the handshakes, but note how the client only has to wait for one message for the server to send encrypted data (Application Data)
in DTLS 1.3, versus waiting for two messages from the server to start.

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

### Improved Security
DTLS 1.3 improves security in a bunch of ways: lots of insecure/brittle stuff was removed, and a few new things were added.

Renegotiation was removed. Renegotiation was a source of bugs/security issues (CVE-2009-3555) and was entirely removed. Pion DTLS never implemented
renegotiation, but we are excited not to get requests for it anymore!

For DTLS 1.3 more of the handshake is encrypted. A big improvements is that certificates are no longer exchanged in plaintext.
This was a big fingerprinting surface that is now closed.

Fragile/difficult-to-implement cipher suites are removed. Only AEAD cipher suites are available now.
AEAD is easier to use because encryption + authentication is done in one call.
Compare Pion's use of [CBC](https://github.com/pion/dtls/blob/eb478beb01bd0e4e6b62d934314311308dc5b514/pkg/crypto/ciphersuite/cbc.go#L71)
to its use of [AEAD](https://github.com/pion/dtls/blob/eb478beb01bd0e4e6b62d934314311308dc5b514/pkg/crypto/ciphersuite/ciphersuite.go#L64).
With CBC we have to do authentication and encryption separately. When doing AEAD it is one operation. Another benefit of one operation is
that AES-GCM is often more Performant. Since CBC-and-HMAC is two operations you end up with more copying/instructions.

DTLS 1.3 requires forward secrecy for all non-pre-shared-key sessions. In DTLS 1.2, you had the option to use cipher suites with RSA key exchange
or ephemeral key exchange. Ephemeral key exchange means you generate a new key for each session, RSA means the server would reuse the same key across many
sessions. If an attacker got access to the private key for RSA sessions, they could decrypt every session. With ephemeral keys, the attacker needs the keys
for each individual session. A pre-shared-key session can still be configured not to use ephemeral keys. Devices that are battery-powered/constrained
might not be powerful enough to generate an ephemeral key pair for each session, so they may use this instead.

### Network Mobility/Scaling
One of the exciting things about UDP is its connection-less nature. A user can be streaming media/uploading a file and switch networks without interruption.
This wasn't easily possible with DTLS because it doesn't provide a session identifier. Most deployments would depend on the clients IP+Port as the session identifier.

DTLS 1.3 (and RFC 9146 a modification to DTLS 1.2) have a fix for this though! DTLS record headers now can contain a unique id for the session. You can now uniquely
identify your DTLS traffic. Solves a few problems for DTLS users.

* Identify clients as they switch between WiFi and Cellular.
* Load balance effectively, route sessions to specific servers.
* Support long running sessions. IoT device can shut down and come back days later

## Implementor's perspective

### Finished is a different story in 1.3
In DTLS 1.2 you have have one finite state machine. After the handshakes finishes you are done. With 1.3 things get a bit more complicated! You need to handle NewSessionTicket and KeyUpdate. Going into this project I didn't appreciate that complication from just reading the IETF doc.

This required a second state machine with its own ACK handling, retransmission timer etc..... See Pion's [post-handshake implementation](https://github.com/pion/dtls/blob/eb478beb01bd0e4e6b62d934314311308dc5b514/internal/handshake/post_handshake.go#L36-L55).
