# Character Progression Phase 5 — Breakthrough and Fusion Inheritance (V0.45)

## Confirmed behavior
- Breakthrough keeps the current character level and raises the level cap by 10, with no fixed breakthrough limit.
- Breakthrough consumes the character's own shards and gold according to the existing escalating cost formula.
- EXP stored at the old level cap is processed immediately after the cap rises. Multiple levels may be gained in one breakthrough, and any remainder is retained.
- Fusion still consumes exactly three same-type source copies (3 A → 1 S, 3 S → 1 SS).
- The three least-developed source copies are consumed first when more than three copies exist.
- The complete growth record with the highest progression is retained across the three consumed materials and already-owned result-card copies. The record includes level, EXP, breakthrough count, and level cap.
- If a consumed source copy wins, its record is rebound to a unique result-card instance ID. If an existing result copy wins, its record remains untouched and the newly fused copy receives a fresh initial progression record.
- Stronger source copies not consumed by the fusion remain owned and retain their progression records.

## Compatibility and scope
- Existing local saves and the existing progression schema remain compatible; no save reset or save-key change.
- Player-level EXP, five-character auto-battle, skills, equipment, rarity rules, and fusion inventory behavior remain unchanged.
- Updated Chinese/Japanese/English fusion guidance and release notes.

## Regression coverage
- Stored EXP can advance multiple levels after breakthrough, with remainder retained.
- Material growth can transfer to a result card with the correct card ID and unique instance ID.
- A stronger existing result-card record wins without being overwritten.
- Stronger source copies outside the three consumed copies remain untouched.
- Existing breakthrough material and unlimited-breakthrough tests remain in place.
