/* ============================================================
   Tomb of Infernadax — game.js
   Phase 2: Character Select, Dungeon, Combat, Story Cards
   ============================================================ */

'use strict';

// ── Section 1 — Constants & Data ─────────────────────────────────────────────

const TILE = { WALL: 0, FLOOR: 1, START: 'S', STAIR_DOWN: 3, STAIR_UP: 4,
               MERCHANT: 'M', CHEST: 'C', TRAP: 'T', BOSS: 'B',
               XARRATH: 'X', HIDDEN: 'H', INFERNADAX: 'I', RUBY: 'R',
               WIND: 'W', LIGHT: 'L', FLOODED: '~' };

const FACING = ['north', 'east', 'south', 'west'];

// dx/dy for each facing direction
const DIRS = {
  north: { dx: 0, dy: -1 },
  east:  { dx: 1,  dy: 0  },
  south: { dx: 0,  dy: 1  },
  west:  { dx: -1, dy: 0  }
};

const CHARACTERS = [
  {
    name: 'Chad', race: 'Dragonborn', cls: 'Barbarian',
    hp: 28, mp: 0, str: 5, agi: 3, int: 2, row: 'front',
    ability: 'Dragonfire Rage',
    abilityDesc: 'Double damage on one attack. Costs 3 HP.',
    hook: 'His scales burn hotter than they should.'
  },
  {
    name: 'Vendella', race: 'Tabaxi', cls: 'Rogue',
    hp: 20, mp: 0, str: 4, agi: 5, int: 3, row: 'front',
    ability: 'Dragon Claw Strike',
    abilityDesc: '+5 damage vs. dragon-type enemies.',
    hook: 'Last of her clan. Every kill is an act of remembrance.'
  },
  {
    name: 'Fiona', race: 'Aasimar', cls: 'Barbarian',
    hp: 26, mp: 0, str: 4, agi: 4, int: 2, row: 'front',
    ability: 'Celestial Armor',
    abilityDesc: 'Entire party +3 DEF for one round. Once per floor.',
    hook: 'Sometimes she speaks in a voice that isn\'t hers.'
  },
  {
    name: 'Sprinkles', race: 'Halfling', cls: 'Rogue',
    hp: 20, mp: 0, str: 3, agi: 6, int: 3, row: 'back',
    ability: 'Shadow Strike',
    abilityDesc: 'Guaranteed backstab on round 1: 3× damage, ignores DEF.',
    hook: 'Fast, ruthless, and carrying something complicated.'
  },
  {
    name: 'Dave', race: 'Halfling', cls: 'Cleric',
    hp: 18, mp: 20, str: 2, agi: 3, int: 5, row: 'back',
    ability: 'Soul Fragment',
    abilityDesc: 'After recovering a Seal, all spells cost 0 MP for that floor.',
    hook: 'His soul is scattered through the seals. Each one makes him more whole.'
  },
  {
    name: 'Arlo', race: 'Elf', cls: 'Cleric',
    hp: 16, mp: 22, str: 2, agi: 4, int: 5, row: 'back',
    ability: 'Star Sight',
    abilityDesc: 'Reveals the complete map of the current floor. Once per dungeon.',
    hook: 'He\'s read the stars and knows terrible things are coming.'
  },
  {
    name: 'Unpickled', race: 'Human', cls: 'Necromancer',
    hp: 14, mp: 24, str: 1, agi: 3, int: 6, row: 'back',
    ability: 'Phylactery Sense',
    abilityDesc: 'HUD shows WARM/HOT/BURNING proximity to the phylactery on Floor 5.',
    hook: 'He\'s the only one who can feel it.'
  }
];

const SPELLS = [
  { name: 'Flamebolt',   cost: 5,  cls: 'Necromancer', effect: 'damage', dice: [2,6], desc: '2d6 fire damage' },
  { name: 'Cure Wounds', cost: 4,  cls: 'Cleric',       effect: 'heal',   dice: [1,8], bonus: 3, desc: 'Heal 1d8+3 HP' },
  { name: 'Turn Undead', cost: 6,  cls: 'Cleric',       effect: 'stun',   desc: 'Stuns undead for 2 rounds' },
  { name: 'Bone Spear',  cost: 7,  cls: 'Necromancer',  effect: 'pierce', dice: [3,4], desc: '3d4, ignores defense' },
  { name: 'Holy Light',  cost: 8,  cls: 'Cleric',       effect: 'dragon', dice: [2,8], healSelf: 4, desc: '2d8 vs dragons, heal 4 HP' },
  { name: 'Shadow Bolt', cost: 5,  cls: 'Necromancer',  effect: 'blind',  dice: [1,8], desc: '1d8 + blinds enemy' }
];

const BOSSES = {
  1: { name: "Krek'tak",   hp: 35, maxHp: 35, def: 12, dmg: 8,  id: 'krektak',   type: 'dragon', special: 'none',
       intro: "Krek'tak, Stone Sentinel, erupts from the rubble with a bone-rattling roar!" },
  2: { name: 'Thessalmar', hp: 45, maxHp: 45, def: 14, dmg: 12, id: 'thessalmar', type: 'dragon', special: 'lightning',
       intro: 'Thessalmar, the Blue Wyrmling, rises in a crackle of static. Lightning arcs between his horns!' },
  3: { name: 'Silvaclaw',  hp: 50, maxHp: 50, def: 14, dmg: 11, id: 'silvaclaw',  type: 'dragon', special: 'cold',
       intro: 'Silvaclaw descends in a burst of freezing wind. Your breath fogs instantly.' },
  4: { name: 'Vexmire',    hp: 55, maxHp: 55, def: 15, dmg: 13, id: 'vexmire',    type: 'dragon', special: 'poison',
       intro: 'Vexmire, Plague Drake, hisses and spreads its wings — venom drips from every scale.' },
  5: { name: 'Nyx',        hp: 60, maxHp: 60, def: 16, dmg: 14, id: 'nyx',        type: 'undead', special: 'acid',
       intro: 'Nyx materializes from shadow, scales glistening with corrosive acid. The air burns.' }
};

const XARRATH_DATA = {
  2: {
    hp: 30, maxHp: 30, def: 13, dmg: 7,
    intro: 'A figure materializes from shadow. Orange-gold blood still marks where you wounded him last time. "The Great One is watching. Prove yourselves again."',
    outro: '"Worthy..." Xarrath retreats into the darkness with a nod. "For now."'
  },
  4: {
    hp: 30, maxHp: 30, def: 15, dmg: 9,
    intro: '"You are almost there," Xarrath says, wounds barely healed. "He is waiting for you. So am I."',
    outro: 'Xarrath fades back into darkness. "Go. Face what waits below."'
  }
};

const ITEMS = {
  'Healing Potion':       { cost: 30,  effect: 'heal',      desc: '2d4+2 HP to lowest-HP party member' },
  'Hi-Potion':            { cost: 60,  effect: 'heal-big',  desc: '4d4+4 HP to lowest-HP party member' },
  'Mana Crystal':         { cost: 40,  effect: 'mp',        desc: '+8 MP to lowest-MP caster' },
  'Mana Crystal (large)': { cost: 75,  effect: 'mp-big',    desc: '+15 MP to lowest-MP caster' },
  'Antidote':             { cost: 25,  effect: 'antidote',  desc: 'Cure poison on one party member' },
  'Dragonscale Mail':     { cost: 120, effect: 'armor',     desc: '+2 DEF for entire party (passive, permanent)' },
  'Torch Bundle':         { cost: 20,  effect: 'torch',     desc: 'Restores full view distance on Floor 5' },
  'Elixir':               { cost: 150, effect: 'revive',    desc: 'Revive KO\'d party member at 50% HP' },
  'Seal Breaker':         { cost: 200, effect: 'sealbreak', desc: 'Nullify one enemy\'s special ability this fight' }
};

const MERCHANT_STOCK = {
  1: ['Healing Potion', 'Mana Crystal', 'Antidote', 'Torch Bundle'],
  3: ['Healing Potion', 'Hi-Potion', 'Mana Crystal', 'Mana Crystal (large)', 'Antidote', 'Dragonscale Mail', 'Torch Bundle', 'Elixir'],
  5: ['Healing Potion', 'Hi-Potion', 'Mana Crystal', 'Mana Crystal (large)', 'Antidote', 'Dragonscale Mail', 'Torch Bundle', 'Elixir', 'Seal Breaker']
};

