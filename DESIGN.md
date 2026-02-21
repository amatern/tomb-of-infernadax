# DESIGN.md — Tomb of Infernadax
## A Sword & Sorcery Browser Dungeon Crawler

---

## Vision

A party-based, browser dungeon crawler inspired by Wizardry. Dark fantasy tone.
Grid-based first-person exploration, Wizardry-style turn-based combat (all commands set
before resolution), five dungeon floors with a ticking clock. The full party of seven
adventurers travels together — each with their own story arc that surfaces at floor
transitions. Completable in one sitting (~30–45 minutes). Built in plain HTML/CSS/JS —
no frameworks, no build tools.

---

## Win & Loss Conditions

**To Win:** Reach Floor 5, destroy Infernadax's phylactery BEFORE killing him, then defeat
Infernadax the Undying. If the phylactery is intact when he dies, he transforms into a
dracolich and the game is lost.

**To Lose:** Party HP reaches zero, or Infernadax transforms into a dracolich.

---

## Dungeon Structure

Five floors, each themed around a broken or corrupted Seal. Each floor has:
- A 10×10 grid map with rooms and corridors
- Random encounters while walking (25% chance per step)
- One named mini-boss guarding the stairs down
- One environmental hazard affecting movement or combat
- A Seal Gemstone recovered after defeating the mini-boss
- Two hidden treasure chests in dead-end corridors
- Stairs up (backtrack to previous floor) and stairs down

### Map Legend

```
# = wall
. = floor/corridor
S = party start position
3 = stairs down to next floor
4 = stairs up to previous floor
M = merchant NPC alcove
C = treasure chest
X = Xarrath scripted trigger tile
B = mini-boss room entrance
H = hidden door (phylactery room — invisible unless Unpickled senses or Arlo reveals)
I = Infernadax final chamber entrance
R = Ruby Choice trigger (auto-fires after Silvaclaw defeat when party steps here)
```

---

### Floor 1 — The Stone Seal

**Theme:** Tutorial floor. Straightforward cross-shaped cave. Teaches movement,
encounters, and combat before things get complicated. Krek'tak is a manageable
first boss. Merchant visible early — introduces the economy.

**Hazard:** Collapsing ceiling trap in the central corridor (marked room).
Triggers on entry, deals 5 damage to front row. One-time only.

```
##########
#S.......#
#.######.#
#.#C....T#  T = trap room (collapsing ceiling)
#.#.####.#
#...#....#
####.#.#.#
#M..#...B#  ← Merchant left alcove, Krek'tak boss room right
#.###.##.#
####.3...#  ← Stairs down, no stairs up (Floor 1 = entrance)
```

**2D Array:**
```javascript
[
  [0,0,0,0,0,0,0,0,0,0],
  [0,'S',1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,1,0],
  [0,1,0,'C',1,1,1,1,'T',0],
  [0,1,0,1,0,0,0,0,1,0],
  [0,1,1,1,0,1,1,1,1,0],
  [0,0,0,0,1,0,1,0,1,0],
  [0,'M',1,1,0,1,1,1,'B',0],
  [0,1,0,0,0,1,0,0,1,0],
  [0,0,0,0,1,3,1,1,1,0]
]
```

**Notes for Claude Code:**
- Jonas (Chad) starts at position [1,1], facing east
- No stairs up — this is the entrance
- Krek'tak blocks path to stairs until defeated
- Merchant sells: Healing Potion, Mana Crystal, Antidote, Torch Bundle

---

### Floor 2 — The Water Seal

**Theme:** L-shaped with a flooded central chamber. Movement in flooded tiles
costs 2 steps instead of 1. Xarrath blocks the direct corridor to the boss —
players must engage him before reaching Thessalmar.

**Hazard:** Flooded tiles (marked `~`) slow movement. Front row takes 2 extra
damage per combat round from cold water. Sahuagin enemies get +2 DEF in flooded rooms.

```
##########
#4.......#  ← Stairs up back to Floor 1
#.######.#
#.#~~..X.#  ← Flooded room, Xarrath in corridor beyond
#.#~####.#
#...#....#
####.#.#.#
#C..#...B#  ← Chest left, Thessalmar boss room right
#.###.##C#  ← Second chest in far dead end
####.3...#
```

**2D Array:**
```javascript
[
  [0,0,0,0,0,0,0,0,0,0],
  [0,4,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,1,0],
  [0,1,0,'~','~',1,1,'X',1,0],
  [0,1,0,'~',0,0,0,0,1,0],
  [0,1,1,1,0,1,1,1,1,0],
  [0,0,0,0,1,0,1,0,1,0],
  [0,'C',1,1,0,1,1,1,'B',0],
  [0,1,0,0,0,1,0,0,'C',0],
  [0,0,0,0,1,3,1,1,1,0]
]
```

**Notes for Claude Code:**
- Xarrath at [3,7]: scripted 2-round fight, then retreats with flavor text
- Flooded tiles: [3,3], [3,4], [4,3] — render with blue tint on canvas
- Thessalmar blocks stairs until defeated
- No merchant on this floor (adds tension)

---

### Floor 3 — The Wind Seal

**Theme:** Three-pronged fork layout. Multiple routes create genuine exploration
decisions. Wind blasts on the upper path push the party back one tile randomly
(20% chance per step in wind corridors). Merchant hidden in left branch.
Ruby Choice fires automatically after Silvaclaw is defeated.

**Hazard:** Wind corridors (marked `W`) have 20% chance per step to push party
back one tile. Enemies in wind rooms get +1 ATK from buffeting winds.

```
##########
#4..#....#
#.#.#.##.#
#.#W..#..#  ← Wind corridor upper path
#M#####.##
#.......B#  ← Silvaclaw boss room
##.##.##.#
#C..#...C#  ← Chests on both side branches
#.#.#.#R.#  ← R = Ruby Choice triggers here after Silvaclaw
##3#######
```

