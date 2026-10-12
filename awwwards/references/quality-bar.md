# The quality bar: how award sites are scored, and the self-score rubric

This skill uses the Awwwards scoring system as its bar. It is public, detailed, and backed by
years of real scores. The goal is a site that would hold up in front of that jury. Submitting
is optional and up to the owner.

## The system (awwwards.com/about-evaluation, verified Oct 2026)

| Criterion | Weight | What reviewers actually judge |
|---|---|---|
| Design | 40% | Craft and control: the typographic system, layout and negative space, color and contrast, consistency, detail. Sites that feel "inevitable" score highest. Piling on effects reads as a lack of control. |
| Usability | 30% | Orientation in under 3 s, clear navigation, load time, responsiveness on real phones, accessibility (keyboard, focus, reduced motion), feedback on interaction. |
| Creativity | 20% | Originality with intent: an idea that could not be moved to another brand. Generic tropes are discounted. |
| Content | 10% | Real, specific copy and imagery integrated into the design. Placeholder content is noticed. |

- Honorable Mention starts at 6.5. Site of the Day is the highest score of the day, and recent
  winners average 7.2 to 7.6.
- The developer review looks for scores above 7 in six areas: **Semantics/SEO,
  Animations/Transitions, Accessibility, WPO (web performance), Responsive Design, and
  Markup/Meta-data.**

## Real scores of recent winners

| Site of the Day | Overall | Design | Usab. | Creat. | Content | Dev: Sem/SEO | Anim | A11y | WPO | Resp | Markup |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Maria Vasilyeva portfolio, Oct 2026 | 7.28 | 7.31 | 7.02 | 7.56 | 7.33 | 7.20 | 8.00 | 6.40 | 7.60 | 7.40 | 7.00 |
| LPAS architecture studio, Oct 2026 | 7.24 | 7.19 | 7.19 | 7.31 | 7.50 | 7.80 | 8.00 | 7.00 | 7.60 | 7.40 | 7.20 |
| TWKS agency (older) | 7.52 | 7.58 | 7.42 | 7.51 | 7.59 | 7.67 | 8.00 | 6.67 | 6.67 | 7.00 | 7.67 |

The pattern: **animations score highest (8.0), while accessibility and performance score
lowest.** A site that pairs this level of motion with real accessibility and performance is
ahead of the field. Only 3 of 11 top studio sites we probed shipped any
`prefers-reduced-motion` handling.

## What gets punished

- A polished template with no point of view. Effects bolted on rather than choreographed.
- Hard cuts or plain fades between states ("craft lives between states").
- A WebGL hero at 18 to 20 fps on a mid-range phone, a 9 MB page, a 6-second progress bar.
- Desktop-only thinking: a broken or squished mobile layout caps a site at Honorable Mention.
- A custom cursor that hides the native one, missing focus states, low contrast.
- Lorem ipsum, stock imagery, machine-translated copy.
- Borrowed concepts: this season's horizontal gallery, the same distortion everyone ships.

## Critic's self-test (do this on your screenshots)

1. Screenshot the hero. Is the static frame strong on its own?
2. Throttle (4x CPU, fast 3G). Does it still paint quickly and hold its frame rate?
3. Watch the transitions between states, not just between pages.
4. Toggle reduced motion. Is the site complete and calm?
5. Open it at phone width. Is it designed, or squished?

## Self-score rubric (score 1 to 10 with evidence from specific screenshots)

Be the skeptical critic. Every score needs evidence, for example: "d-01-hero: display type 18vw,
tracking -0.05em, optically aligned to the grid; the static frame works as a poster." No
evidence, no points.

**Design (40%)**
- 6: clean and consistent, but could be any template; safe type; uniform spacing.
- 7: a clear typographic system, an intentional palette, good hierarchy; one or two memorable compositions.
- 8: every frame composed; type used as image; rhythm varied on purpose; every detail designed (hover, focus, captions, footer, 404).
- 9: inevitable. Nothing to add or remove, and a visual language you could recognize from a crop.

**Usability (30%)**
- 6: works, but the loader is long, nav is unclear on some page, mobile is squished, or FPS drops.
- 7: fast, clear nav, mobile works, reduced motion is acceptable.
- 8: instant orientation, mobile composed for the hand, transitions never block, accessibility basics complete, 60 fps.
- 9: all of 8, plus delightful feedback everywhere and zero friction on every device.

**Creativity (20%)**
- 6: known patterns, competently assembled.
- 7: one idea specific to the subject, partially carried through.
- 8: the concept drives layout, motion and the signature moment; something reviewers haven't seen this month.
- 9: a new interaction idea that becomes a reference for others.

**Content (10%)**
- 6: placeholder-feeling or generic copy.
- 7: specific copy, honest imagery, a clear story.
- 8: copy with voice and real substance; case studies explain the problem, the idea and the outcome.

**Developer (each 1 to 10):** Semantics/SEO, Animations/Transitions, Accessibility, WPO,
Responsive, Markup/Meta-data. Use the `audit.mjs` and `shoot.mjs` reports as evidence.

Weighted overall = 0.4 Design + 0.3 Usability + 0.2 Creativity + 0.1 Content. Target 8.0 or
higher. Real reviewers score lower than self-assessments, so a self-score of 8 is roughly a
competitive Site of the Day.
