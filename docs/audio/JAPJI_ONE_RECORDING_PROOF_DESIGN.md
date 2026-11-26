# One recording, Japji Sahib: the proof, in two stages

**Draft design by Claude for cross-review. Nothing here has been built.**

The aim is small on purpose: show that a learner can follow one careful recitation of Japji Sahib **line by line**, and that the library refuses to pretend when it cannot. Word-by-word following comes later, if ever, and separately for each recording.

This builds on the builder's existing draft in PR #10 (a timing protocol and a checker that reads only descriptions of recordings, never audio). It should be extended, not rebuilt. I have read that PR's description, not yet its code; the checks below marked † should be confirmed against it.

## Stage A — made-up material only. No Gurbani, no real voice.

**Test material**
- *Text:* numbered nonsense lines ("line one", "line two" …), including two identical lines far apart, one very short line and one very long one.
- *Sound:* a file made by a script: a short tone at the start of each line, at times the script chooses and writes down. Nothing recorded from a person.
- *Timing map:* written by the same script, so the right answer is known exactly.

**What must be shown, each as a test that can fail**

| | The library must… |
|---|---|
| A1 | show the line whose time span contains the playing position — at the first instant of a line, the last, and in the silence between two lines |
| A2 | after **pause** and **resume**, be on the same line |
| A3 | after a **jump** to any time, show the right line, including a jump into silence and past the end |
| A4 | **repeat one line**: play from that line's start to its end and stop, without running into the next |
| A5 | tell apart the two identical lines by position, never by their words |
| A6 | † **refuse a timing map made for another recording** (the map names the checksum of its sound file) |
| A7 | † **refuse a timing map made against another version of the text** (the map names the text's fingerprint) |
| A8 | † refuse a map with overlapping, backwards, missing or duplicated lines |
| A9 | refuse to play when the sound file's checksum is not the one the register holds |
| A10 | refuse to play, and say why, when the register's permission for this recording does not include the use being attempted (for example: repeat-a-line was not granted) |
| A11 | when sound is unavailable, leave reading fully usable and say plainly that listening is not available — nothing substituted |
| A12 | make no request to any outside address |

A1–A5 are the experience. A6–A11 are the honesty. Stage A is finished when all twelve pass and each has been seen to fail on a deliberately broken input.

## Stage B — one real recording, after written permission

**Entry conditions (all of them):** a written grant from the named rights-holder that includes making line timings; the owner's go-ahead; a Santhiya teacher willing to review.

1. **Intake.** Record in the register: who granted what, the file's checksum, its length, the edition recited from.
2. **Text check.** A person listens to the whole recording against the library's 385 lines of Japji Sahib and notes every place where what is recited differs from what is shown — a repeated line, a different reading, an added invocation. Each difference is recorded and shown to the learner. The text is never changed to fit the recording, and the recording is never edited to fit the text.
3. **Timings by people.** Two people independently mark the start of each line. Where they differ by more than a set amount, a third decides. No timing is produced by guesswork or carried over from another recording.
4. **Proof.** Rerun A1–A12 with the real recording and its map.
5. **Review.** The Santhiya teacher's findings are recorded as given.

**Proposed pass marks** (to be agreed before Stage B begins, not after)

| | |
|---|---|
| Lines mapped to the wrong line | 0 of 385 |
| Line start, difference between the two markers | half of all lines within 0.3 s; none beyond 1.0 s without a third decision |
| Repeat-a-line running into the next line | 0 of 385 |
| Differences between recitation and text left unrecorded | 0 |

## What this proof will not show

- That the recitation is correct. Only a qualified teacher can say that.
- That it works on an iPhone, an iPad or an Android phone. Those need the devices.
- Anything about a second recording. Every recording starts again from intake.

## Never

No generated or cloned voice. No stretching, cleaning or cutting of a recitation. No timings scraped from another service. No sound file in the public repository. No "synchronised" label on anything that has not passed Stage B.
