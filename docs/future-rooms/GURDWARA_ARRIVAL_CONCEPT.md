# Gurdwara Arrival — three verified places, quiet entry

Status: **NONDEPLOYED DESIGN PROTOTYPE**. Separate from the accepted reader release and existing directory, which remains unchanged.

The flow is place selection → optional three-second title fade → Enter or immediate Skip → verified introduction and a clearly labeled official outbound route. Return to reading is always available. Enter and Skip reveal information; neither starts media. No sound, stream iframe, player SDK, background playback or status request is made by this prototype.

| Place | Location / clock | Verified introduction and route |
| --- | --- | --- |
| Sri Harmandir Sahib / ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ | Amritsar, Punjab, India · `Asia/Kolkata` | SGPC's history describes its position within the Sarovar and four entrances. Deliberate outbound link to `https://kirtan.sgpc.net/`. |
| Gurdwara Sahib Fremont | 300 Gurdwara Road, Fremont, CA, USA · `America/Los_Angeles` | Official site supplies the name/address and welcoming context. Its own Watch Live link identifies `https://www.youtube.com/c/gurdwarasahibfremont`. The UI calls this an official channel, not a confirmed live broadcast. |
| Sikh Gurdwara Sahib – San Jose | 3636 Gurdwara Ave, San Jose, CA 95148, USA · `America/Los_Angeles` | Official history gives 1984 founding and present-facility phases in August 2004 and April 2011. Open `https://sanjosegurdwara.org/audioStreaming.html`; its mobile direct-link field remains TBD. No working direct-stream claim is made. |

The local clock uses `Intl.DateTimeFormat` with the named IANA zone, including California daylight saving time. It does not infer a live programme, opening hours, seva or Amrit Vela schedule. The initial prototype deliberately keeps a constant quiet Day palette; a future time-based palette would be a visual choice, explicitly independent of the gurdwara's actual service status.

## Place truth and rights

No photo has a recorded reuse licence or permission in this review packet. Therefore **no image is used**. Typography is the approved fallback, not a claim that official-site images are reusable. Do not substitute an AI-generated temple scene for documentary place imagery. To add a photo, record the exact asset, creator, rights holder, licence/permission evidence, attribution, permitted modifications and consent considerations.

Only the verified Harmandir Gurmukhi name is displayed. Fremont and San Jose Gurmukhi names remain withheld pending native-language and entity confirmation. English names and official postal addresses are shown. These are public institution locations, not private addresses.

## Provider behavior

The outbound link is shown only after Enter or Skip and opens on a separate deliberate click. Links retain provider ownership of their playback experience. Nothing is extracted from YouTube or an audio page, and no player is hidden or bypassed. A future embed would require current provider-policy review and a visible compliant player with controls, overlays, ads and referral context preserved. No playback or current availability has been verified in this prototype.

## Review and acceptance questions

- Ask each institution or a qualified place reviewer to confirm naming, short introduction, preferred public broadcast route and whether the address should be accompanied by arrival/visitor guidance.
- Obtain image rights before adding any photographic arrival. Keep the fallback whenever clearance is absent.
- Confirm Gurmukhi names and labels before bilingual production presentation.
- On actual iPhone/Safari, test modal focus, VoiceOver labels, large text, three-second fade/skip, reduced motion, external-app return, and exact original reading anchor. Desktop tests do not close these requirements.
- If an official route becomes unavailable, keep the verified institutional introduction and a plain link; never fabricate availability or substitute an unofficial stream automatically.

Source and rights register: `SOURCE_AND_RIGHTS_LEDGER.md`; concrete data: `prototypes/rooms/content.json`. This branch is unmerged and is not a public room release.