const FLOOR_MAPS = {
  1: [
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
  ],
  2: [
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
  ],
  3: [
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
  ],
  4: [
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
  ],
  5: [
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
};

const FLOOR_ENEMIES = {
  1: [
    { name: 'Kobold Scout',     hp: 8,  maxHp: 8,  def: 8,  dmg: 3, type: 'humanoid' },
    { name: 'Kobold Shaman',    hp: 10, maxHp: 10, def: 9,  dmg: 5, type: 'humanoid' },
    { name: 'Cave Bat Swarm',   hp: 12, maxHp: 12, def: 7,  dmg: 4, type: 'beast'    }
  ],
  2: [
    { name: 'Sahuagin Warrior',          hp: 14, maxHp: 14, def: 10, dmg: 6, type: 'humanoid'  },
    { name: 'Corrupted Water Elemental', hp: 18, maxHp: 18, def: 11, dmg: 7, type: 'elemental' },
    { name: 'Cult Fanatic',              hp: 16, maxHp: 16, def: 10, dmg: 6, type: 'humanoid'  }
  ],
  3: [
    { name: 'Storm Harpy',    hp: 16, maxHp: 16, def: 11, dmg: 7, type: 'beast'     },
    { name: 'Wind Elemental', hp: 20, maxHp: 20, def: 12, dmg: 8, type: 'elemental' },
    { name: 'Giant Eagle',    hp: 22, maxHp: 22, def: 11, dmg: 9, type: 'beast'     }
  ],
  4: [
    { name: 'Blinded Cultist',    hp: 18, maxHp: 18, def: 10, dmg: 8,  type: 'humanoid'  },
    { name: 'Radiant Golem',      hp: 28, maxHp: 28, def: 15, dmg: 10, type: 'construct'  },
    { name: 'Dragon Cult Priest', hp: 20, maxHp: 20, def: 12, dmg: 9,  type: 'humanoid'  }
  ],
  5: [
    { name: 'Wraith',               hp: 22, maxHp: 22, def: 13, dmg: 10, type: 'undead', physImmune: true },
    { name: 'Shadow Drake',         hp: 30, maxHp: 30, def: 14, dmg: 11, type: 'dragon' },
    { name: 'Undead Crimson Guard', hp: 25, maxHp: 25, def: 13, dmg: 10, type: 'undead' }
  ]
};

const STORY_CARDS = {
  '1to2': {
    label: 'Floor 1 → 2',
    text: `Chad's scales burn hotter than they should. In the dark, he swears he can hear Infernadax's voice: <em>"Traitor's blood. You carry the fire of my betrayer. Let's see if you burn with it — or burn out."</em> He says nothing to the others.`
  },
  '2to3': {
    label: 'Floor 2 → 3',
    text: `For a moment, Fiona isn't Fiona. She's standing in a chamber she's never seen, speaking words she doesn't know, pouring her life into a seal made of light. Then it's gone. She's in the dungeon again. Her hands are shaking.`
  },
  '3to4': {
    label: 'Floor 3 → 4',
    text: `The ruby pulses in Sprinkles' pack. Dave can feel it — a fragment of himself, close but just out of reach. He wonders how many pieces of his soul are scattered through these walls. He hopes they're still him.`
  },
  '4to5': {
    label: 'Floor 4 → 5',
    text: `Arlo reads the stars through a crack in the ceiling — barely a sliver of sky, but enough. <em>Five shall fall, two shall remain.</em> He counts the party. Seven. Two will not see daylight. He doesn't tell anyone what he sees. He's not sure he believes it. He's not sure he doesn't.`
  }
};

// ── Section 2 — State & Init ──────────────────────────────────────────────────

let gameState = null;

function buildPartyMember(charDef) {
  return {
    name:          charDef.name,
    hp:            charDef.hp,
    maxHp:         charDef.hp,
    mp:            charDef.mp,
    maxMp:         charDef.mp,
    str:           charDef.str,
    agi:           charDef.agi,
    int:           charDef.int,
    row:           charDef.row,
    cls:           charDef.cls,
    statusEffects: [],
    abilitiesUsed: []
  };
}

function initNewGame(username) {
  gameState = {
    username,
    character:      null,
    floor:          1,
    position:       { x: 1, y: 1, facing: 'east' },
    party:          CHARACTERS.map(buildPartyMember),
    inventory:      { gold: 0, items: [] },
    seals:          [],
    chestsOpened:   [],
    bossesDefeated: [],
    flags: {
      rubyKept:            null,
      xarrathMet:          false,
      xarrathMet2:         false,
      phylacteryDestroyed: false,
      phylacteryRevealed:  false,
      torchActive:         false,
      trapF1Fired:         false,
      dragonscaleMail:     false,
      soulFragmentFloor:   null
    },
    daysRemaining: 7
  };
}

function startGame(savedState) {
  gameState = savedState;
  window.pendingGameState = null;
  showScreen('dungeon');
  initCanvas();
  renderDungeon();
  renderPartyHUD();
  logMsg('The darkness closes around you.');
}

// ── Section 3 — Utils ─────────────────────────────────────────────────────────

function roll(sides) {
  return Math.ceil(Math.random() * sides);
}

function rollN(n, sides) {
  let total = 0;
  for (let i = 0; i < n; i++) total += roll(sides);
  return total;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function isWalkable(map, x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
  const t = map[y][x];
  return t !== 0;
}

function tileAt(map, x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return 0;
  return map[y][x];
}

function turnLeft(facing) {
  const i = FACING.indexOf(facing);
  return FACING[(i + 3) % 4];
}

function turnRight(facing) {
  const i = FACING.indexOf(facing);
  return FACING[(i + 1) % 4];
}

function hpColor(hp, maxHp) {
  if (hp <= 0) return 'black';
  const pct = hp / maxHp;
  if (pct > 0.5) return 'green';
  if (pct > 0.25) return 'yellow';
  return 'red';
}

let _msgLine1 = '';
let _msgLine2 = '';

function logMsg(line) {
  _msgLine2 = _msgLine1;
  _msgLine1 = line;
  const el1 = document.getElementById('msg-line-1');
  const el2 = document.getElementById('msg-line-2');
  if (el1) el1.textContent = _msgLine1;
  if (el2) el2.textContent = _msgLine2;
}

// ── Section 4 — Character Select ─────────────────────────────────────────────

let _selectedCharIndex = -1;

function renderCharacterSelect() {
  _selectedCharIndex = -1;
  const container = document.getElementById('char-cards');
  container.innerHTML = '';

  CHARACTERS.forEach((ch, i) => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.innerHTML = `
      <div class="char-card-name">${ch.name}</div>
      <div class="char-card-class">${ch.race} ${ch.cls}</div>
      <div class="char-card-stats">HP ${ch.hp} · STR ${ch.str} · AGI ${ch.agi} · INT ${ch.int}</div>
      <div class="char-card-ability">${ch.ability}: ${ch.abilityDesc}</div>
      <div class="char-card-hook">${ch.hook}</div>
    `;
    card.addEventListener('click', () => selectCharacter(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCharacter(i); }
    });
    container.appendChild(card);
  });

  const btn = document.getElementById('btn-confirm-char');
  btn.disabled = true;
  btn.onclick = confirmCharacter;
}

function selectCharacter(index) {
  _selectedCharIndex = index;
  document.querySelectorAll('.char-card').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });
  document.getElementById('btn-confirm-char').disabled = false;
}

function confirmCharacter() {
  if (_selectedCharIndex < 0) return;
  gameState.character = CHARACTERS[_selectedCharIndex].name;
  autoSave();
  showScreen('dungeon');
  initCanvas();
  renderDungeon();
  renderPartyHUD();
  logMsg('The tomb seals behind you. There is no turning back.');
}

// ── Section 5 — Canvas Renderer ───────────────────────────────────────────────

let _canvas = null;
let _ctx    = null;

// Perspective scale: fraction of half-width/half-height from centre per depth step.
// Index 0 = screen edge (at player), 1–3 = 1–3 tiles ahead, 4 = vanishing point.
const CORRIDOR_FRACS = [0.50, 0.32, 0.205, 0.125, 0.075];

const WALL_COLORS  = ['#614a2a', '#453420', '#2e2218']; // band 0 (nearest) → 2 (farthest)
const FLOOR_COLORS = ['#201810', '#181208', '#0f0d06'];
const CEIL_COLORS  = ['#181309', '#120f07', '#0a0806'];

function initCanvas() {
  _canvas = document.getElementById('dungeon-canvas');
  _ctx    = _canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!_canvas) return;
  const wrap = _canvas.parentElement;
  _canvas.width  = wrap.clientWidth;
  _canvas.height = wrap.clientHeight;
  if (gameState) renderDungeon();
}

// Rectangle at a given depth (larger = nearer to player).
function corridorRect(depth, W, H) {
  const s = CORRIDOR_FRACS[Math.min(depth, CORRIDOR_FRACS.length - 1)];
  const cx = W / 2, cy = H / 2;
  return { l: cx - W * s, r: cx + W * s, t: cy - H * s, b: cy + H * s };
}

function renderDungeon() {
  if (!_canvas || !_ctx || !gameState) return;
  const W = _canvas.width;
  const H = _canvas.height;
  const ctx = _ctx;

  // Sky & floor base gradient
  drawSkyFloor(ctx, W, H);

  // Perspective corridor slices
  drawDepthSlices(ctx, W, H);

  // Torch glow vignette
  const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.65);
  grd.addColorStop(0,   'rgba(180, 100, 20, 0.10)');
  grd.addColorStop(0.5, 'rgba(100, 50, 10, 0.05)');
  grd.addColorStop(1,   'rgba(0,0,0,0.45)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Special tile indicators (stairs, chest, merchant)
  drawSpecialTileIndicators(ctx, W, H);

  // Minimap overlay
  drawMinimap(ctx, W, H);
}

function drawSkyFloor(ctx, W, H) {
  // Ceiling
  const ceilGrd = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  ceilGrd.addColorStop(0, '#070503');
  ceilGrd.addColorStop(1, '#141008');
  ctx.fillStyle = ceilGrd;
  ctx.fillRect(0, 0, W, H * 0.5);

  // Floor
  const floorGrd = ctx.createLinearGradient(0, H * 0.5, 0, H);
  floorGrd.addColorStop(0, '#141008');
  floorGrd.addColorStop(1, '#070503');
  ctx.fillStyle = floorGrd;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);
}

