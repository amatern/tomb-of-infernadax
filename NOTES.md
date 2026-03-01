# Dev Notes — Open Concerns & Future Work

This file tracks gameplay issues and UX concerns to address in future sessions.
It is separate from CLAUDE.md (phase progress) and DESIGN.md (authoritative spec).

---

## UX: Party HP/MP Visibility During Dungeon Exploration

**Problem:** While exploring the dungeon (outside of combat), it is hard to see
how many hit points each party member currently has. The party HUD exists but
may not display enough at-a-glance information, especially on mobile.

**Questions to answer before implementing:**
- Does the topbar HUD show live HP/MP per character, or just character names?
- Should HP be shown as `cur/max` numbers, a colored bar, or both?
- On mobile the topbar is cramped — would a collapsible party panel work better?
- Should the HUD also show status effects (stunned, blinded, poisoned) while exploring?

**Possible approaches:**
1. Add a compact HP bar under each character name in the topbar HUD (color-coded:
   green > 50%, yellow 25-50%, red < 25%).
2. Add a "party status" button that opens a bottom sheet showing all 7 members
   with full HP/MP and active status effects.
3. Show a mini numeric HP readout (`42/60`) next to each name in the HUD.

---

## UX: Per-Character Item Use Outside of Combat

**Problem:** There is no clear way for individual characters to use items from
the shared inventory while exploring the dungeon (outside of combat). Currently
items can only be used during the combat item picker phase.

**Questions to answer before implementing:**
- Which items should be usable outside combat? (e.g. Healing Potion yes,
  Seal Breaker no)
- Should item use outside combat cost a "turn" (advance the encounter timer)?
- Who chooses which party member the item targets — the player, or does it
  auto-target the lowest-HP member?

**Possible approaches:**
1. Add an "Items" button to the dungeon HUD that opens the same bottom-sheet
   picker used in combat, filtered to out-of-combat-usable items. Player picks
   item then picks target character.
2. Tap a character portrait in the HUD to open a character sheet that includes
   a "Use Item" action.
3. Keep items combat-only and instead ensure healing spells (Cure Wounds, Holy
   Light) are clearly explained and easy to use between floors.

---

## Combat: Spell System Review

**Problem:** The spell system was implemented in Step 14 but should be reviewed
for clarity and balance before adding more content.

**Specific concerns:**
- **Cure Wounds** auto-targets the lowest-HP living ally. Is this always the
  right choice? Players may want to manually select the target.
- **Holy Light** heals the caster 4 HP always — is this enough to matter?
- **Healing spell feedback:** Does the combat log clearly communicate how much
  HP was restored and who was healed?
- **MP scarcity:** Are spellcasters running out of MP too early in long dungeon
  runs? No MP restoration exists between floors (unless Soul Fragment active).
- **Fizzle UX:** When a spell misses (INT roll fails), is the failure message
  clear enough that the player understands what happened?
- **Bone Spear** ignores DEF — is this clearly communicated to the player?

**Things to verify in code before next session:**
- Check that `resolvePartyActions` 'spell' case handles all 7 defined spells.
- Confirm that `stunRounds` and `blindRounds` decrement correctly each round
  (in `resetCommandPhase`).
- Check that spellcasters who reach 0 MP still show all their spell options
  grayed out (not hidden), with a clear "Not enough MP" message.
- Verify Dave's Soul Fragment zero-MP path doesn't break when `soulFragmentFloor`
  doesn't match the current floor.

---

## Combat: Manual Healing Target Selection

**Related to spell review above.**

Currently `Cure Wounds` auto-picks the lowest-HP ally. Consider adding a target
selection step so the player has control. This would require:
- A "pick target" sub-step in the combat command flow (similar to how item
  targets work).
- Filtering the target list to living party members only.
- Updating the command sheet render to show the target selection UI.

This is lower priority if auto-targeting feels fine in practice — note it here
for playtesting review.

---

## Notes on Priority

These are UX quality-of-life issues, not blockers. Suggested order:

1. **HP visibility** — easiest win, high impact on moment-to-moment feel.
2. **Spell system review** — audit existing code for bugs before building more.
3. **Out-of-combat item use** — requires design decision on game flow.
4. **Manual heal targeting** — nice-to-have, low priority until playtested.

Continue Phase 3 steps (15, 16, 17) in parallel with or before these UX fixes,
depending on what feels most broken during actual play sessions.