**2D Array:**
```javascript
[
  [0,0,0,0,0,0,0,0,0,0],
  [0,4,1,1,0,1,1,1,1,0],
  [0,1,0,1,0,1,0,0,1,0],
  [0,1,0,'W',1,1,1,0,1,0],
  [0,'M',0,0,0,0,0,1,0,0],
  [0,1,1,1,1,1,1,1,'B',0],
  [0,0,1,0,0,1,0,0,1,0],
  [0,'C',1,1,0,1,1,1,'C',0],
  [0,1,0,1,0,1,0,'R',1,0],
  [0,0,3,0,0,0,0,0,0,0]
]
```

**Notes for Claude Code:**
- Ruby Choice (`R` tile [8,7]): fires automatically after Silvaclaw defeated,
  when party moves toward stairs. Full-screen story card, player chooses Keep/Sell.
  Result stored in `gameState.flags.rubyKept`
- Wind tiles: [3,3] — render with subtle horizontal streaks on canvas
- Merchant sells full inventory including Dragonscale Mail and Mana Crystal (large)
- After Ruby Choice resolves, `R` tile becomes normal floor

---

### Floor 4 — The Light Seal

**Theme:** Most maze-like floor so far. Many dead ends, fewer through-routes.
Blinding light rooms reduce dungeon view distance to 1 tile (normally 3).
Xarrath appears again — second scripted encounter, more damage than Floor 2.
Arlo's Star Sight starts feeling essential here.