// Draw perspective bands back-to-front.
// Band b spans the space from (b tiles ahead) to (b+1 tiles ahead).
// Floor and ceiling strips are always drawn — this creates the tunnel depth cue
// even when the corridor continues open with no front wall.
function drawDepthSlices(ctx, W, H) {
  if (!gameState) return;
  const { x, y, facing } = gameState.position;
  const map = FLOOR_MAPS[gameState.floor];
  if (!map) return;

  const fwd  = DIRS[facing];
  const left = DIRS[turnLeft(facing)];

  // Fill vanishing point (the dark area seen at maximum depth)
  const vp = corridorRect(3, W, H);
  ctx.fillStyle = '#090806';
  ctx.fillRect(vp.l, vp.t, vp.r - vp.l, vp.b - vp.t);

  for (let band = 2; band >= 0; band--) {
    const outer = corridorRect(band,     W, H); // near face of this band
    const inner = corridorRect(band + 1, W, H); // far face of this band

    const wallColor  = WALL_COLORS[band];
    const floorColor = FLOOR_COLORS[band];
    const ceilColor  = CEIL_COLORS[band];

    // Tile positions to check for this band
    const fwdX = x + fwd.dx  * (band + 1);
    const fwdY = y + fwd.dy  * (band + 1);
    const lx   = x + fwd.dx  * band + left.dx;
    const ly   = y + fwd.dy  * band + left.dy;
    const rx   = x + fwd.dx  * band - left.dx;
    const ry   = y + fwd.dy  * band - left.dy;

    const hasFront = !isWalkable(map, fwdX, fwdY);
    const hasLeft  = !isWalkable(map, lx, ly);
    const hasRight = !isWalkable(map, rx, ry);

    // ── Floor strip (always drawn) ───────────────────────────────────────────
    ctx.fillStyle = floorColor;
    ctx.beginPath();
    ctx.moveTo(outer.l, outer.b);
    ctx.lineTo(outer.r, outer.b);
    ctx.lineTo(inner.r, inner.b);
    ctx.lineTo(inner.l, inner.b);
    ctx.closePath();
    ctx.fill();

    // ── Ceiling strip (always drawn) ─────────────────────────────────────────
    ctx.fillStyle = ceilColor;
    ctx.beginPath();
    ctx.moveTo(outer.l, outer.t);
    ctx.lineTo(outer.r, outer.t);
    ctx.lineTo(inner.r, inner.t);
    ctx.lineTo(inner.l, inner.t);
    ctx.closePath();
    ctx.fill();

    // ── Left wall panel ──────────────────────────────────────────────────────
    if (hasLeft) {
      ctx.fillStyle = wallColor;
      ctx.beginPath();
      ctx.moveTo(outer.l, outer.t);
      ctx.lineTo(inner.l, inner.t);
      ctx.lineTo(inner.l, inner.b);
      ctx.lineTo(outer.l, outer.b);
      ctx.closePath();
      ctx.fill();
      drawEdgeLine(ctx, outer.l, outer.t, inner.l, inner.t);
      drawEdgeLine(ctx, outer.l, outer.b, inner.l, inner.b);
    }

    // ── Right wall panel ─────────────────────────────────────────────────────
    if (hasRight) {
      ctx.fillStyle = wallColor;
      ctx.beginPath();
      ctx.moveTo(outer.r, outer.t);
      ctx.lineTo(inner.r, inner.t);
      ctx.lineTo(inner.r, inner.b);
      ctx.lineTo(outer.r, outer.b);
      ctx.closePath();
      ctx.fill();
      drawEdgeLine(ctx, outer.r, outer.t, inner.r, inner.t);
      drawEdgeLine(ctx, outer.r, outer.b, inner.r, inner.b);
    }

    // ── Front wall face ──────────────────────────────────────────────────────
    if (hasFront) {
      ctx.fillStyle = wallColor;
      ctx.fillRect(inner.l, inner.t, inner.r - inner.l, inner.b - inner.t);
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(inner.l + 0.5, inner.t + 0.5,
                     inner.r - inner.l - 1, inner.b - inner.t - 1);
    }
  }

  // Flooded tile tint (Floor 2 hazard)
  const curTile = tileAt(map, x, y);
  if (curTile === '~') {
    ctx.fillStyle = 'rgba(30, 80, 160, 0.18)';
    ctx.fillRect(0, 0, W, H);
  }
}

