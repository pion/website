---
title: "DTLS 1.3 in Go: An Implementer’s Perspective"
description: DTLS 1.3 uses less data and connects faster. It is more secure and handles bad networks better.
date: 2026-08-21
authors: ["Theodor Midtlien", "Jo Turk", "Adriano Sela Aviles", "R Chiu", "Sean DuBois"]
---

## What Is DTLS?
DTLS is the Datagram (UDP) variant of TLS. You might not be familiar with TLS, but you use it extensively!

TLS is the protocol used for secure communication across the Internet (and intranets). Most web browsing and many email and VPN services run over it.

(D)TLS solves three things:

* **Encryption** - Prevent attackers from seeing the protected data
* **Authentication** - Confirm who you are communicating with
* **Integrity** - Detect tampered or corrupted records

To accomplish this, TLS standardized a handshake so two TLS peers can agree on a cipher suite and keying material. DTLS extends and modifies the TLS
handshake so it can work over a lossy protocol.

If you are curious about deeper details on the protocol, see [WebRTC for the Curious - Securing](https://webrtcforthecurious.com/docs/04-securing/).

---

## DTLS 1.3 Upgrades
*DTLS 1.3 had quite a few changes. These are the ones we noticed and found most exciting.*

### Uses Less Data
Each DTLS 1.2 record has a header with metadata required for the session.
Each record uses a fixed **13-byte** record header:

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

DTLS 1.3 uses a variable-length unified header that can be as small as **2 bytes**:

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

> [!NOTE]
> With Pion's default MTU of 1200, you could save **50 MB** on a **5 GiB transfer!** That might not sound like a lot, but at scale, it will add up to massive savings.

### Connects Faster
DTLS 1.3 connects faster for two reasons.

**First, DTLS 1.3 has explicit ACKs.** During the handshake, if a datagram was lost in DTLS 1.2, both sides would wait and then retransmit on timeout.
With DTLS 1.3, each side can send explicit `ACK` messages. This allows selective or early retransmission after a datagram loss.

**Second, DTLS 1.3 allows a key share in the `ClientHello`.** This removes an entire round trip. The server no longer waits for the `ClientKeyExchange`!

> [!NOTE]
> This allows the handshake to be shrunk down to only **1 RTT** (from **2** in DTLS 1.2).

Below are simplified versions of the handshakes. Note how the client only has to wait for one server flight to receive encrypted data (Application Data)
in DTLS 1.3, versus waiting for two server flights in DTLS 1.2.

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
                           <-----         ServerHello, EncryptedExtensions, Finished, Application Data

                         Server data after 1 RTT
```

### Improved Security
DTLS 1.3 improves security in a bunch of ways: lots of insecure and brittle stuff was removed, and a few new things were added.

**Renegotiation was removed.** Renegotiation was a source of bugs and security issues (`CVE-2009-3555`) and was entirely removed. Pion DTLS never implemented
renegotiation, but we are excited not to get requests for it anymore!

**More of the handshake is encrypted.** A big improvement is that certificates are no longer exchanged in plaintext.
This was a big fingerprinting surface that is now closed.

**Fragile and difficult-to-implement cipher suites are removed.** Only `AEAD` cipher suites are available now.
`AEAD` is easier to use because encryption and authentication are done in one call.

Compare Pion's use of [CBC](https://github.com/pion/dtls/blob/eb478beb01bd0e4e6b62d934314311308dc5b514/pkg/crypto/ciphersuite/cbc.go#L71)
to its use of [AEAD](https://github.com/pion/dtls/blob/eb478beb01bd0e4e6b62d934314311308dc5b514/pkg/crypto/ciphersuite/ciphersuite.go#L64).

With `CBC`, we have to do authentication and encryption separately. `AEAD` combines authentication and encryption into one operation. Another benefit is
that `AES-GCM` is often more performant. Since `CBC-and-HMAC` involves two operations, you end up with more copying and instructions.

**Forward secrecy is required for all non-pre-shared-key sessions.**

In DTLS 1.2, you had the option to use cipher suites with `RSA` key exchange
or ephemeral key exchange. Ephemeral key exchange means you generate a new key for each session. RSA means the server would reuse the same key across many
sessions. If an attacker got access to the private key for RSA sessions, they could decrypt every session. With ephemeral keys, the attacker needs the keys
for each individual session.

A pre-shared-key session can still be configured not to use ephemeral keys. Devices that are battery-powered or constrained
might not be powerful enough to generate an ephemeral key pair for each session, so they may use this instead.

### Connection Identification Added
One of the exciting things about UDP is its connectionless nature. A user can stream media or upload a file and switch networks without interruption.

This wasn't easily possible with DTLS because it doesn't provide a session identifier. Most deployments would depend on the client's IP address and port as the session identifier.

DTLS 1.3 and RFC 9146, an extension to DTLS 1.2, have a fix for this, though! DTLS record headers can now contain a unique ID for the session.

You can now uniquely identify your DTLS traffic. This solves a few problems for DTLS users.

* **Identify clients** as they switch between Wi-Fi and cellular networks.
* **Load balance effectively** by routing sessions to specific servers.
* **Support long-running sessions.** An IoT device can shut down and come back days later.

---

## Implementer's Perspective

### Finished Is a Different Story in 1.3
In Pion DTLS 1.2, we had one finite state machine. **After the handshake finishes, you are done.** With DTLS 1.3, things get a bit more complicated! You need to handle `NewSessionTicket` and `KeyUpdate`. *Going into this project, I didn't appreciate that complication from just reading the IETF doc.*

**This required a second state machine** with its own `ACK` handling, retransmission timer, etc. See Pion's [post-handshake implementation](https://github.com/pion/dtls/blob/eb478beb01bd0e4e6b62d934314311308dc5b514/internal/handshake/post_handshake.go#L36-L55).

*— [Sean-Der](https://github.com/Sean-Der)*

### The Names Are Scarier Than the Concepts
The TLS and DTLS specs make things feel really complex, but the concepts underneath are actually pretty simple. The spec is dense with terms like `HKDF`, `AEAD`, and `AES`. Once you learn the vocabulary, it's actually quite easy to follow!

*— [Jo Turk](https://github.com/JoTurk)*

### The Spec Isn't Linear
You can implement something near the end of the spec and discover that you need to refactor everything from the record layer to the ciphers. [Section 6.1](https://www.rfc-editor.org/rfc/rfc9147.html#section-6.1) introduces epochs, but it isn't until [Section 8](https://www.rfc-editor.org/rfc/rfc9147.html#section-8) that it becomes clear that the client can be at epoch 3 while the server is at epoch 4, and that the state needs to be explicitly directional.

Our initial implementation maintained only one active epoch and record protection per direction. Supporting `KeyUpdate` required per-epoch state and a series of refactors. See [the tracking issue](https://github.com/pion/dtls/issues/983).

*— [Jo Turk](https://github.com/JoTurk)*

### DTLS 1.2 Fallback Isn't a Fresh Handshake
Falling back from a 1.3 handshake to 1.2 is not the same as starting a fresh 1.2 handshake. State from the dual-version path can leak into the fallback and break interoperability with a pure 1.2 implementation. It's important to test a 1.2 only implementation. It's not good enough to just force a 1.3 implementation into 1.2 mode!

We found several bugs where the fallback offered 1.3 extensions or dropped 1.2 extensions. [One example was fixed in Pion DTLS #1030](https://github.com/pion/dtls/pull/1030).

*— [Jo Turk](https://github.com/JoTurk)*

### Sharing Code Means Understanding Both Specs
Supporting DTLS 1.2 and 1.3 in one stack was harder than implementing 1.3 alone. Reusing negotiation and extension-validation code appears straightforward, but they have minor differences between the versions.

Retry behavior is different between versions. In DTLS 1.2 a `ClientHello` could change from a `HelloVerifyRequest`. In 1.3 a `HelloRetryRequest` causes the client to send a second `ClientHello` and it has stricter rules around what can change.
Moving negotiation and validation into shared libraries exposed extension-validation bugs. We had to [reject unsolicited server extensions](https://github.com/pion/dtls/pull/1028), [require configured SRTP profiles on both the client and server](https://github.com/pion/dtls/pull/1038), and [validate extension blocks in every context](https://github.com/pion/dtls/pull/1023).

Reducing code duplication ended up being a much harder task than anticipated.

*— [Jo Turk](https://github.com/JoTurk)*

### The Importance of Interop Testing

While working on Pion DTLS, [Jo Turk](https://github.com/JoTurk) created a dedicated repository for DTLS interoperability testing: [dtls-interop](https://github.com/pion/dtls-interop).

Testing against wolfSSL she found three issues in Pion's DTLS 1.3 implementation (and fixed them)

* [Recognize partial handshake retransmissions](https://github.com/pion/dtls/pull/1001)
* [Resume and ACK split flights](https://github.com/pion/dtls/pull/1002)
* [Handle duplicated Flight 4](https://github.com/pion/dtls/pull/1003)

It currently tests against OpenSSL, BoringSSL (Chrome), and wolfSSL. Firefox and more will be added soon!