**Hazard:** Blinding light rooms (marked `L`) reduce canvas view distance to
1 tile ahead. Party navigation feels claustrophobic. Enemies in light rooms
get +2 to hit (they're adapted to the brightness).

```
##########
#4.#.#...#
#.#.#.##.#
#.....#C.#
#.#####.##
#X......B#  ← Xarrath then straight path to Vexmire
##.#L##..#  ← Blinding light room
#C..#L...#  ← Second chest, another light room
#.#.#.#.##
###.....3#
```

**2D Array:**
```javascript
[
  [0,0,0,0,0,0,0,0,0,0],
  [0,4,1,0,1,0,1,1,1,0],
  [0,1,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,1,0,'C',1,0],
  [0,1,0,0,0,0,0,1,0,0],
  [0,'X',1,1,1,1,1,1,'B',0],
  [0,0,1,0,'L',0,0,1,1,0],
  [0,'C',1,1,0,'L',1,1,1,0],
  [0,1,0,1,0,1,0,1,0,0],
  [0,0,0,1,1,1,1,1,3,0]
]
```

**Notes for Claude Code:**
- Xarrath at [5,1]: second scripted encounter, deals ~15 total damage across 2 rounds,
  retreats with Floor 4 flavor text. More aggressive than Floor 2 version.
- Light tiles: [6,4], [7,5] — canvas view distance reduces to 1 tile while in these rooms
- Vexmire blocks stairs until defeated
- No merchant on this floor

---

### Floor 5 — The Shadow Seal

**Theme:** Darkest and most complex floor. Base canvas view distance reduced to
2 tiles (Torch Bundle restores to 3). The phylactery room is behind a hidden door
invisible to normal navigation — only Unpickled's WARM/HOT/BURNING sense or
Arlo's Star Sight reveals it. Nyx guards the main path. Infernadax at the very end.
Players who destroyed the phylactery first get the good ending. Those who didn't
trigger the dracolich transformation.

**Hazard:** Darkness — view distance 2 tiles unless Torch Bundle used (restores to 3).
Wraith enemies immune to non-magic attacks (back row casters become critical).

```
##########
#4.#.....#
#.#.####.#
#.#.#H...#  ← H = hidden door, phylactery room beyond
#...#.##.#
#.###....#
#.#C.#C#.#  ← Two chests in side branches
#....#...#
#.##.#.#B#  ← Nyx boss room
##I......#  ← I = Infernadax final chamber (far end)
```

**2D Array:**
```javascript
[
  [0,0,0,0,0,0,0,0,0,0],
  [0,4,1,0,1,1,1,1,1,0],
  [0,1,0,1,0,0,0,0,1,0],
  [0,1,0,1,0,'H',1,1,1,0],
  [0,1,1,1,0,1,0,0,1,0],
  [0,1,0,0,0,1,1,1,1,0],
  [0,1,0,'C',1,0,'C',0,1,0],
  [0,1,1,1,1,0,1,1,1,0],
  [0,1,0,0,1,0,1,0,'B',0],
  [0,0,'I',1,1,1,1,1,1,0]
]
```

**Notes for Claude Code:**
- Hidden door `H` at [3,5]: rendered as wall (`#`) unless:
  - `gameState.flags.phylacteryRevealed` is true (Arlo used Star Sight), OR
  - Unpickled's sense is BURNING (party is adjacent to [3,5])
  - When revealed, renders as a door `2` and becomes passable
- Phylactery room: tiles [3,6], [3,7], [3,8] behind the hidden door.
  Contains the phylactery object. Player selects "Destroy" from menu.
  Sets `gameState.flags.phylacteryDestroyed = true`
- Unpickled sense proximity: calculate Manhattan distance from party position
  to [3,5]. Distance >6 = nothing, 4-6 = WARM, 2-3 = HOT, 0-1 = BURNING
- Nyx at [8,8]: blocks path to Infernadax until defeated
- Infernadax at [9,2]: final boss encounter. Checks `phylacteryDestroyed` flag.
  If true → good ending sequence. If false → dracolich transformation → bad ending.
- Torch Bundle: if not in inventory, canvas view distance = 2. With Torch Bundle = 3.
- No merchant until Floor 5 merchant alcove (add at [1,4] — top right branch)

---

### Backtracking Rules

Stairs up (`4`) appear on every floor except Floor 1 (entrance). Backtracking is
fully allowed — players can return to any previous floor to buy from merchants,
find missed chests, or rest. The ticking clock is the only cost (0.5 days per
floor transition in either direction). Enemies respawn on revisited floors
(same encounter table, new random rolls) but chests do not restock and merchants
retain the same inventory. Mini-bosses do not respawn.

---

## Ticking Clock

A **7-day countdown** (displayed in the HUD) begins when the game starts. The clock
creates soft pressure — mostly felt on Floors 4 and 5 — rather than constant anxiety.

**What costs time:**
- Descending to the next floor: **0.5 days**
- Resting: **0.5 days**

**What doesn't cost time:** exploring, combat, shopping, story events.

**Total budget math:** 5 floors × 0.5 days = 2.5 days descending. Remaining 4.5 days
= up to 9 rests. In practice a careful player will use 4-6 rests, leaving comfortable
margin. The clock becomes meaningful only if the player rests excessively on early floors.

**What happens at 0 days:** The Seal of Water collapses. Thessalmar on Floor 2 becomes
supercharged (double HP, lightning breath hits the whole party) — but only if the party
hasn't cleared Floor 2 yet. On later floors, the HUD shows a warning and Infernadax's
voice taunts the party. No instant game over — just harder enemies and flavor text dread.

**Clock display:** Shows as "X days remaining" with a cracked-seal icon that gains more
cracks as days dwindle. Turns red below 2 days.

---

## Party

All seven characters travel together. The player cannot choose a subset — the whole party
enters the dungeon. In combat, commands are issued to each character individually before
any actions resolve (Wizardry-style).

**Party order matters:** Characters at the front (positions 1–3) take full damage from
monster attacks. Characters in the back (positions 4–7) take reduced damage but can only
use spells, items, or ranged abilities. Default order: Chad, Vendella, Fiona | Sprinkles,
Dave, Arlo, Unpickled.

### Character Roster

| #  | Character   | Player  | Race/Class            | HP  | MP  | STR | AGI | INT | Position |
|----|-------------|---------|----------------------|-----|-----|-----|-----|-----|----------|
| 1  | Chad        | Jonas   | Dragonborn Barbarian | 28  | —   | 5   | 3   | 2   | Front    |
| 2  | Vendella    | —       | Tabaxi Rogue         | 20  | —   | 4   | 5   | 3   | Front    |
| 3  | Fiona       | —       | Aasimar Barbarian    | 26  | —   | 4   | 4   | 2   | Front    |
| 4  | Sprinkles   | —       | Halfling Rogue       | 20  | —   | 3   | 6   | 3   | Back     |
| 5  | Dave        | —       | Halfling Cleric      | 18  | 20  | 2   | 3   | 5   | Back     |
| 6  | Arlo        | —       | Elf Cleric           | 16  | 22  | 2   | 4   | 5   | Back     |
| 7  | Unpickled   | —       | Human Necromancer    | 14  | 24  | 1   | 3   | 6   | Back     |

*(Fill in player names for characters 2–7 when known. The character select screen
and story cards should display both character name and player name, e.g. "Chad — played by Jonas")*

### Special Abilities (one per character, usable once per combat unless noted)

**Chad — Dragonfire Rage**
Double damage on one attack. Costs 3 HP (the curse burns him). Story: his dragonfire
grows harder to control the deeper he goes. On Floor 5, Infernadax addresses him directly.

**Fiona — Celestial Armor**
Grant the entire party +3 DEF for one round. Usable once per floor (not just per combat).
Story: flashes of Luminara's sacrifice surface as protective instinct. On Floor 4 she
begins speaking in a voice that isn't entirely hers.

**Vendella — Dragon Claw Strike**
+5 damage vs. all dragon-type enemies. If the Ancestral Weapon cache is found on Floor 3,
upgrades to +8 damage and adds a second strike. Story: she's the last of her clan; every
dragon kill is an act of remembrance.

**Sprinkles — Shadow Strike**
Guaranteed backstab on the first round of combat (3× damage). Bypasses enemy DEF entirely.
Story: she's fast, ruthless, and carrying the Crimson Heart Ruby — which has its own
complications (see Ruby Choice below).

**Dave — Soul Fragment**
When the party recovers a Seal Gemstone, Dave's Soul Fragment activates: all party spells
cost 0 MP for the remainder of that floor. Story: his soul is literally scattered through
the seals — recovering them makes him more whole, and more powerful.

**Arlo — Star Sight**
Reveals the complete map of the current floor instantly. Usable once per dungeon (not per
floor — use it wisely). Story: he's read the stars and knows terrible things are coming.
On Floor 5, a brief vision shows him two possible endings.

**Unpickled — Phylactery Sense**
A pulsing indicator in the HUD shows "WARM / HOT / BURNING" as the party gets closer to
the phylactery room on Floor 5. Without this, the hidden room is nearly impossible to find.
Story: he's the only one who can feel it. The closer they get, the more agitated he becomes.

---

## The Ruby Choice — Sprinkles (Floor 3 Story Event)

At the midpoint of Floor 3, after defeating Silvaclaw, a scripted scene triggers. Lareth
(the mysterious buyer) appears as a shadowy figure near the stairs. He offers Sprinkles
5,000 gp for the Crimson Heart Ruby.

**The player chooses:**

> **[KEEP IT]** — Sprinkles resists the temptation. The ruby stays with the party.
> Shadow Strike upgrades: now usable TWICE per combat instead of once.
> Flavor: "Some things aren't for sale."

> **[SELL IT]** — Sprinkles takes the gold. The ruby is gone.
> Party loses Dave's Soul Fragment bonus for the rest of the game (the ruby was
> amplifying his connection). But Sprinkles gains 5,000g (enough to fully stock up).
> Flavor: "It's just a rock. Right?"