// Draw a single definition edge line between two points.
function drawEdgeLine(ctx, x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawSpecialTileIndicators(ctx, W, H) {
  if (!gameState) return;
  const { x, y, facing } = gameState.position;
  const map = FLOOR_MAPS[gameState.floor];
  if (!map) return;

  const fwd = DIRS[facing];
  const ahead1 = tileAt(map, x + fwd.dx, y + fwd.dy);
  const ahead2 = tileAt(map, x + fwd.dx * 2, y + fwd.dy * 2);

  function drawIcon(text, alpha, scale) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${Math.floor(W * scale)}px Cinzel, serif`;
    ctx.fillStyle = '#c07830';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2);
    ctx.restore();
  }

  if (ahead1 === 3 || ahead2 === 3) drawIcon('▼', ahead1 === 3 ? 0.9 : 0.5, 0.06);
  if (ahead1 === 4 || ahead2 === 4) drawIcon('▲', ahead1 === 4 ? 0.9 : 0.5, 0.06);
  if (ahead1 === 'M' || ahead2 === 'M') drawIcon('⚖', ahead1 === 'M' ? 0.9 : 0.5, 0.06);
  if (ahead1 === 'C' || ahead2 === 'C') {
    const key = `${gameState.floor},${x + fwd.dx},${y + fwd.dy}`;
    const opened = gameState.chestsOpened.some(c => c.join(',') === key);
    if (!opened) drawIcon('⬡', ahead1 === 'C' ? 0.9 : 0.5, 0.05);
  }
}

// Small 2D minimap overlay in the top-right corner of the canvas.
function drawMinimap(ctx, W, H) {
  const map = FLOOR_MAPS[gameState.floor];
  if (!map) return;

  const CELL   = 7;
  const COLS   = map[0].length;
  const ROWS   = map.length;
  const mmW    = COLS * CELL;
  const mmH    = ROWS * CELL;
  const mmX    = W - mmW - 8;  // top-right corner
  const mmY    = 8;

  // Background panel
  ctx.fillStyle = 'rgba(6, 5, 3, 0.82)';
  ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
  ctx.strokeStyle = '#2a1e12';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX - 1.5, mmY - 1.5, mmW + 3, mmH + 3);

  // Cells
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = map[row][col];
      const px = mmX + col * CELL;
      const py = mmY + row * CELL;

      if (tile === 0) {
        ctx.fillStyle = '#0e0b07';
      } else {
        ctx.fillStyle = '#2a1e12';
      }
      ctx.fillRect(px, py, CELL, CELL);

      // Stair markers
      if (tile === 3 || tile === 4) {
        ctx.fillStyle = '#c07830';
        ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      }
    }
  }

  // Player dot
  const { x, y, facing } = gameState.position;
  const px = mmX + x * CELL + Math.floor(CELL / 2);
  const py = mmY + y * CELL + Math.floor(CELL / 2);

  ctx.fillStyle = '#e8a040';
  ctx.beginPath();
  ctx.arc(px, py, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Facing arrow
  const fwd = DIRS[facing];
  ctx.strokeStyle = '#e8a040';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + fwd.dx * 4, py + fwd.dy * 4);
  ctx.stroke();
}

// ── Section 6 — Movement & Navigation ────────────────────────────────────────

function moveForward() {
  if (!gameState) return;
  const { x, y, facing } = gameState.position;
  const d = DIRS[facing];
  const nx = x + d.dx;
  const ny = y + d.dy;
  const map = FLOOR_MAPS[gameState.floor];
  if (!map || !isWalkable(map, nx, ny)) {
    logMsg('A stone wall blocks your path.');
    renderDungeon();
    return;
  }
  gameState.position.x = nx;
  gameState.position.y = ny;
  renderDungeon();
  renderPartyHUD();
  checkTileTrigger(nx, ny);
  if (!_inCombat) maybeEncounter();
}

function moveBackward() {
  if (!gameState) return;
  const { x, y, facing } = gameState.position;
  const opp = DIRS[FACING[(FACING.indexOf(facing) + 2) % 4]];
  const nx = x + opp.dx;
  const ny = y + opp.dy;
  const map = FLOOR_MAPS[gameState.floor];
  if (!map || !isWalkable(map, nx, ny)) {
    logMsg('The wall behind you is solid stone.');
    renderDungeon();
    return;
  }
  gameState.position.x = nx;
  gameState.position.y = ny;
  renderDungeon();
  renderPartyHUD();
  checkTileTrigger(nx, ny);
  if (!_inCombat) maybeEncounter();
}

function doTurnLeft() {
  if (!gameState) return;
  gameState.position.facing = turnLeft(gameState.position.facing);
  renderDungeon();
  updateTopbar();
}

function doTurnRight() {
  if (!gameState) return;
  gameState.position.facing = turnRight(gameState.position.facing);
  renderDungeon();
  updateTopbar();
}

function checkTileTrigger(x, y) {
  const map = FLOOR_MAPS[gameState.floor];
  if (!map) return;
  const tile = tileAt(map, x, y);

  if (tile === 'T' && !gameState.flags.trapF1Fired && gameState.floor === 1) {
    gameState.flags.trapF1Fired = true;
    fireTrap();
  }

  if (tile === 3) {
    logMsg('Stairs lead down into deeper darkness.');
  }
  if (tile === 4) {
    logMsg('Stairs lead back up toward the entrance.');
  }
  if (tile === 'M') {
    openMerchant();
  }
  if (tile === 'B') {
    const bossDef = BOSSES[gameState.floor];
    if (bossDef && !gameState.bossesDefeated.includes(bossDef.id)) {
      startBossFight(gameState.floor);
    }
  }
  if (tile === 'X') {
    const flagKey = gameState.floor === 2 ? 'xarrathMet' : 'xarrathMet2';
    if (!gameState.flags[flagKey]) {
      startXarrathFight(gameState.floor);
    }
  }
  if (tile === 'C') {
    const key = [gameState.floor, x, y];
    const keyStr = key.join(',');
    if (!gameState.chestsOpened.some(c => c.join(',') === keyStr)) {
      openChest(x, y);
    }
  }
}

function fireTrap() {
  logMsg('The ceiling collapses! Front row takes 5 damage!');
  for (let i = 0; i < 3; i++) {
    const m = gameState.party[i];
    if (m.hp > 0) m.hp = Math.max(0, m.hp - 5);
  }
  renderPartyHUD();
  autoSave();
}

function openChest(x, y) {
  gameState.chestsOpened.push([gameState.floor, x, y]);
  const goldAmt = rollN(2, 20) + 30;
  gameState.inventory.gold += goldAmt;
  gameState.inventory.items.push('Healing Potion');
  logMsg(`You find a chest! +${goldAmt} gold and a Healing Potion.`);
  renderPartyHUD();
  autoSave();
}

let _inCombat = false;

function maybeEncounter() {
  if (_inCombat) return;
  if (Math.random() > 0.25) return;
  const table = FLOOR_ENEMIES[gameState.floor] || FLOOR_ENEMIES[1];
  const enemyTemplate = table[Math.floor(Math.random() * table.length)];
  // Deep copy
  const enemy = JSON.parse(JSON.stringify(enemyTemplate));
  startCombat([enemy]);
}

function descend() {
  if (!gameState) return;
  // Stairs are sealed until the floor guardian is defeated
  const bossDef = BOSSES[gameState.floor];
  if (bossDef && !gameState.bossesDefeated.includes(bossDef.id)) {
    logMsg('The way down is sealed. Defeat the floor guardian first.');
    return;
  }
  const nextFloor = gameState.floor + 1;
  if (!FLOOR_MAPS[nextFloor]) {
    logMsg('The passage is sealed. There is nothing beyond... yet.');
    return;
  }
  gameState.floor = nextFloor;
  gameState.daysRemaining = Math.max(0, gameState.daysRemaining - 0.5);

  // Find start position on new floor (stairs up tile = 4)
  const map = FLOOR_MAPS[nextFloor];
  let sx = 1, sy = 1;
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 4) { sx = col; sy = row; }
    }
  }
  gameState.position = { x: sx, y: sy, facing: 'south' };

  // MP auto-regen for casters on new floor
  ['Dave', 'Arlo', 'Unpickled'].forEach(name => {
    const m = gameState.party.find(p => p.name === name);
    if (m) m.mp = Math.min(m.maxMp, m.mp + 3);
  });

  autoSave();

  // Show story card if available
  const cardKey = (nextFloor - 1) + 'to' + nextFloor;
  if (STORY_CARDS[cardKey]) {
    showStoryCard(cardKey, () => {
      showScreen('dungeon');
      renderDungeon();
      renderPartyHUD();
      logMsg(`You descend to Floor ${nextFloor}.`);
    });
  } else {
    showScreen('dungeon');
    renderDungeon();
    renderPartyHUD();
    logMsg(`You descend to Floor ${nextFloor}.`);
  }
}

function ascend() {
  if (!gameState) return;
  if (gameState.floor <= 1) {
    logMsg('The entrance is sealed. You cannot leave.');
    return;
  }
  const prevFloor = gameState.floor - 1;
  gameState.floor = prevFloor;
  gameState.daysRemaining = Math.max(0, gameState.daysRemaining - 0.5);

  // Find stairs down tile (3) as landing position
  const map = FLOOR_MAPS[prevFloor];
  let sx = 1, sy = 1;
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 3) { sx = col; sy = row; }
    }
  }
  gameState.position = { x: sx, y: sy, facing: 'north' };

  autoSave();
  renderDungeon();
  renderPartyHUD();
  logMsg(`You ascend back to Floor ${prevFloor}.`);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const dungeon = document.getElementById('screen-dungeon');
  if (!dungeon || dungeon.hidden) return;
  if (_inCombat) return;
  switch (e.key) {
    case 'ArrowUp':    e.preventDefault(); moveForward();   break;
    case 'ArrowDown':  e.preventDefault(); moveBackward();  break;
    case 'ArrowLeft':  e.preventDefault(); doTurnLeft();    break;
    case 'ArrowRight': e.preventDefault(); doTurnRight();   break;
  }

  // Stair shortcuts
  const { x, y } = gameState.position;
  const map = FLOOR_MAPS[gameState.floor];
  if (map) {
    const tile = tileAt(map, x, y);
    if (e.key === 'ArrowUp' && tile === 3) { e.preventDefault(); descend(); }
    if (e.key === 'ArrowUp' && tile === 4) { e.preventDefault(); ascend();  }
  }
});

// D-pad buttons
document.addEventListener('DOMContentLoaded', () => {
  const up    = document.getElementById('dpad-up');
  const down  = document.getElementById('dpad-down');
  const left  = document.getElementById('dpad-left');
  const right = document.getElementById('dpad-right');

  if (up)    up.addEventListener('click',    () => { if (!_inCombat) moveForward();  });
  if (down)  down.addEventListener('click',  () => { if (!_inCombat) moveBackward(); });
  if (left)  left.addEventListener('click',  () => { if (!_inCombat) doTurnLeft();   });
  if (right) right.addEventListener('click', () => { if (!_inCombat) doTurnRight();  });

  // Also handle stair tiles on dpad up
  if (up) up.addEventListener('click', () => {
    if (!gameState || _inCombat) return;
    const { x, y } = gameState.position;
    const map = FLOOR_MAPS[gameState.floor];
    if (!map) return;
    const tile = tileAt(map, x, y);
    if (tile === 3) descend();
    if (tile === 4) ascend();
  });
});

// ── Section 7 — Party HUD ─────────────────────────────────────────────────────

function renderPartyHUD() {
  if (!gameState) return;
  updateTopbar();
  renderPartyStrip();
  renderPartyPanel();
}

function updateTopbar() {
  const floorEl = document.getElementById('hud-floor-label');
  const daysEl  = document.getElementById('hud-days-label');
  const goldEl  = document.getElementById('hud-gold-label');

  if (floorEl) {
    const compass = { north: 'N', east: 'E', south: 'S', west: 'W' };
    floorEl.textContent = 'Floor ' + gameState.floor + '/5  ' + (compass[gameState.position.facing] || '');
  }
  if (daysEl) {
    const d = gameState.daysRemaining;
    daysEl.textContent = d + (d === 1 ? ' day' : ' days');
    daysEl.className = 'hud-days' +
      (d <= 1 ? ' danger' : d <= 2 ? ' warn' : '');
  }
  if (goldEl) goldEl.textContent = gameState.inventory.gold + ' gp';
}

function renderPartyStrip() {
  const strip = document.getElementById('party-strip');
  if (!strip) return;
  strip.innerHTML = '';

  gameState.party.forEach((m, i) => {
    const color = hpColor(m.hp, m.maxHp);
    const dot = document.createElement('div');
    dot.className = `char-dot hp-${color}`;
    dot.title = `${m.name} — ${m.hp}/${m.maxHp} HP`;
    dot.innerHTML = `
      <span class="char-dot-icon">${color === 'black' ? '✝' : '●'}</span>
      <span class="char-dot-label">${m.name.slice(0, 3)}</span>
    `;
    dot.addEventListener('click', () => openCharacterPopover(i));
    strip.appendChild(dot);
  });
}

function renderPartyPanel() {
  const panel = document.getElementById('party-panel');
  if (!panel) return;
  panel.innerHTML = '';

  // Front row label
  const frontLabel = document.createElement('p');
  frontLabel.className = 'party-row-label';
  frontLabel.textContent = 'Front Row';
  panel.appendChild(frontLabel);

  gameState.party.forEach((m, i) => {
    if (i === 3) {
      const hr = document.createElement('hr');
      hr.className = 'party-row-divider';
      panel.appendChild(hr);
      const backLabel = document.createElement('p');
      backLabel.className = 'party-row-label';
      backLabel.textContent = 'Back Row';
      panel.appendChild(backLabel);
    }

    const row = document.createElement('div');
    row.className = 'party-member-row';
    row.title = `Click for details`;

    const color = hpColor(m.hp, m.maxHp);
    const hpPct = m.maxHp > 0 ? (m.hp / m.maxHp * 100) : 0;
    const mpPct = m.maxMp > 0 ? (m.mp / m.maxMp * 100) : 0;
    const hpFillClass = color === 'red' ? ' danger' : color === 'yellow' ? ' warn' : '';

    row.innerHTML = `
      <span class="party-member-name">${m.name}</span>
      <div class="party-hp-wrap">
        <div class="party-bar-track">
          <div class="party-hp-fill${hpFillClass}" style="width:${hpPct}%"></div>
        </div>
        ${m.maxMp > 0 ? `<div class="party-bar-track">
          <div class="party-mp-fill" style="width:${mpPct}%"></div>
        </div>` : ''}
        <div class="party-hp-text">${m.hp}/${m.maxHp} HP${m.maxMp > 0 ? ` · ${m.mp}/${m.maxMp} MP` : ''}</div>
      </div>
    `;
    row.addEventListener('click', () => openCharacterPopover(i));
    panel.appendChild(row);
  });

  // Seals row
  const sealsRow = document.createElement('div');
  sealsRow.className = 'seals-row';
  sealsRow.innerHTML = '<span class="seal-label">Seals</span>';
  const sealNames = ['ruby','sapphire','topaz','diamond','emerald'];
  sealNames.forEach(s => {
    const pip = document.createElement('div');
    pip.className = 'seal-pip' + (gameState.seals.includes(s) ? ' active' : '');
    pip.title = s;
    sealsRow.appendChild(pip);
  });
  panel.appendChild(sealsRow);
}

function openCharacterPopover(index) {
  const m = gameState.party[index];
  const ch = CHARACTERS[index];
  const sheet = document.getElementById('char-sheet');
  const overlay = document.getElementById('sheet-overlay');
  if (!sheet || !overlay) return;

  document.getElementById('char-sheet-name').textContent = m.name + ' — ' + ch.race + ' ' + ch.cls;
  const body = document.getElementById('char-sheet-body');
  const color = hpColor(m.hp, m.maxHp);
  body.innerHTML = `
    <p style="font-size:0.65rem;color:var(--text-dim);letter-spacing:0.1em;margin-bottom:0.5rem">
      HP: ${m.hp}/${m.maxHp} · MP: ${m.mp}/${m.maxMp}<br>
      STR ${m.str} · AGI ${m.agi} · INT ${m.int}<br>
      Row: ${m.row}
    </p>
    <p style="font-size:0.65rem;color:var(--accent);letter-spacing:0.08em;margin-bottom:0.25rem">
      ${ch.ability}
    </p>
    <p style="font-size:0.6rem;color:var(--text-dim);letter-spacing:0.05em;margin-bottom:0.5rem">
      ${ch.abilityDesc}
    </p>
    ${m.statusEffects.length ? `<p style="font-size:0.6rem;color:var(--crimson-bright)">Status: ${m.statusEffects.join(', ')}</p>` : ''}
    <p style="font-size:0.58rem;color:var(--text-faint);font-style:italic;margin-top:0.5rem">${ch.hook}</p>
  `;

  overlay.classList.add('open');
  sheet.classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('btn-char-sheet-close');
  if (closeBtn) closeBtn.addEventListener('click', closeCharSheet);

  const overlay = document.getElementById('sheet-overlay');
  if (overlay) overlay.addEventListener('click', () => {
    closeCharSheet();
    closeCommandSheet();
  });
});

function closeCharSheet() {
  const sheet = document.getElementById('char-sheet');
  const overlay = document.getElementById('sheet-overlay');
  if (sheet) sheet.classList.remove('open');
  if (overlay && !document.getElementById('combat-sheet').classList.contains('open')) {
    overlay.classList.remove('open');
  }
}

// ── Section 8 — Combat State Machine ─────────────────────────────────────────

let combatState = null;
let _pendingCharIndex = -1;

function startCombat(enemyDefs) {
  _inCombat = true;
  combatState = {
    enemies:  JSON.parse(JSON.stringify(enemyDefs)),
    round:    1,
    commands: new Array(7).fill(null),
    phase:    'command',
    log:      []
  };
  showScreen('combat');
  renderCombatScreen();
  appendCombatLog(`⚔ Encounter! A ${combatState.enemies[0].name} appears!`);
}

function renderCombatScreen() {
  if (!combatState || !gameState) return;

  // Floor / round labels
  const floorLabel = document.getElementById('combat-floor-label');
  const roundLabel = document.getElementById('combat-round-label');
  if (floorLabel) floorLabel.textContent = '⚔ Floor ' + gameState.floor;
  if (roundLabel) roundLabel.textContent  = 'Round ' + combatState.round;

  // Phase label
  const phaseLabel = document.getElementById('combat-phase-label');
  if (phaseLabel) phaseLabel.textContent =
    combatState.phase === 'command' ? 'Set Commands — Resolve when all ready' : 'Resolving…';

  renderEnemies();
  renderCommandList();
  updateResolveButton();
}

function renderEnemies() {
  const area = document.getElementById('enemy-area');
  if (!area || !combatState) return;
  area.innerHTML = '';

  const listEl = document.createElement('div');
  listEl.className = 'enemies-list';

  combatState.enemies.forEach((e, i) => {
    const pct = e.maxHp > 0 ? (e.hp / e.maxHp * 100) : 0;
    const div = document.createElement('div');
    div.className = 'enemy-entry' + (e.hp <= 0 ? ' defeated' : '');
    div.innerHTML = `
      <div class="enemy-name">${e.name}${e.hp <= 0 ? ' — DEFEATED' : ''}</div>
      <div class="enemy-hp-bar-wrap">
        <div class="enemy-hp-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="enemy-hp-text">${Math.max(0, e.hp)} / ${e.maxHp} HP</div>
      ${e.status ? `<div class="enemy-status">Status: ${e.status}</div>` : ''}
    `;
    listEl.appendChild(div);
  });

  area.appendChild(listEl);
}

function renderCommandList() {
  const list = document.getElementById('command-list');
  if (!list || !combatState || !gameState) return;
  list.innerHTML = '';

  gameState.party.forEach((m, i) => {
    const row = document.createElement('div');
    const ko = m.hp <= 0;
    row.className = 'cmd-row' + (ko ? ' ko' : '');

    const cmd = combatState.commands[i];
    const badgeClass = (cmd ? 'set' : 'unset');
    const badgeText  = cmd ? (cmd.label || cmd.action.toUpperCase()) : 'SET…';

    row.innerHTML = `
      <span class="cmd-char-name">${m.name}</span>
      <span class="cmd-char-hp">${m.hp}/${m.maxHp}</span>
      <span class="cmd-badge ${badgeClass}">${badgeText}</span>
    `;

    if (!ko) {
      row.addEventListener('click', () => openCommandSheet(i));
    }
    list.appendChild(row);
  });
}

function updateResolveButton() {
  const btn = document.getElementById('btn-resolve');
  if (!btn || !combatState) return;
  const allSet = combatState.commands.every((cmd, i) => {
    const m = gameState.party[i];
    return m.hp <= 0 || cmd !== null;
  });
  btn.disabled = !allSet;
}

document.addEventListener('DOMContentLoaded', () => {
  const resolveBtn = document.getElementById('btn-resolve');
  if (resolveBtn) resolveBtn.addEventListener('click', resolveRound);

  const sheetClose = document.getElementById('btn-sheet-close');
  if (sheetClose) sheetClose.addEventListener('click', closeCommandSheet);
});

function openCommandSheet(charIndex) {
  if (!combatState || !gameState) return;
  _pendingCharIndex = charIndex;
  const m = gameState.party[charIndex];
  const ch = CHARACTERS[charIndex];

  const nameEl = document.getElementById('sheet-char-name');
  if (nameEl) nameEl.textContent = m.name + ': Choose Action';

  const actionsEl = document.getElementById('sheet-actions');
  if (!actionsEl) return;
  actionsEl.innerHTML = '';

  const actions = [];

  // Attack — front row always; back row cannot normally attack
  if (m.row === 'front') {
    actions.push({ action: 'attack', label: 'Attack', desc: `1d20+${m.str} vs DEF. Hit: 1d8+${m.str} damage.` });
  }

  // Spell — if they have relevant class
  const mySpells = SPELLS.filter(s => s.cls === ch.cls);
  const soulActive = gameState.flags.soulFragmentFloor === gameState.floor && gameState.flags.rubyKept !== false;
  mySpells.forEach(spell => {
    const effectiveCost = soulActive ? 0 : spell.cost;
    const canCast = m.mp >= effectiveCost;
    const costLabel = soulActive ? `FREE (Soul Fragment)` : `${effectiveCost} MP`;
    actions.push({
      action: 'spell', label: `Spell: ${spell.name}`,
      desc: `${spell.desc} — ${costLabel} [${m.mp}/${m.maxMp} MP]`,
      spellName: spell.name,
      disabled: !canCast
    });
  });

  // Items — one entry per distinct item in inventory
  const itemCounts = {};
  gameState.inventory.items.forEach(it => { itemCounts[it] = (itemCounts[it] || 0) + 1; });
  Object.entries(itemCounts).forEach(([name, count]) => {
    const def = ITEMS[name];
    if (!def) return;
    let disabled = false;
    if (name === 'Seal Breaker' && !(combatState && combatState.isBoss)) disabled = true;
    if (name === 'Antidote' && !gameState.party.some(p => p.statusEffects.includes('poison'))) disabled = true;
    if (name === 'Elixir'   && !gameState.party.some(p => p.hp <= 0)) disabled = true;
    actions.push({
      action: 'item', label: `${name} ×${count}`,
      desc: def.desc, itemName: name, disabled
    });
  });

  // Special
  const abilityUsed = m.abilitiesUsed.includes('special');
  actions.push({
    action: 'special', label: `Special: ${ch.ability}`,
    desc: ch.abilityDesc,
    disabled: abilityUsed
  });

  // Defend
  actions.push({ action: 'defend', label: 'Defend', desc: 'Take half damage this round.' });

  // Flee
  actions.push({ action: 'flee', label: 'Flee', desc: '50% chance. Fail: enemies get free attacks.' });

  actions.forEach(act => {
    const btn = document.createElement('button');
    btn.className = 'sheet-action-btn';
    if (act.disabled) btn.disabled = true;
    btn.innerHTML = `
      <span>${act.label}</span>
      <span class="sheet-action-desc">${act.desc}</span>
    `;
    btn.addEventListener('click', () => {
      setCommand(charIndex, act);
      closeCommandSheet();
    });
    actionsEl.appendChild(btn);
  });

  const overlay = document.getElementById('sheet-overlay');
  const sheet   = document.getElementById('combat-sheet');
  if (overlay) overlay.classList.add('open');
  if (sheet)   sheet.classList.add('open');
}

function setCommand(charIndex, actionObj) {
  if (!combatState) return;
  combatState.commands[charIndex] = {
    action:    actionObj.action,
    label:     actionObj.label,
    spellName: actionObj.spellName || null,
    itemName:  actionObj.itemName  || null
  };
  renderCommandList();
  updateResolveButton();
}

function closeCommandSheet() {
  const sheet   = document.getElementById('combat-sheet');
  const overlay = document.getElementById('sheet-overlay');
  const charSheet = document.getElementById('char-sheet');
  if (sheet)   sheet.classList.remove('open');
  if (overlay && (!charSheet || !charSheet.classList.contains('open'))) {
    overlay.classList.remove('open');
  }
}

// ── Section 9 — Combat Resolution ────────────────────────────────────────────

function resolveRound() {
  if (!combatState || !gameState) return;
  combatState.phase = 'resolving';
  renderCombatScreen();

  appendCombatLog(`── Round ${combatState.round} ──`);

  // 1. Apply defend buffs
  applyDefendBuffs();

  // 2. Check flee
  const fleeing = combatState.commands.some(c => c && c.action === 'flee');
  if (fleeing) {
    if (Math.random() < 0.5) {
      appendCombatLog('The party flees successfully!');
      endCombat(false, true);
      return;
    } else {
      appendCombatLog('Escape fails! Enemies strike!');
      resolveEnemyActions(true);
      tickStatusEffects();
      renderEnemies();
      renderPartyHUD();
      resetCommandPhase();
      return;
    }
  }

  // 3. Party actions
  resolvePartyActions();

  // 4. Enemy actions (unless all defeated)
  if (combatState.enemies.some(e => e.hp > 0)) {
    resolveEnemyActions(false);
  }

  // 5. Status effects
  tickStatusEffects();

  // Update UI
  renderEnemies();
  renderPartyHUD();

  // 6. Check end conditions
  if (checkCombatEnd()) return;

  // 7. Next round
  resetCommandPhase();
}

function applyDefendBuffs() {
  combatState.commands.forEach((cmd, i) => {
    if (cmd && cmd.action === 'defend') {
      gameState.party[i]._defending = true;
    }
  });
}

function resolvePartyActions() {
  const aliveEnemies = combatState.enemies.filter(e => e.hp > 0);
  if (!aliveEnemies.length) return;

  combatState.commands.forEach((cmd, i) => {
    if (!cmd) return;
    const m = gameState.party[i];
    if (m.hp <= 0) return;

    const target = aliveEnemies.find(e => e.hp > 0);
    if (!target && cmd.action !== 'item' && cmd.action !== 'defend' && cmd.action !== 'flee') return;

    switch (cmd.action) {
      case 'attack': {
        // Physically immune enemies (e.g. Wraiths) cannot be harmed by normal attacks
        if (target.physImmune) {
          appendCombatLog(`${m.name} attacks ${target.name} — no effect! (immune to physical attacks)`);
          break;
        }
        const rawRoll = roll(20);
        const total   = rawRoll + m.str;
        const crit    = rawRoll === 20;
        if (total >= target.def) {
          let dmg = roll(8) + m.str;
          if (crit) dmg *= 2;
          target.hp = Math.max(0, target.hp - dmg);
          appendCombatLog(`${m.name} attacks ${target.name} — rolls ${rawRoll} (total ${total}) — ${crit ? 'CRIT! ' : ''}${dmg} damage!`);
        } else {
          appendCombatLog(`${m.name} attacks ${target.name} — rolls ${rawRoll} — MISS.`);
        }
        break;
      }
      case 'spell': {
        const spell = SPELLS.find(s => s.name === cmd.spellName);
        if (!spell) break;
        const soulFree = gameState.flags.soulFragmentFloor === gameState.floor &&
                         gameState.flags.rubyKept !== false;
        const actualCost = soulFree ? 0 : spell.cost;
        if (m.mp < actualCost) { appendCombatLog(`${m.name} has no MP for ${spell.name}!`); break; }
        m.mp -= actualCost;

        if (spell.effect === 'heal') {
          // Cure Wounds: target lowest-HP living ally
          const alive = gameState.party.filter(p => p.hp > 0);
          const healtarget = alive.reduce((a, b) => b.hp < a.hp ? b : a, m);
          const healed = rollN(spell.dice[0], spell.dice[1]) + (spell.bonus || 0);
          healtarget.hp = Math.min(healtarget.maxHp, healtarget.hp + healed);
          appendCombatLog(`${m.name} casts ${spell.name} — heals ${healtarget.name} for ${healed} HP.`);

        } else if (spell.effect === 'damage') {
          // Flamebolt: standard damage roll, requires to-hit vs DEF
          if (!target) break;
          const rawRoll = roll(20);
          const total   = rawRoll + m.int;
          if (total >= target.def) {
            const dmg = rollN(spell.dice[0], spell.dice[1]);
            target.hp = Math.max(0, target.hp - dmg);
            appendCombatLog(`${m.name} casts ${spell.name} — rolls ${rawRoll} — ${dmg} fire damage to ${target.name}!`);
          } else {
            appendCombatLog(`${m.name} casts ${spell.name} — rolls ${rawRoll} — fizzles against ${target.name}.`);
          }

        } else if (spell.effect === 'pierce') {
          // Bone Spear: ignores DEF, no to-hit roll
          if (!target) break;
          const dmg = rollN(spell.dice[0], spell.dice[1]);
          target.hp = Math.max(0, target.hp - dmg);
          appendCombatLog(`${m.name} casts ${spell.name} — ${dmg} piercing damage (ignores DEF)!`);

        } else if (spell.effect === 'dragon') {
          // Holy Light: 2d8 vs dragon-type, 1d8 vs others; always heals caster 4 HP
          if (!target) break;
          const isDragon = target.type === 'dragon';
          const dmg = isDragon
            ? rollN(spell.dice[0], spell.dice[1])
            : rollN(1, spell.dice[1]);
          target.hp = Math.max(0, target.hp - dmg);
          m.hp = Math.min(m.maxHp, m.hp + (spell.healSelf || 4));
          if (isDragon) {
            appendCombatLog(`${m.name} casts ${spell.name} — ${dmg} radiant damage (EFFECTIVE vs dragon)! Healed 4 HP.`);
          } else {
            appendCombatLog(`${m.name} casts ${spell.name} — ${dmg} radiant damage. Healed 4 HP.`);
          }

        } else if (spell.effect === 'blind') {
          // Shadow Bolt: 1d8 damage + blinds for 2 rounds
          if (!target) break;
          const rawRoll = roll(20);
          const total   = rawRoll + m.int;
          if (total >= target.def) {
            const dmg = rollN(spell.dice[0], spell.dice[1]);
            target.hp = Math.max(0, target.hp - dmg);
            target.status = 'blind';
            target.blindRounds = 2;
            appendCombatLog(`${m.name} casts ${spell.name} — rolls ${rawRoll} — ${dmg} damage, ${target.name} is blinded (2 rounds)!`);
          } else {
            appendCombatLog(`${m.name} casts ${spell.name} — rolls ${rawRoll} — misses ${target.name}.`);
          }

        } else if (spell.effect === 'stun') {
          // Turn Undead: only effective vs undead type
          if (!target) break;
          if (target.type === 'undead') {
            target.status = 'stunned';
            target.stunRounds = 2;
            appendCombatLog(`${m.name} invokes ${spell.name} — ${target.name} is turned! (2 rounds)`);
          } else {
            appendCombatLog(`${m.name} invokes ${spell.name} — ${target.name} is unaffected.`);
          }
        }
        break;
      }
      case 'item': {
        const iname = cmd.itemName || 'Healing Potion';
        const iidx  = gameState.inventory.items.indexOf(iname);
        if (iidx === -1) { appendCombatLog(`${m.name} reaches for ${iname} — it's gone!`); break; }
        gameState.inventory.items.splice(iidx, 1);
        const idef = ITEMS[iname] || { effect: 'heal' };
        switch (idef.effect) {
          case 'heal': {
            const t = gameState.party.filter(p => p.hp > 0).reduce((a, b) => b.hp < a.hp ? b : a, m);
            const hp = rollN(2, 4) + 2;
            t.hp = Math.min(t.maxHp, t.hp + hp);
            appendCombatLog(`${m.name} uses ${iname} — ${t.name} recovers ${hp} HP.`);
            break;
          }
          case 'heal-big': {
            const t = gameState.party.filter(p => p.hp > 0).reduce((a, b) => b.hp < a.hp ? b : a, m);
            const hp = rollN(4, 4) + 4;
            t.hp = Math.min(t.maxHp, t.hp + hp);
            appendCombatLog(`${m.name} uses ${iname} — ${t.name} recovers ${hp} HP.`);
            break;
          }
          case 'mp': {
            const casters = gameState.party.filter(p => p.maxMp > 0 && p.hp > 0);
            if (casters.length) {
              const t = casters.reduce((a, b) => b.mp < a.mp ? b : a);
              t.mp = Math.min(t.maxMp, t.mp + 8);
              appendCombatLog(`${m.name} uses ${iname} — ${t.name} recovers 8 MP.`);
            }
            break;
          }
          case 'mp-big': {
            const casters = gameState.party.filter(p => p.maxMp > 0 && p.hp > 0);
            if (casters.length) {
              const t = casters.reduce((a, b) => b.mp < a.mp ? b : a);
              t.mp = Math.min(t.maxMp, t.mp + 15);
              appendCombatLog(`${m.name} uses ${iname} — ${t.name} recovers 15 MP.`);
            }
            break;
          }
          case 'antidote': {
            const victim = gameState.party.find(p => p.statusEffects.includes('poison'));
            if (victim) {
              victim.statusEffects.splice(victim.statusEffects.indexOf('poison'), 1);
              appendCombatLog(`${m.name} uses Antidote — ${victim.name} cured of poison!`);
            }
            break;
          }
          case 'revive': {
            const fallen = gameState.party.find(p => p.hp <= 0);
            if (fallen) {
              fallen.hp = Math.max(1, Math.floor(fallen.maxHp * 0.5));
              appendCombatLog(`${m.name} uses Elixir — ${fallen.name} revived at ${fallen.hp} HP!`);
            }
            break;
          }
          case 'sealbreak': {
            const e = combatState.enemies.find(e => e.hp > 0 && e.special && e.special !== 'none');
            if (e) {
              e.special = 'none';
              appendCombatLog(`${m.name} uses Seal Breaker — ${e.name}'s special is nullified!`);
            }
            break;
          }
          default:
            appendCombatLog(`${m.name} uses ${iname}.`);
        }
        break;
      }
      case 'special': {
        const ch = CHARACTERS[i];
        m.abilitiesUsed.push('special');
        if (ch.ability === 'Dragonfire Rage') {
          m.hp = Math.max(1, m.hp - 3); // costs 3 HP
          if (target) {
            let dmg = (roll(8) + m.str) * 2;
            target.hp = Math.max(0, target.hp - dmg);
            appendCombatLog(`${m.name} unleashes Dragonfire Rage! ${dmg} damage! (costs 3 HP)`);
          }
        } else if (ch.ability === 'Shadow Strike') {
          if (target) {
            const dmg = (roll(8) + m.str) * 3;
            target.hp = Math.max(0, target.hp - dmg);
            appendCombatLog(`${m.name} executes Shadow Strike — ${dmg} damage! (bypasses DEF)`);
          }
        } else if (ch.ability === 'Celestial Armor') {
          appendCombatLog(`${m.name} activates Celestial Armor — party +3 DEF this round!`);
          gameState.party.forEach(pm => pm._defBonus = (pm._defBonus || 0) + 3);
        } else {
          appendCombatLog(`${m.name} uses ${ch.ability}.`);
        }
        break;
      }
      case 'defend':
        appendCombatLog(`${m.name} takes a defensive stance.`);
        break;
    }
  });
}

