---
title: "Contributing"
---

Thank you for contributing! Pion is a community project, and only exists because of the hard work of many different people. Contributing doesn't just involve code either, you can be involved in many different ways.
Before starting here are some things to remember that will make the whole process a whole lot more fun and effective.

### Everyone has different time constraints and schedules
Don't take it personally when your work doesn't get reviewed or merged in a timely manner. Feel free to add other contributors, or send a message on Slack. People have busy schedules and it is easy to get pulled in lots of directions

### Start with small tasks/Don't burn yourself out
It is better to get something done, then nothing at all. Try starting with a small task first, and grabbing larger things as time moves on


# Where Pion needs your help
### Supporting users on Slack or Stackoverflow
Answering questions and working with the community is really important. Most community members use <a href="/slack" target="_blank">Slack</a>, but it would also be helpful to work with people on Stackoverflow


### Triaging user issues
We have lots of issues that have been filed, but not addressed yet.

* If it is a question, or a simple issue you might be able to fix yourself!
* If it is a bigger task add a difficulty label ('easy', 'medium' or 'hard') and the 'triaged' label
* If feedback is requested add the 'question' label. If we haven't heard in 30 days resolve. Leave a comment telling the user to re-open if they are still interested though.


It also is helpful to review old triaged issues, they haven't got the attention they need

* <a href="https://github.com/search?q=-label%3A%22triaged%22+is%3Aopen+type%3Aissue+org%3Apion" target="_blank">untriaged issues</a>
* <a href="https://github.com/search?o=asc&q=label%3A%22triaged%22+is%3Aopen+type%3Aissue+org%3Apion&s=updated&type=Issues" target="_blank">stale triaged issues</a>
* <a href="https://github.com/search?o=asc&q=label%3A%22question%22+is%3Aopen+type%3Aissue+org%3Apion&s=updated&type=Issues" target="_blank">question issues</a>


### Documentation
We are working on building not just documentation about using Pion, but deep knowledge of WebRTC. Collecting up information (useful links, RFCs) and writing summations for technology would greatly enhance the Knowledge Base.

### Supporting Community Projects
Many Open Source projects use Pion. The following projects would love your help, and please add your project if you are interested in getting outside help!

* <a href="https://github.com/libp2p/go-libp2p-webrtc-direct" target="_blank">IPFS</a>

### Review Unmerged PRs
A great way to learn/get involved would be to review existing PRs. You can see them <a href="https://github.com/search?q=is%3Aopen+type%3Apr+org%3Apion" target="_blank">here</a>

We should aim to have zero unmerged PRs, but sometimes they get stuck in review or the original author runs out of time.

### Writing Code
Contributing to Pion should be an easy and fun process! After you land your first PR you will become a Pion developer, and you will have the ability to review and merge others code.

We try to have a high standard for quality, please review the <a href="#writing-a-good-pr">Writing a good PR</a> before selecting an issue

Time to code! To find a good task here are our open issues in order of difficulty .

* <a href='https://github.com/search?q=label%3A"good+first+issue"+is%3Aopen+type%3Aissue+org%3Apion' target='_blank'>good first issue</a> - Issues with zero ambiguity that can be easily merged

* <a href='https://github.com/search?q=label%3A"difficulty%3Aeasy"+is%3Aopen+type%3Aissue+org%3Apion' target='_blank'>easy</a> - Issues that are technically challenging but no ambiguity

* <a href='https://github.com/search?q=label%3A"difficulty%3Amedium"+is%3Aopen+type%3Aissue+org%3Apion' target='_blank'>medium</a> - Issues that are technically challenging and some ambiguity, a solution should be agreed on first

* <a href='https://github.com/search?q=label%3A"difficulty%3Ahard"+is%3Aopen+type%3Aissue+org%3Apion' target='_blank'>hard</a> - Issues that are technically challenging and require a significant time investment


# Writing a good PR
### Find a reviewer
Talk to a developer on <a href="/slack" target="_blank">Slack</a> or Github before you start work. Things may have changed since the issue was reported, so don't start work until you are sure everything will work!

The following developers are available for mentoring, and are happy to help you through the whole process.

* Sean DuBois <a href='https://github.com/Sean-Der' target='_blank'>Sean-Der</a>

### Run all automated tests and checks before submitting.
Your code will likely not be reviewed if it fails the automated checks. The code may be high quality, but most developers assume it isn't ready until the build is green.

In the root of each repo there is a `.travis.yml` file, this contains all the checks that are run. These checks are different for each repository. You can see the checks that run for Pion WebRTC <a href="https://github.com/pion/webrtc/blob/master/.travis.yml#L37" target="_blank">Here</a> as an example

### Write a good commit message
Each commit message is checked for the following rules

```
Subject line, capitalized, no period, max 50 chars

Commit message body, describe the changes exactly here. Use full
sentences. Wrap the commit message body at 72 characters.
```

### Authors must be added to the README.md
Add yourself to the README.md if this is your first time contributing.