This is the only branching story choice in the game. Both paths are completable.
The choice is saved to the game state and affects Floor 5 flavor text.

---

## Combat System — Wizardry Style

When an encounter triggers, combat enters a dedicated screen. The party faces 1–3 enemies.

### Command Phase (all party members, before any resolution)

For each character in order (1–7), the player chooses one action:
- **Attack** — Melee (front row only unless ranged weapon). Roll 1d20 + STR ≥ enemy DEF.
- **Spell** — Select a spell. Costs MP. Roll 1d20 + INT ≥ enemy DEF.
- **Item** — Use a potion or consumable. No roll needed. Can target self or ally.
- **Special** — Activate this character's unique ability (see above).
- **Defend** — Character takes half damage this round. No offensive action.
- **Flee** — Whole party attempts to flee. 50% chance. Failure = enemies get free attacks on everyone.

Back-row characters (4–7) cannot use Attack unless they have a ranged ability.

### Resolution Phase (simultaneous)

After all commands are set, everything resolves at once in this order:
1. Any "Defend" commands take effect
2. All party actions fire simultaneously
3. All enemy actions fire simultaneously
4. Status effects tick (poison, blind, etc.)
5. Combat log updates, showing results for all actions

This means you're committing blind — if you planned to heal Dave but he gets killed in
the resolution phase before the heal fires, the potion is wasted. This is intentional
and creates the Wizardry tension.

### Hit & Damage Formulas

- **Party Attack:** Roll 1d20 + STR. Hit if ≥ enemy DEF. Damage = 1d8 + STR.
- **Party Spell:** Roll 1d20 + INT. Hit if ≥ enemy DEF. Damage per spell table.
- **Enemy Attack:** Automatic hit on front row. Fixed damage range per monster tier.
  Back row takes 50% damage (represents cover and positioning).
- **Critical Hit:** Natural 20 = double damage (party only).
- **Miss:** Roll < DEF = 0 damage, "MISS" shown in combat log.

### Status Effects