function resolveEnemyActions(freeAttack) {
  combatState.enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;
    if (enemy.status === 'stunned') {
      appendCombatLog(`${enemy.name} is stunned and cannot act.`);
      return;
    }
    if (enemy.status === 'blind' && Math.random() < 0.5) {
      appendCombatLog(`${enemy.name} is blinded and swings wide — miss!`);
      return;
    }

    // Boss special attack on even rounds (replaces regular attack)
    if (combatState.isBoss && enemy.special && enemy.special !== 'none' && combatState.round % 2 === 0) {
      resolveBossSpecial(enemy);
      return;
    }

    // Attack front row (indices 0-2), 50% damage to back row (3-6)
    const frontRow = gameState.party.slice(0, 3).filter(m => m.hp > 0);
    const backRow  = gameState.party.slice(3).filter(m => m.hp > 0);

    // Pick a front target if available
    const armorBonus = gameState.flags.dragonscaleMail ? 2 : 0;

    if (frontRow.length > 0) {
      const t = frontRow[Math.floor(Math.random() * frontRow.length)];
      const base = enemy.dmg;
      let dmg = freeAttack ? base : (Math.floor(Math.random() * base) + 1);
      if (t._defending) dmg = Math.ceil(dmg / 2);
      dmg = Math.max(1, dmg - armorBonus - (t._defBonus || 0));
      t.hp = Math.max(0, t.hp - dmg);
      appendCombatLog(`${enemy.name} attacks ${t.name} — ${dmg} damage!`);
    } else if (backRow.length > 0) {
      // Back row takes 50% damage
      const t = backRow[Math.floor(Math.random() * backRow.length)];
      let dmg = Math.ceil((Math.floor(Math.random() * enemy.dmg) + 1) / 2);
      if (t._defending) dmg = Math.ceil(dmg / 2);
      dmg = Math.max(1, dmg - armorBonus - (t._defBonus || 0));
      t.hp = Math.max(0, t.hp - dmg);
      appendCombatLog(`${enemy.name} strikes ${t.name} (back row) — ${dmg} damage!`);
    }
  });
}

