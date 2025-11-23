---
title: Why WebRTC Survives When You Walk Out
Description: An overview of automatic renomination in Pion
date: 2025-10-17
authors: ["Kevin Wang"]
---

WebRTC, like many protocols, works by first establishing a connection
between two peers and then sending media over that connection. What happens
when the quality of that connection changes? For example, if you're calling
from a cell phone and you leave your home wifi, you might want to switch to 5G.

With [automatic renomination](https://github.com/pion/ice/pull/822), Pion
will now handle that completely seamlessly, allowing your media to flow
without skipping a beat. It works by periodically detecting when new
connection candidates are available and automatically switching to the
highest quality candidate, taking advantage of a feature in WebRTC called
*renomination*.

Let's dive into how that works.

## How does WebRTC establish connections?

Connections between two peers in WebRTC are established by exchanging
**candidates** between the two peers in a signaling phase. These candidates
can be host, mDNS, server reflexive, peer reflexive, or relay candidates.
The details of the various types of candidates are better explained in
[WebRTC for the Curious](https://webrtcforthecurious.com/docs/03-connecting/#candidate-gathering),
but the relevant detail is that for each candidate, both peers open up
ports to communicate.

![Candidates](/img/candidates-1.drawio.png)

Eventually, the **controlling** peer picks a candidate and tells the
**controlled** peer to use it in a Binding request. This candidate becomes
the selected candidate that media flows over. After this point, the unused
ports are closed.

![Candidates](/img/candidates-2.drawio.png)

But wait! This handshake is pretty slow. To speed things up and get media
flowing faster, WebRTC allows media to flow over _any_ candidate before one
is formally nominated. This shaves off a few round trips between the peers,
reducing connection latency, in a process called
[aggressive nomination](https://datatracker.ietf.org/doc/html/rfc5245#section-8.1.1.2).

## Changing candidates with renomination

Now, what if we *never* commit a candidate? The ability to send media over
any valid candidate is curious, and in fact quite useful because it means
we have multiple paths to take advantage of. This is called **renomination**.

Under renomination, the controlling peer tells the controlled peer that it
wants to be able to renominate candidates. When the controlled peer
receives a binding request, instead of closing the ports, it leaves them
open. This allows the controlling peer to elect a new candidate at will,
which the controlled peer will accept media over, effectively enabling us
to switch candidates mid-stream.

![Candidates](/img/candidates-3.drawio.png)

That can sound complex to negotiate but it amounts to a flag in the
connection handshakes that ensures that both parties are aware of the desire
to renominate, meaning the implementation of this feature in pion amounts to
[keeping track of a counter](https://github.com/pion/ice/pull/799/files#diff-7099be149fabcd94ee9bab48ac30474180ef5c9ce65922291d181e0349aab230).

Now pion is taking advantage of WebRTC's aggressive nomination state,
keeping candidates open, and has the ability to pick a new candidate.

## Making it automatic

Ideally, the WebRTC connection can do this automatically so the
user doesn't have to pick. After all, manually renominating candidates seems
useful but is a tedious user experience. Let's do it automatically!

To make this work, we need to solve two problems: knowing when the current
candidate gets worse, and discovering when completely new candidates appear.

**Detecting when candidates get worse:** Turns out, this is already built
into WebRTC. During the first connection establishment phase, candidates are
pinged, evaluated, and ranked based on round trip time, packet loss, and
type of candidate. This same ranking can be performed periodically instead
of only at initialization. So, the connection can run this on a loop and
automatically renominate candidates when the state of the network changes.

**Discovering new candidates:** What happens when a completely new candidate
comes online? For example, if I connect to a wifi network mid-call, the
phone receives a completely new IP address.

This, too, is built into WebRTC, in the form of trickle ICE! If trickle
ICE is enabled, candidate exchange can continue after the initial
connection handshake until the two sides declare that they've exhausted the
candidate search. Under automatic renomination, we go one step further and
**disable the exhaustion declaration**, periodically checking for new
candidates instead. When a new candidate arrives, we use the normal trickle
ICE mechanism to exchange it between the two peers.

## Putting it all together

And that ends up being enough! In summary, automatic renomination makes the
following tweaks:

* Signal renomination between the peers
* Keep all candidate ports open instead of closing them
* Disable trickle ICE termination
* Periodically ping all candidates and rerank them
* Renominate when a better candidate arises

With these pieces in place, pion can seamlessly transition between different
network links.

One really nice thing that I personally liked about this feature when
implementing it is that it felt like automatic renomination is a
clever reading of the specification: it doesn't need to reinvent a whole
new mechanism and RFC.

In fact, one can go one step further and send media over *all* candidates,
because under aggressive nomination they are all valid. This, actually, is
connection bonding for free! There are some practical considerations to
getting this working well though, but that's another blog post.