- **Poison** — 3 DMG per round for 3 rounds. Cure: Antidote item.
- **Blind** — Miss next attack (50% miss chance). Cure: resolves after 2 rounds.
- **Slowed** — AGI reduced by 2 for 2 rounds (Floor 2 hazard).
- **Corroded** — Permanent -2 DEF (Nyx's acid breath). No cure.

### Resting

After combat, the party can Rest (costs 0.5 days on the ticking clock). Resting restores
**60% HP** to all party members and **40% MP** to casters. Can rest as often as needed
but clock pressure increases on later floors. A mid-dungeon rest also clears most status
effects (poison, blind) but not Corroded (-2 DEF from Nyx's acid — permanent).

---

## Spell List

Spells are available to Cleric and Mage classes. MP recharges partially on rest (not fully).

| Spell        | MP Cost | Effect                                      | Classes         |
|--------------|---------|---------------------------------------------|-----------------|
| Flamebolt    | 5       | 2d6 fire damage                             | Necromancer     |
| Cure Wounds  | 4       | Heal 1d8+3 HP                               | Cleric          |
| Turn Undead  | 6       | Stuns undead enemies for 2 rounds           | Cleric          |
| Bone Spear   | 7       | 3d4 damage, ignores defense                 | Necromancer     |
| Holy Light   | 8       | 2d8 damage vs. dragon-type, heals 4 HP      | Cleric          |
| Shadow Bolt  | 5       | 1d8 + blinds enemy (miss next attack)       | Necromancer     |

---

## Monsters by Floor

Each floor has 3–4 encounter types. Encounters trigger at 25% chance per step.

**Floor 1 (Stone)**
- Kobold Scout — HP 8, DEF 8, DMG 3
- Kobold Shaman — HP 10, DEF 9, DMG 5 (casts fire bolt)
- Cave Bat Swarm — HP 12, DEF 7, DMG 4 (attacks twice)
- *Mini-Boss: Krek'tak* — HP 35, DEF 12, DMG 8

**Floor 2 (Water)**
- Sahuagin Warrior — HP 14, DEF 10, DMG 6
- Corrupted Water Elemental — HP 18, DEF 11, DMG 7
- Cult Fanatic — HP 16, DEF 10, DMG 6 (has Fanatic Kael's mask)
- *Mini-Boss: Thessalmar* — HP 45, DEF 14, DMG 12 (lightning breath: hits 3× for 4 DMG)

**Floor 3 (Wind)**
- Storm Harpy — HP 16, DEF 11, DMG 7
- Wind Elemental — HP 20, DEF 12, DMG 8
- Giant Eagle (corrupted) — HP 22, DEF 11, DMG 9
- *Mini-Boss: Silvaclaw* — HP 50, DEF 14, DMG 11 (cold breath: party loses 1 AGI for 2 rounds)

**Floor 4 (Light)**
- Blinded Cultist — HP 18, DEF 10, DMG 8
- Radiant Golem — HP 28, DEF 15, DMG 10
- Dragon Cult Priest — HP 20, DEF 12, DMG 9 (heals self for 6 HP once)
- *Mini-Boss: Vexmire* — HP 55, DEF 15, DMG 13 (poison breath: 3 DMG/round for 3 rounds)

**Floor 5 (Shadow)**
- Wraith — HP 22, DEF 13, DMG 10 (immune to non-magic attacks)
- Shadow Drake — HP 30, DEF 14, DMG 11
- Undead Crimson Guard — HP 25, DEF 13, DMG 10
- *Mini-Boss: Nyx* — HP 60, DEF 16, DMG 14 (acid breath: corrodes, -2 DEF permanently)
- *FINAL BOSS: Infernadax* — HP 100, DEF 18, DMG 16 (fire breath: 20 DMG, 2-round cooldown)

---

## Recurring Encounters — Xarrath the Hunter

Scripted encounters on Floors 2 and 4. Xarrath is NOT a random encounter — he appears
in a specific corridor. He attacks for 2 rounds (dealing heavy damage), then retreats.

**Floor 2 Xarrath:** "You proved yourself worthy once. Prove it again."
**Floor 4 Xarrath:** "The Great One watches. You are almost there."

His presence foreshadows Infernadax and rewards players who've paid attention to the story.

---

## Loot Economy

**Design goal:** A thorough explorer should never feel starved. A player who rushes and
ignores chests will feel the pinch on Floor 4-5. The game is forgiving but rewards
attention.

### Mana Regeneration (Automatic)

At the start of each new floor, Dave, Arlo, and Unpickled each automatically recover
**3 MP**. This is free and requires no action — it represents the casters centering
themselves between levels. Total auto-regen across 5 floors: 15 MP per caster. Combined
with potions and resting, casters should rarely feel completely dry.

### Monster Drops (Random)

Every monster has a **25% chance** to drop a small item on defeat. Drop table (roll 1d6):
- 1-2: Healing Potion (small, 2d4+2 HP)
- 3: Mana Crystal (small, +6 MP, split as player chooses)
- 4: Antidote
- 5: Gold (1d6 × 5)
- 6: Nothing (bad luck)

Mini-bosses always drop gold (3d6 × 10) plus one guaranteed item from the full shop table.

### Treasure Chests

Each floor has **2 hidden chests** discoverable by exploring dead-end corridors. Chests
contain better loot than monster drops:

| Floor | Chest A                          | Chest B                          |
|-------|----------------------------------|----------------------------------|
| 1     | Hi-Potion + 50g                  | Mana Crystal (large, +12 MP)     |
| 2     | 2× Healing Potion + Antidote     | Hi-Potion + 80g                  |
| 3     | Dragonscale Mail + 60g           | 2× Mana Crystal + Antidote       |
| 4     | 2× Hi-Potion + 100g              | Mana Crystal (large) + Antidote  |
| 5     | Torch Bundle + Hi-Potion         | 150g + Antidote                  |

### Merchants (Floors 1, 3, 5)

A hooded figure appears in a lit alcove. Inventory is fixed per floor.

| Item                | Cost  | Effect                                        |
|---------------------|-------|-----------------------------------------------|
| Healing Potion      | 30g   | Restore 2d4+2 HP to one party member          |
| Hi-Potion           | 60g   | Restore 4d4+4 HP to one party member          |
| Mana Crystal        | 40g   | Restore 8 MP (player assigns to one caster)   |
| Mana Crystal (large)| 75g   | Restore 15 MP (player assigns to one caster)  |
| Antidote            | 25g   | Cure poison on one party member               |
| Dragonscale Mail    | 120g  | +2 DEF for entire party (rest of dungeon)     |
| Torch Bundle        | 20g   | Reveals map in dark rooms (Floor 5 essential) |
| Elixir              | 150g  | Revive one KO'd party member (50% HP)         |

**Floor 5 merchant** sells everything above plus one unique item: the **Seal Breaker**
(200g) — destroys one enemy's special ability for the fight (useful against Infernadax's
fire breath).

### Seal Gemstones (End of Each Floor)

Found on the pedestal after defeating the floor's mini-boss. Passive bonus for rest of run.

| Gemstone | Bonus                                              | Story note                        |
|----------|----------------------------------------------------|-----------------------------------|
| Ruby     | Party +2 STR (already carried — bonus applies F1) | Sprinkles has it from the start   |
| Sapphire | All casters +4 MP max                              | Dave feels a fragment click home  |
| Topaz    | Party +2 AGI (better flee chance, higher initiative) | Wind Seal — party feels lighter  |
| Diamond  | All healing spells/potions +3 HP                   | Light amplifies restoration       |
| Emerald  | Reveals phylactery room on minimap                 | Unpickled's hands stop shaking    |

### Gold Economy

Expected gold per floor from monsters (25% drop rate, ~8 encounters): ~80-120g.
Mini-boss drops: ~100-180g. Chests: 50-150g. Total per floor: ~230-450g.
Full run total (floors 1-5): ~1,200-2,000g.

Full shop inventory on Floor 3 costs roughly 600-800g. A player who explores thoroughly
can afford everything they want. A rusher will need to prioritize.

---

## Key Items

- **Crimson Heart Ruby** — Party starts with it (Sprinkles had it). Glows near Dave.
  Mechanically: If playing as Dave, +1 to all INT rolls on Floor 1.
- **Infernadax's Phylactery** — Found in a hidden room on Floor 5 before Nyx's chamber.
  Must be "destroyed" (a menu action) before fighting Infernadax or bad ending triggers.
- **Ancestral Dragon Claw Weapon** — Hidden cache on Floor 3. If found, Vendella's
  special ability upgrades to +8 damage vs. dragons.

---

## Layouts

The game has three distinct screens, each with a mobile and desktop variant.
Build mobile-first (390px base width), scale up to desktop with one CSS breakpoint.
Touch targets minimum 44×44px. No hover-only states.

---

### Screen 1: Exploration View

**Mobile (portrait, 390px)**
```
┌─────────────────────────────┐
│  FLOOR 2  ⏳ 7 days  💰 140 │  ← top bar: floor, clock, gold
├─────────────────────────────┤
│                             │
│   [DUNGEON CANVAS VIEW]     │  ← ~60% of screen height
│        390 × 420px          │
│                             │
├─────────────────────────────┤
│      [←]  [↑]  [→]         │  ← D-pad (large tap targets)
│           [↓]               │
├─────────────────────────────┤
│ 🔴Chad 🟢Ven 🟡Fio          │  ← colored dot = health status
│ 🟢Spr  🟢Dav 🟢Arl 🟢Unp  │  ← tap portrait → detail popover
├─────────────────────────────┤
│ > Water drips from above.   │  ← 2-line message log
└─────────────────────────────┘
```
Health dot colors: 🟢 >50% HP / 🟡 25-50% / 🔴 <25% / ⚫ KO'd.
Tapping a character dot opens a bottom sheet with full stats, items, ability button.

**Desktop (768px+)**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  FLOOR: 2/5   SEAL: WATER   ⏳ 7 days remaining          💰 Gold: 140   │
├────────────────────────────┬─────────────────────────────────────────────┤
│                            │  FRONT ROW                                  │
│                            │  Chad       ████████░░  22/28 HP            │
│  [DUNGEON CANVAS VIEW]     │  Vendella   ██████████  20/20 HP            │
│       600 × 500px          │  Fiona      █████████░  24/26 HP            │
│                            │  ───────────────────────────────            │
│  Arrow keys or             │  BACK ROW                                   │
│  click D-pad               │  Sprinkles  ████████░░  16/20 HP            │
│                            │  Dave       ███████░░░  14/18 HP  ░░░░ 12MP │
│                            │  Arlo       ██████████  16/16 HP  ████ 20MP │
│                            │  Unpickled  ██████░░░░  10/14 HP  ███░ 18MP │
│                            │  ───────────────────────────────            │
│                            │  SEALS: [●][ ][ ][ ][ ]                    │
├────────────────────────────┴─────────────────────────────────────────────┤
│  > The corridor floods to your knees. Movement costs double here.        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 2: Combat View

**Mobile**
```
┌─────────────────────────────┐
│  ⚔ COMBAT — FLOOR 2         │
├─────────────────────────────┤
│  Thessalmar                 │  ← enemy name + HP bar
│  ████████░░  45/45 HP       │
│  Status: —                  │
├─────────────────────────────┤
│  ROUND 1 — SET COMMANDS     │
├─────────────────────────────┤
│  Chad        [DONE ✓]       │  ← tap row → bottom sheet opens
│  Vendella    [SET...]       │    with: Attack / Spell / Item /
│  Fiona       [SET...]       │    Special / Defend / Flee
│  Sprinkles   [SET...]       │
│  Dave        [SET...]       │
│  Arlo        [SET...]       │
│  Unpickled   [SET...]       │
├─────────────────────────────┤
│  [⚔ RESOLVE]  (grayed out) │  ← enabled only when all 7 set
└─────────────────────────────┘
```

**Desktop**
```
┌──────────────────────────────────────────────────────────────────────────┐
│  ⚔ COMBAT — FLOOR 2                                        ROUND 1      │
├──────────────────────────┬───────────────────────────────────────────────┤
│                          │  SET COMMANDS — resolve when all ready        │
│  THESSALMAR              │                                               │
│  Blue Dragon Wyrmling    │  Chad       [Attack  ▼]  Vendella [Attack ▼] │
│                          │  Fiona      [Defend  ▼]  Sprinkles[Special▼] │
│  HP: ████████░  45/45    │  Dave       [Spell   ▼]  Arlo     [Spell  ▼] │
│  Status: —               │  Unpickled  [Item    ▼]                      │
│                          │                                               │
│                          │  Chad 22/28 · Ven 20/20 · Fio 24/26         │
│                          │  Spr 16/20 · Dav 14/18 · Arl 16/16 · Unp 10/14│
│                          │                                               │
│                          │            [⚔ RESOLVE ALL]                  │
├──────────────────────────┴───────────────────────────────────────────────┤
│  COMBAT LOG                                                              │
│  > Chad attacks — rolls 18 — HIT! 11 damage.                            │
│  > Thessalmar uses lightning breath — 4 damage to all front row.        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 3: Story Card / Floor Transition

Identical on mobile and desktop — full-screen dark overlay, centered text.
Single large button to continue. No layout differences needed.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         ✦  FLOOR 3 — THE WIND SEAL  ✦              │
│                                                     │
│   Fiona stops at the threshold. For a moment        │
│   she isn't Fiona. She's standing in a chamber      │
│   she's never seen, speaking words she doesn't      │
│   know, pouring her life into a seal made of        │
│   light. Then it's gone.                            │
│                                                     │
│   Her hands are shaking.                            │
│                                                     │
│         [ DESCEND INTO DARKNESS ]                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### CSS Strategy

```css
/* Mobile-first: base styles target 390px portrait */

@media (min-width: 768px) {
  /* Swap party strip → side panel with HP bars */
  /* Swap D-pad overlay → keyboard hint text    */
  /* Expand combat to two-column layout         */
  /* Show full MP bars for casters              */
}
```

One breakpoint only. Tablets (768–1024px) use the desktop layout — works fine.
The canvas resizes fluidly between breakpoints using CSS width: 100%.

---

## Story Flavor Text & Floor Transition Cards

Between each floor, a brief narrative card surfaces one character's arc. Keep to 3–5
lines of text. These are the only "cutscenes" in the game.

**Floor 1 → 2 (Chad):**
"Chad's scales burn hotter than they should. In the dark, he swears he can hear Infernadax's
voice: *'Traitor's blood. You carry the fire of my betrayer. Let's see if you burn with it
— or burn out.'* He says nothing to the others."

**Floor 2 → 3 (Fiona):**
"For a moment, Fiona isn't Fiona. She's standing in a chamber she's never seen, speaking
words she doesn't know, pouring her life into a seal made of light. Then it's gone.
She's in the dungeon again. Her hands are shaking."

**Floor 3 → 4 (Dave + Ruby Choice aftermath):**
*If ruby kept:* "The ruby pulses in Sprinkles' pack. Dave can feel it — a fragment of
himself, close but just out of reach. He wonders how many pieces of his soul are scattered
through these walls. He hopes they're still him."
*If ruby sold:* "Something feels missing. Dave can't name it, but the seals feel farther
away now, their pull dimmer. He keeps walking."

**Floor 4 → 5 (Arlo):**
"Arlo reads the stars through a crack in the ceiling — barely a sliver of sky, but enough.
*Five shall fall, two shall remain.* He counts the party. Seven. Two will not see daylight.
He doesn't tell anyone what he sees. He's not sure he believes it. He's not sure he doesn't."

**Floor 5 (Unpickled, at phylactery room):**
"Unpickled's hands are shaking. They've been shaking since Floor 3. *'It's here,'* he says,
voice barely above a whisper. *'Right here. If we kill him before we destroy this — he
doesn't die. He just... keeps going. Forever.'* He looks at the others. *'Please. We have
to do this first.'"*

---

## Combat Flavor Text

Short lines for combat events:

- **Xarrath appears (Floor 2):** "A figure materializes from shadow. Orange-gold blood still marks where you wounded him last time. *'The Great One is watching. Prove yourselves again.'"*
- **Xarrath appears (Floor 4):** "*'You are almost there,'* Xarrath says, already fading back into darkness. *'He is waiting for you. So am I.'"*
- **Phylactery found:** "A black obsidian sphere pulses with trapped flame. Unpickled lunges for it before anyone can stop him. *'NOW. We destroy it NOW.'"*
- **Infernadax intro:** "The floor shakes. *'Traitor's blood. Soul-bearer. Celestial echo. Last of the Dragon Claw. My old adversaries, reborn.'* A pause. *'Good.'"*
- **Bad ending:** "The dragon's body crumbles — then rebuilds. Bone and shadow where scales once were. Infernadax laughs. You were warned."
- **Good ending:** "The phylactery shatters. Infernadax roars — not in triumph, but in terror. For the first time in 300 years, he can truly die. And he does."

---

## Technical Notes for Claude Code

### Project Structure

```
tomb-of-infernadax/
├── server.js           ← Express server: static files + all API routes
├── database.js         ← SQLite setup and query helpers
├── package.json        ← Dependencies: express, better-sqlite3, bcrypt, jsonwebtoken
├── game.db             ← SQLite database (auto-created on first run, gitignored)
├── railway.toml        ← Railway config: startCommand = "node server.js"
├── .gitignore          ← Ignore game.db, node_modules
└── public/
    ├── index.html      ← The game (start here, split when JS > 400 lines)
    ├── game.js         ← Game logic (split out when needed)
    └── style.css       ← Styles (split out when needed)
```

### Hosting

- **Platform:** Railway.app — deploy via GitHub repo, auto-deploy on push to main
- **Port:** Always use `process.env.PORT || 3000` — never hardcode. Railway assigns dynamically.
- **URL:** `tomb-of-infernadax.up.railway.app`
- **Linked from:** `https://fiveseals.com/games.html`
- **Server:** Node.js + Express. Serves `public/` as static files. All API routes
  prefixed `/api/`. SQLite via `better-sqlite3` for users, saves, scores.

---

### Database Schema (SQLite via better-sqlite3)

```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT UNIQUE NOT NULL,       -- alphanumeric + underscore, max 20 chars
  password   TEXT NOT NULL,              -- bcrypt hashed, never plaintext
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE saves (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER UNIQUE NOT NULL REFERENCES users(id),
  game_state TEXT NOT NULL,              -- full gameState object as JSON string
  saved_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE scores (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER REFERENCES users(id),
  username       TEXT NOT NULL,
  character      TEXT NOT NULL,
  floors_reached INTEGER NOT NULL,
  days_remaining REAL NOT NULL,
  good_ending    INTEGER NOT NULL,       -- 1 = good, 0 = dracolich bad ending
  created_at     TEXT DEFAULT (datetime('now'))
);
```

---

### Server API

**Auth (no token required):**
```
POST /api/register   { username, password } → { token, username } | 400 error
POST /api/login      { username, password } → { token, username } | 401 error
```

**Saves (require Authorization: Bearer <token>):**
```
GET    /api/save     → { gameState, saved_at } | 404 if no save exists
POST   /api/save     { gameState } → { saved_at }  (upserts — create or replace)
DELETE /api/save     → { deleted: true }  (player starting fresh)
```

**Scores (GET public, POST requires auth):**
```
GET  /api/scores     → Top 20 scores array, ranked by: good_ending desc, days_remaining desc
POST /api/scores     { character, floorsReached, daysRemaining, goodEnding }
                     → Saves score, returns updated top 20
```

**Auth flow in browser:**
- Store JWT in `localStorage` as key `toi_token`
- Send `Authorization: Bearer <token>` header on all protected requests
- On 401 response: clear `toi_token`, show login screen
- Token expiry: 30 days

---

### Login / Register UI

Full-screen overlay, shown before anything else. Dark fantasy aesthetic.

```
┌──────────────────────────────┐
│   ✦  TOMB OF INFERNADAX  ✦  │
│                              │
│   Username  [____________]   │
│   Password  [____________]   │
│                              │
│   [ ENTER THE TOMB ]         │  ← login
│   [ CREATE ACCOUNT ]         │  ← register
│                              │
│   No password recovery.      │
│   Forget it, start anew.     │
└──────────────────────────────┘
```

On successful login → `GET /api/save`:
- **Save exists:** Show resume screen with floor number and days remaining.
  Two buttons: `[ RESUME DESCENT ]` and `[ START FRESH ]`
  START FRESH calls `DELETE /api/save` then goes to character select.
- **No save:** Go straight to character select.

---

### Character Select Screen

Seven character cards. Each shows: name, race/class, HP, special ability summary,
one-line story hook. Player picks one, confirms. Character stored in gameState.

No player names shown in-game — character names only (Chad, Vendella, Fiona,
Sprinkles, Dave, Arlo, Unpickled). Immersion first.

---

### Client-Side Game State

Auto-saved to server after: every floor transition, every rest, Ruby Choice,
and on `visibilitychange` event (tab switch / browser close). One save per user.

```javascript
gameState = {
  username:   "string",
  character:  "Chad",
  floor:       1,
  position:  { x: 1, y: 1, facing: "east" },
  party: [
    { name: "Chad", hp: 28, maxHp: 28, mp: 0,  maxMp: 0,  statusEffects: [], abilitiesUsed: [] },
    { name: "Vendella",  hp: 20, maxHp: 20, mp: 0,  maxMp: 0,  statusEffects: [], abilitiesUsed: [] },
    { name: "Fiona",     hp: 26, maxHp: 26, mp: 0,  maxMp: 0,  statusEffects: [], abilitiesUsed: [] },
    { name: "Sprinkles", hp: 20, maxHp: 20, mp: 0,  maxMp: 0,  statusEffects: [], abilitiesUsed: [] },
    { name: "Dave",      hp: 18, maxHp: 18, mp: 20, maxMp: 20, statusEffects: [], abilitiesUsed: [] },
    { name: "Arlo",      hp: 16, maxHp: 16, mp: 22, maxMp: 22, statusEffects: [], abilitiesUsed: [] },
    { name: "Unpickled", hp: 14, maxHp: 14, mp: 24, maxMp: 24, statusEffects: [], abilitiesUsed: [] }
  ],
  inventory: { gold: 0, items: [] },
  seals:         [],          // ["ruby","sapphire",...] as collected
  chestsOpened:  [],          // [[floor,x,y],...] prevent re-looting
  bossesDefeated:[],          // ["krektak","thessalmar",...]
  flags: {
    rubyKept:             null,   // null = not yet decided, true/false after Floor 3
    xarrathMet:           false,
    xarrathMet2:          false,
    phylacteryDestroyed:  false,
    phylacteryRevealed:   false,  // true if Arlo used Star Sight on Floor 5
    torchActive:          false
  },
  daysRemaining: 7
}
```

Combat state is transient — resolved in memory, result written back to gameState.

---

### Security Notes

- **Never** store plaintext passwords — bcrypt with salt rounds ≥ 10
- **Always** validate JWT on protected routes before touching user data
- **Sanitize** username: alphanumeric + underscore only, max 20 chars
- Password minimum 6 characters
- Rate limit `/api/login`: max 10 attempts per IP per minute (simple in-memory counter)
- No admin panel needed for this version

---

### Scoreboard UI

Shown on win and lose screens.

**Win:** "You defeated Infernadax!" → score auto-submitted → scoreboard table
with player's own row highlighted in gold.

**Lose:** Scoreboard shown read-only. Encourages retry.

**Columns:** Rank · Username · Character · Floors · Days Left · Ending

---

### Utilities

```javascript
roll(sides)      → Math.ceil(Math.random() * sides)   // e.g. roll(20)
rollN(n, sides)  → sum of n dice                      // e.g. rollN(2,6) = 2d6
```

---

## Build Order (Suggested Iteration Sequence)

**Phase 1 — Scaffold & Infrastructure**
1. Project scaffold: `server.js`, `database.js`, `package.json`, `railway.toml`,
   `.gitignore`, `public/index.html` placeholder
2. SQLite schema: users, saves, scores tables auto-created on startup
3. Auth API: `POST /api/register` and `POST /api/login` with bcrypt + JWT
4. Login/register UI in `index.html`
5. Push to GitHub → confirm Railway auto-deploys → confirm live URL

**Phase 2 — Core Game Loop**
6. Character select screen (7 cards, pick one, stored in gameState)
7. Dungeon grid + first-person canvas view + arrow-key + D-pad movement
8. Party HUD: all 7 characters, HP/MP bars, days remaining, gold, seals
9. Random encounter trigger + Wizardry command phase UI
10. Combat resolution (simultaneous) + combat log
11. Floor progression: stairs, floor transitions, story cards

**Phase 3 — Content & Systems**
12. Mini-bosses + scripted Xarrath encounters (Floors 2 and 4)
13. Items, shared inventory, merchant NPC (Floors 1, 3, 5)
14. Spells + MP system for Dave, Arlo, Unpickled
15. Special abilities for all 7 characters
16. Seal gemstone pickups + passive bonuses + Dave's Soul Fragment
17. Monster drops + treasure chests (2 per floor, chestsOpened tracking)

**Phase 4 — Story & Endings**
18. Ruby choice event (Floor 3 — auto-triggers after Silvaclaw, full-screen card)
19. Phylactery room: hidden door, Unpickled sense (WARM/HOT/BURNING), destroy action
20. Final boss (Infernadax) + good ending + dracolich bad ending
21. Floor transition story cards (one per character arc, Floors 1→2 through 4→5)

**Phase 5 — Persistence & Launch**
22. Save API: `GET/POST/DELETE /api/save` + auto-save triggers in client
23. Resume screen on login (if save exists)
24. Score submission on win: `POST /api/scores` + scoreboard display
25. Mobile layout: D-pad overlay, compact party strip, bottom-sheet combat commands
26. HUD polish: cracked-seal clock icon, floor entrance text, status effect icons
27. Link live URL from `fiveseals.com/games.html`
28. Sound effects (optional)