function tickStatusEffects() {
  gameState.party.forEach(m => {
    if (m.hp <= 0) return;
    // Poison: 3 dmg per round, counters tracked
    const poisonIdx = m.statusEffects.indexOf('poison');
    if (poisonIdx !== -1) {
      m.hp = Math.max(0, m.hp - 3);
      appendCombatLog(`${m.name} takes 3 poison damage.`);
      // Remove after 3 rounds (simplified: 33% chance each tick)
      if (Math.random() < 0.33) m.statusEffects.splice(poisonIdx, 1);
    }
  });
}

function checkCombatEnd() {
  // Xarrath scripted retreat — after 2 rounds (or if he's downed)
  if (combatState.isXarrath) {
    const xDown = combatState.enemies.every(e => e.hp <= 0);
    if (xDown || combatState.round >= 2) {
      xarrathRetreat();
      return true;
    }
  }

  // Victory
  const allEnemiesDead = combatState.enemies.every(e => e.hp <= 0);
  if (allEnemiesDead) {
    if (combatState.isBoss) {
      endBossFight(combatState.bossFloor);
    } else {
      // Regular enemy loot drops
      const goldDrop = roll(6) * 5;
      gameState.inventory.gold += goldDrop;
      appendCombatLog(`Victory! +${goldDrop} gold.`);

      // 25% item drop
      if (Math.random() < 0.25) {
        const dropTable = [
          'Healing Potion','Healing Potion',
          'Mana Crystal',
          'Antidote',
          'Gold'
        ];
        const drop = dropTable[Math.floor(Math.random() * dropTable.length)];
        if (drop === 'Gold') {
          const bonus = roll(6) * 5;
          gameState.inventory.gold += bonus;
          appendCombatLog(`Found ${bonus} gold!`);
        } else {
          gameState.inventory.items.push(drop);
          appendCombatLog(`Found a ${drop}!`);
        }
      }

      endCombat(true, false);
    }
    return true;
  }

  // Defeat
  const allPartyDown = gameState.party.every(m => m.hp <= 0);
  if (allPartyDown) {
    appendCombatLog('The party has fallen. The dungeon claims you...');
    setTimeout(() => {
      _inCombat = false;
      combatState = null;
      alert('Your party has been defeated. The darkness swallows you whole.\n\nRefresh to try again.');
      clearToken();
      showScreen('login');
    }, 1500);
    return true;
  }

  return false;
}

