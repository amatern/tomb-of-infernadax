# CLAUDE.md — Tomb of Infernadax

Always read DESIGN.md before writing any game code. It is the single source of truth for all game mechanics, maps, characters, schema, and API contracts.

## Project

Dark fantasy party-based browser dungeon crawler inspired by Wizardry. Plain HTML/CSS/JS — no frameworks, no build tools on the client side.

**Live URL:** https://tomb-of-infernadax-production-c34c.up.railway.app
**GitHub:** https://github.com/amatern/tomb-of-infernadax
**Deploy:** Railway auto-deploys on push to `main`

## Phase Progress

- [x] Phase 1 — Scaffold & Infrastructure (complete, live)
- [x] Phase 2 — Core Game Loop (complete: char select, dungeon, HUD, combat, story cards)
- [ ] Phase 3 — Content & Systems
  - [x] Step 12 — Mini-bosses + Xarrath scripted encounters (floors 2 & 4)
  - [x] Step 13 — Items, shared inventory, merchant NPC (floors 1, 3, 5)
  - [ ] Step 14 — Spells + MP system (Dave, Arlo, Unpickled)
  - [ ] Step 15 — Special abilities for all 7 characters
  - [ ] Step 16 — Seal gemstone passive bonuses + Dave's Soul Fragment
  - [ ] Step 17 — Monster drops + treasure chests (chestsOpened tracking)
- [ ] Phase 4 — Story & Endings
- [ ] Phase 5 — Persistence & Launch

## Stack

- **Server:** Node.js + Express (`server.js`)
- **Database:** SQLite via `better-sqlite3` (`database.js`) — DB stored at `/tmp/game.db` on Railway
- **Auth:** bcryptjs (salt rounds 10) + jsonwebtoken (30-day tokens)
- **Client:** Vanilla HTML/CSS/JS in `public/` — no build step
- **Port:** Always `process.env.PORT || 3000` — never hardcode

## Key Rules

- `process.env.PORT || 3000` — never hardcode the port
- `process.env.JWT_SECRET` — set in Railway environment variables
- Username: `/^[a-zA-Z0-9_]{1,20}$/` — alphanumeric + underscore, max 20 chars
- Password: minimum 6 characters
- Rate limit login: 10 attempts per IP per minute (in-memory Map)
- JWT stored in `localStorage` as `toi_token`
- Send `Authorization: Bearer <token>` on all protected API requests
- On 401: clear `toi_token`, show login screen
- Wrap all async Express route handlers with the `wrap()` helper (already in server.js)

## File Structure

```
server.js        — Express: all API routes, rate limiter, auth middleware
database.js      — SQLite setup, table creation, query helpers
package.json     — dependencies + postinstall rebuild for better-sqlite3
railway.toml     — startCommand, healthcheckPath /health, timeout 300
.gitignore       — excludes game.db, node_modules
public/
  index.html     — all screens: login, loading, resume, char-select, dungeon, combat, story
  game.js        — all game logic (~1750 lines): constants, maps, combat, canvas, HUD, auto-save
  style.css      — all CSS (~800 lines): mobile-first, 768px desktop breakpoint
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/register | — | `{username, password}` → `{token, username}` |
| POST | /api/login | — | `{username, password}` → `{token, username}` |
| GET | /api/save | ✓ | `{gameState, saved_at}` or 404 |
| POST | /api/save | ✓ | `{gameState}` → `{saved_at}` (upserts) |
| DELETE | /api/save | ✓ | `{deleted: true}` |
| GET | /api/scores | — | Top 20 scores array |
| POST | /api/scores | ✓ | `{character, floorsReached, daysRemaining, goodEnding}` |
| GET | /health | — | `{ok: true}` — Railway health check |

## Database Schema

```sql
users  (id, username UNIQUE, password, created_at)
saves  (id, user_id UNIQUE, game_state JSON, saved_at)
scores (id, user_id, username, character, floors_reached, days_remaining, good_ending, created_at)
```

## Client Screens (index.html)

1. `screen-login` — username + password, ENTER THE TOMB / CREATE ACCOUNT buttons
2. `screen-loading` — shown while calling GET /api/save after login
3. `screen-resume` — save exists: shows floor + days, RESUME / START FRESH
4. `screen-placeholder` — no save: "Character Select coming soon"

## gameState Shape (from DESIGN.md)

```javascript
{
  username, character, floor, position: {x, y, facing},
  party: [ {name, hp, maxHp, mp, maxMp, statusEffects, abilitiesUsed} × 7 ],
  inventory: { gold, items },
  seals, chestsOpened, bossesDefeated,
  flags: { rubyKept, xarrathMet, xarrathMet2, phylacteryDestroyed, phylacteryRevealed, torchActive },
  daysRemaining
}
```

## Phase 3 Starting Point (next session)

Next up: **Step 14** — Spells + MP system for Dave, Arlo, Unpickled

- Spells already defined in SPELLS constant; basic resolution exists in resolvePartyActions
- Need: spell target selection (damage vs heal vs stun vs blind vs dragon)
- Need: Turn Undead stun working properly against undead enemies
- Need: Holy Light dealing 2d8 to dragon-type + healing self 4 HP
- Need: Shadow Bolt applying blind status correctly (currently partially done)
- Casters: Dave (Cleric), Arlo (Cleric), Unpickled (Necromancer)
