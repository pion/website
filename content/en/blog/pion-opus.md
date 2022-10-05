---
title: Pion Opus
Description: A new Pure Go implementation of the Opus Codec
date: 2022-10-02
authors: ["Sean DuBois"]
---

I am so excited to announce that [pion/opus](https://github.com/pion/opus) is now available. It is a Pure Go implementation
of the [Opus Codec](https://opus-codec.org/). pion/opus is far from done though. It is far enough along for others to start playing
with and contributing too though. We still have a lot more work to do. If you are interested now is a great time to get involved!

Now that the code is shared I wanted to share my goals, what I learned and hopes for the future.

### Why Opus?
I had a few a different reasons for starting this project. Some of the goals I had from the very begining, others I picked up along the way.

**Complete the WebRTC Stack** -
Implementing Opus was a clear next step for the Pion project. For the last 5 years we have been developing different parts
of the [WebRTC Stack](https://webrtcforthecurious.com/docs/01-what-why-and-how/). We have completed everything but audio and
video codecs. It feels great getting closer to the goal of having the entire software stack in one memory.

**Empower others to learn Opus** -
When implementing pion/opus I designed it so others can learn from it. [silk/decoder.go](https://github.com/pion/opus/blob/master/internal/silk/decoder.go#L1676)
includes the relevant comments from the RFC. I made sure to use the same variable names and flow as the RFC. My hope is that developers can jump into the code
and learn quickly from the unit tests and code that follows the RFC.

**Enable Pion users** -
Pion users have been building more and more interesting things. One developer is building Go clients that make it easier
for musicians to play together. Another developer is building clients that make it easier for his customers to bridge
protocols. The last developer is building a WebRTC/Phone bridge. All of them have talked about frustrations with cross
compiling and making C libs work with Go. I am sure more developers have been frustrated and just haven't felt comfortable
enough to discuss it.

**More efficent use of Opus** -
I hope to expose the internals of this library so users can more efficently work with Opus. Maybe instead of running a Fast Fourier transform to implement
a talking notifier developers will only do partial decode. I would also like to build a bitstream analyzer using this library to help users trying to learn Opus.
I am not sure what will happen, but it is always suprising what developers build when you give them more tools.

**Proving Myself** -
Codecs were always a daunting topic to me. I spend a lot of time using codecs, but never really understanding them. It felt like a
chance for growth to take this on. I also get asked lots of questions about coded media and have to answer in generalizations. I
hope in the future I can give people more concrete answers after this project is complete.

**Inspire more Go media projects** -
Go is a incredibly powerful language. You can build scalable, secure and maintainable software quickly. If you have the libraries you need. I believe
having a Opus implementation will inspire other developers to join in the challenge of making Go better for media development. I want a future with more
and more Go media projects, that can't happen unless we write these libraries.

**Get a new group of developers involved in Pion** -
Pion has primarily been WebRTC users. I hope that by having a Opus implementation it will bring a new set of eyes on the Pion project.
I think all the existing Pion projects would benefit greatly from developers joining with different opinions and backgrounds. Personally
it will be motivating to work with new people who have new demands. The pressure of Pion has lowered lately as the core libraries have stabilized.

**Create opportunity for contributors** -
My favorite part of working on Pion is seeing the opportunities it creates. It brings me a lot of happiness watching developers grow as they contribute to Pion.
They become better programmers and collaborators. Pion also provides lots of great career opportunities. I have see multiple contributors get high paying
jobs because of the skills developed while working on Pion. It has ranged from new developers who haven't finished college to seasoned developers with decades of experience.
Getting involved in Open Source can be rewarding for anyone.

### What I learned

Not as much about audio as I hoped! When implementing this codec I spent a lot of time reading [RFC6716](https://www.rfc-editor.org/rfc/rfc6716).
The RFC talks about the how, and not the why though. It is possible to learn the high level details like [LPC](https://en.wikipedia.org/wiki/Linear_predictive_coding).
I wasn't able to find any details about the particulars of SILK itself. When this project is done I hope to go research that and write it down.

A few implementations of Opus exist. [libopus](https://github.com/xiph/opus), [concentus](https://github.com/lostromb/concentus), [lu-zero/opus](https://github.com/lu-zero/opus)
and [FFMpeg](https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/opusdec.c). If you want to learn Opus I found the Rust implementation and FFmpeg the easiest to understand.
It is surprising how most of these efforts were driven by a single person!

The Opus community is very helpful. A special shout out to Luca Barbato who responded to many emails from me. Without his help I would have never made it this far.
The developers in the #opus libera channel were very helpful also. Timothy Terriberry took a lot of time answering my questions on IRC. He also provided earlier/simpler
implementations of Silk which helped me understand things a lot better.

### Future

I don't know how much actual usage this project will see. I think I could have spent my time better elsewhere, but I am happy that I didn't quit. Quite a few times I wanted to give up.
I held on to the idea that it is better to finish late and have something to show, then quit and have nothing at all.

My prediction/hope is that this project will give me an opportunity to work with smart and interesting people. I anticipate that I will get some contributors that want to learn.
I also think this project will mean that [webrtc-rs](https://github.com/webrtc-rs/webrtc) will get a Opus implementation. With this and [rav1e](https://github.com/xiph/rav1e) I see
a future for Pure Rust WebRTC clients!