function endCombat(victory, fled) {
  // Clean up temp combat flags
  gameState.party.forEach(m => {
    delete m._defending;
    delete m._defBonus;
  });

  _inCombat = false;
  combatState = null;
  autoSave();

  setTimeout(() => {
    showScreen('dungeon');
    renderDungeon();
    renderPartyHUD();
    if (victory) logMsg('Victory! You stand amidst the fallen.');
    else if (fled) logMsg('You retreat into the shadows.');
  }, 800);
}

function resetCommandPhase() {
  if (!combatState) return;
  combatState.round++;
  combatState.phase = 'command';
  combatState.commands = new Array(7).fill(null);
  // Clear defend flags
  gameState.party.forEach(m => {
    delete m._defending;
    delete m._defBonus;
  });
  // Decrement stun and blind durations
  combatState.enemies.forEach(e => {
    if (e.status === 'stunned') {
      e.stunRounds = (e.stunRounds || 1) - 1;
      if (e.stunRounds <= 0) { e.status = null; e.stunRounds = 0; }
    }
    if (e.status === 'blind') {
      e.blindRounds = (e.blindRounds || 1) - 1;
      if (e.blindRounds <= 0) { e.status = null; e.blindRounds = 0; }
    }
  });
  renderCombatScreen();
}

function appendCombatLog(line) {
  const log = document.getElementById('combat-log');
  if (!log) return;
  const p = document.createElement('p');
  p.textContent = line;
  log.insertBefore(p, log.firstChild);
  // Cap at 20 lines
  while (log.children.length > 20) log.removeChild(log.lastChild);
}

// ── Section 10 — Mini-Boss & Xarrath Encounters ───────────────────────────────

