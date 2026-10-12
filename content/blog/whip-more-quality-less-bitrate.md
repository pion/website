---
title: 15% less bitrate at the same video quality by using WHIP
description: Receiver feedback is a big upgrade for video streaming.
date: 2026-10-12
authors: ["Sean DuBois"]
---

If you are familiar with video streaming technology skip to second section. This is just a quick primer
as this post will get pretty heavy on acronyms.

### Compression

Sending raw 4K video (3840×2160, 8-bit YUV420) at 30 FPS would require ~3 Gbps. So we probably need to figure out a
way to make that smaller! Video compression is the answer to our problems. Video compression comes in two types.

The first is intra-frame. Intra-frame compression reduces the bits used to describe a single video frame.
The same techniques are used to compress still pictures, like the JPEG compression method.

The second type is inter-frame compression. Since video is made up of many pictures we look for
ways to not send the same information twice. The following is visualization of inter-frame compression in
practice.

![Pac-Man illustrating I-frame, P-frame, and B-frame compression](/img/pacman-frame-types.png)

Keep this in mind, this is what we are going to discuss later!

### Protocols

Today the de facto standard for live video upload is [RTMP (Real-Time Messaging Protocol)](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol).
RTMP is used by software like OBS/FFmpeg/GStreamer etc... A user opens up a TCP socket and uploads audio + video muxed in a FLV.

One alternative to RTMP is [WHIP](https://webrtcforthestreamer.com/). WHIP uses WebRTC to upload video instead. One interesting
feature that WHIP gets us is receiver feedback. The server can tell us things like how many packets it got, whether any packets were lost and
other metadata. We can use this feedback mechanism for a cool video streaming upgrade!

## A PR to improve latency

A [OBS PR](https://github.com/obsproject/obs-studio/pull/14025) was opened recently. The goals of the PR have nothing to do with bitrate savings.
If you read the PR description the intent is to improve sync and latency. However, I think it will have a very exciting side effect!

Right now with video streaming OBS users will do a I-Frame on a fixed interval. Every two seconds they will send an I-Frame and it works pretty well!
Users when watching the stream may need to wait 2 seconds though. If they join during a P-frame or B-frame they can't start watching the video until they
get an I-Frame. This PR makes it so a viewer can request an I-Frame at anytime. Allowing them to start decoding video sooner.

## Let's reduce the I-Frames

Now think back to the Pac-man picture. If Pac-man isn't moving it seems pretty wasteful to keep sending I-Frames. You should only send them when something has
changed. I was curious so I did some re-encodes of Big Buck Bunny at different bitrates + I-Frame intervals and these were my results.

![4K bitrate savings at matched PSNR for 10-, 30-, and 100-second keyframe intervals, compared with 2-second keyframes.](/img/x264-keyframe-savings-4k.svg)

Pretty exciting results! A stream with long running viewers would benefit a lot from this. A stream with lots of viewers joining/leaving not so much though.

## Keyframes and WHIP

So now that we know that Keyframe Intervals play a big part in quality + bitrate how do we actually use them? With WHIP a server has the ability to do receiver feedback
like a [PLI](https://webrtcforthecurious.com/docs/06-media-communication/#full-intra-frame-request-fir-and-picture-loss-indication-pli) and request a keyframe. Users
would tune OBS to now instead have a 30 second keyframe interval, and optionally generate them on the fly when requested.

I am pretty excited about these results and excited to see some real world results when running against [Broadcast Box](https://github.com/glimesh/broadcast-box)