function startBossFight(floor) {
  const bossDef = BOSSES[floor];
  if (!bossDef) return;
  const boss = JSON.parse(JSON.stringify(bossDef));
  _inCombat = true;
  combatState = {
    enemies:   [boss],
    round:     1,
    commands:  new Array(7).fill(null),
    phase:     'command',
    log:       [],
    isBoss:    true,
    bossFloor: floor
  };
  showScreen('combat');
  renderCombatScreen();
  appendCombatLog(`⚔ FLOOR ${floor} GUARDIAN`);
  appendCombatLog(bossDef.intro);
}

function startXarrathFight(floor) {
  const xDef = XARRATH_DATA[floor];
  if (!xDef) return;
  const xarrath = {
    name: 'Xarrath the Hunter',
    hp: xDef.hp, maxHp: xDef.hp,
    def: xDef.def, dmg: xDef.dmg,
    type: 'humanoid'
  };
  _inCombat = true;
  combatState = {
    enemies:      [xarrath],
    round:        1,
    commands:     new Array(7).fill(null),
    phase:        'command',
    log:          [],
    isXarrath:    true,
    xarrathFloor: floor
  };
  showScreen('combat');
  renderCombatScreen();
  appendCombatLog(`⚔ SCRIPTED ENCOUNTER — FLOOR ${floor}`);
  appendCombatLog(xDef.intro);
}

function xarrathRetreat() {
  const floor  = combatState.xarrathFloor;
  const xDef   = XARRATH_DATA[floor];
  const flagKey = floor === 2 ? 'xarrathMet' : 'xarrathMet2';
  gameState.flags[flagKey] = true;
  appendCombatLog(xDef.outro);
  gameState.party.forEach(m => { delete m._defending; delete m._defBonus; });
  _inCombat = false;
  combatState = null;
  autoSave();
  setTimeout(() => {
    showScreen('dungeon');
    renderDungeon();
    renderPartyHUD();
    logMsg('Xarrath vanishes into shadow. The corridor is clear.');
  }, 1200);
}

function endBossFight(floor) {
  const bossDef = BOSSES[floor];
  if (!gameState.bossesDefeated.includes(bossDef.id)) {
    gameState.bossesDefeated.push(bossDef.id);
  }

  // Gold: 3d6 × 10
  const goldDrop = rollN(3, 6) * 10;
  gameState.inventory.gold += goldDrop;
  appendCombatLog(`${bossDef.name} falls! +${goldDrop} gold!`);

  // Guaranteed item from loot table
  const lootTable = ['Hi-Potion', 'Mana Crystal', 'Antidote', 'Elixir'];
  const item = lootTable[Math.floor(Math.random() * lootTable.length)];
  gameState.inventory.items.push(item);
  appendCombatLog(`Spoils of battle: ${item}!`);

  // Seal gemstone
  const SEAL_BY_FLOOR = { 1: 'ruby', 2: 'sapphire', 3: 'topaz', 4: 'diamond', 5: 'emerald' };
  const seal = SEAL_BY_FLOOR[floor];
  if (seal && !gameState.seals.includes(seal)) {
    gameState.seals.push(seal);
    appendCombatLog(`★ Seal Gemstone recovered: ${seal.toUpperCase()}!`);
    // Dave's Soul Fragment: all spells cost 0 MP for the rest of this floor
    // (unless Sprinkles sold the ruby, which severs Dave's connection)
    if (gameState.flags.rubyKept !== false) {
      gameState.flags.soulFragmentFloor = floor;
      appendCombatLog(`✦ Dave's Soul Fragment pulses — all spells cost 0 MP this floor!`);
    }
  }

  gameState.party.forEach(m => { delete m._defending; delete m._defBonus; });
  _inCombat = false;
  combatState = null;
  autoSave();
  setTimeout(() => {
    showScreen('dungeon');
    renderDungeon();
    renderPartyHUD();
    logMsg(`${bossDef.name} is vanquished. The path ahead is open.`);
  }, 1200);
}

function resolveBossSpecial(enemy) {
  const frontRow = gameState.party.slice(0, 3).filter(m => m.hp > 0);
  const alive    = gameState.party.filter(m => m.hp > 0);
  switch (enemy.special) {
    case 'lightning': {
      // Hits up to 3 targets for 4 DMG each (front row priority, then back)
      const targets = alive.slice(0, 3);
      targets.forEach(t => {
        let dmg = 4;
        if (t._defending) dmg = Math.ceil(dmg / 2);
        t.hp = Math.max(0, t.hp - dmg);
      });
      appendCombatLog(`${enemy.name} unleashes Lightning Breath — ${targets.map(t => t.name).join(', ')} each take 4 damage!`);
      break;
    }
    case 'cold': {
      alive.forEach(m => {
        if (!m.statusEffects.includes('slowed')) m.statusEffects.push('slowed');
      });
      appendCombatLog(`${enemy.name} exhales Cold Breath — entire party is Slowed!`);
      break;
    }
    case 'poison': {
      frontRow.forEach(m => {
        if (!m.statusEffects.includes('poison')) m.statusEffects.push('poison');
      });
      appendCombatLog(`${enemy.name} sprays Poison Breath — front row is poisoned!`);
      break;
    }
    case 'acid': {
      frontRow.forEach(m => {
        if (!m.statusEffects.includes('corroded')) m.statusEffects.push('corroded');
      });
      appendCombatLog(`${enemy.name} breathes Acid — front row is corroded (permanent -2 DEF)!`);
      break;
    }
    default:
      appendCombatLog(`${enemy.name} uses its special ability!`);
  }
}

// ── Section 11 — Story Cards & Floor Transitions ──────────────────────────────

let _pendingStoryCallback = null;

function showStoryCard(key, onContinue) {
  const card = STORY_CARDS[key];
  if (!card) { if (onContinue) onContinue(); return; }

  _pendingStoryCallback = onContinue || null;

  const labelEl = document.getElementById('story-floor-label');
  const bodyEl  = document.getElementById('story-body');
  if (labelEl) labelEl.textContent = card.label;
  if (bodyEl)  bodyEl.innerHTML = card.text;

  showScreen('story');
}

document.addEventListener('DOMContentLoaded', () => {
  const continueBtn = document.getElementById('btn-story-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (_pendingStoryCallback) {
        const cb = _pendingStoryCallback;
        _pendingStoryCallback = null;
        cb();
      } else {
        showScreen('dungeon');
        renderDungeon();
        renderPartyHUD();
      }
    });
  }
});

// ── Section 12 — Merchant ─────────────────────────────────────────────────────

function openMerchant() {
  const stock = MERCHANT_STOCK[gameState.floor];
  if (!stock) {
    logMsg('The alcove is empty.');
    return;
  }
  renderMerchantSheet();
  document.getElementById('merchant-overlay').classList.add('open');
  document.getElementById('merchant-sheet').classList.add('open');
}

function closeMerchant() {
  document.getElementById('merchant-overlay').classList.remove('open');
  document.getElementById('merchant-sheet').classList.remove('open');
}

function renderMerchantSheet() {
  const stock = MERCHANT_STOCK[gameState.floor];
  const goldEl = document.getElementById('merchant-gold');
  if (goldEl) goldEl.textContent = gameState.inventory.gold + ' gp';

  const list = document.getElementById('merchant-items');
  if (!list || !stock) return;
  list.innerHTML = '';

  stock.forEach(name => {
    const def = ITEMS[name];
    if (!def) return;

    const canAfford = gameState.inventory.gold >= def.cost;
    const alreadyHas =
      (name === 'Dragonscale Mail' && gameState.flags.dragonscaleMail) ||
      (name === 'Torch Bundle'     && gameState.flags.torchActive);

    const btn = document.createElement('button');
    btn.className = 'sheet-action-btn merchant-item-btn';
    if (!canAfford || alreadyHas) btn.disabled = true;

    btn.innerHTML = `
      <span class="merchant-item-name">${name}</span>
      <span class="merchant-item-price">${def.cost} gp</span>
      <span class="sheet-action-desc">${def.desc}${alreadyHas ? ' — already owned' : ''}</span>
    `;
    btn.addEventListener('click', () => buyItem(name));
    list.appendChild(btn);
  });
}

function buyItem(name) {
  const def = ITEMS[name];
  if (!def || gameState.inventory.gold < def.cost) return;

  gameState.inventory.gold -= def.cost;

  switch (def.effect) {
    case 'armor':
      gameState.flags.dragonscaleMail = true;
      logMsg('Dragonscale Mail equipped — party gains +2 DEF.');
      break;
    case 'torch':
      gameState.flags.torchActive = true;
      logMsg('Torch Bundle lit — view distance restored on Floor 5.');
      break;
    default:
      gameState.inventory.items.push(name);
      logMsg(`Purchased: ${name}.`);
  }

  renderMerchantSheet();
  renderPartyHUD();
  autoSave();
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('btn-merchant-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMerchant);

  const overlay = document.getElementById('merchant-overlay');
  if (overlay) overlay.addEventListener('click', closeMerchant);
});

// ── Section 13 — Auto-Save ────────────────────────────────────────────────────

let _saveTimer = null;

function autoSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(_doSave, 300);
}

async function _doSave() {
  if (!gameState) return;
  const token = localStorage.getItem('toi_token');
  if (!token) return;
  try {
    await fetch('/api/save', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ gameState })
    });
  } catch (e) {
    // Silent fail — non-critical
  }
}

// Save on tab hide
document.addEventListener('visibilitychange', () => {
  if (document.hidden && gameState) autoSave();
});
