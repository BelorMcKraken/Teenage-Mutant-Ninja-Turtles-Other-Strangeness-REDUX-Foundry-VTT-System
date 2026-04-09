# Teenage-Mutant-Ninja-Turtles-Other-Strangeness-REDUX-Foundry-VTT-System

UPDATE 4/8/2026

# TMNTOS Redux — Foundry VTT System

**Teenage Mutant Ninja Turtles & Other Strangeness** for Foundry VTT v12 / v14

A complete, faithful implementation of the Palladium Books classic tabletop RPG system, built from the ground up for modern Foundry VTT. Whether you're playing as lean green fighting machines or any of the hundreds of possible mutant animals, TMNTOS Redux has everything you need to run a full campaign.

---

## Installation

**Foundry VTT "Install System" (recommended)**

Paste the manifest URL into Foundry's Setup → Game Systems → Install System dialog:

```
https://raw.githubusercontent.com/BelorMcKraken/Teenage-Mutant-Ninja-Turtles-Other-Strangeness-REDUX-Foundry-VTT-System/main/system.json
```

**Manual installation**

Download the latest `tmntos.zip` from the [Releases](https://github.com/BelorMcKraken/Teenage-Mutant-Ninja-Turtles-Other-Strangeness-REDUX-Foundry-VTT-System/releases/latest) page and extract it into your Foundry `Data/systems/` folder.

**Compatibility**

| Foundry Version | Status |
|---|---|
| v14 | ✅ Verified |
| v12 | ✅ Supported |
| v11 and below | ❌ Not supported |

---

## Features

### Character Sheet — 7 Tabs

The character sheet is the heart of the system. Every major section is organized into a clean tabbed layout styled with the CCWildWords comic font and a green TMNT-inspired theme.

#### Core Tab
- **Portrait** with click-to-change artwork
- **Identity fields** — animal, alignment, age, gender, height, weight, size (displayed from Bio-E tab), XP, level
- **Eight attributes** — IQ, ME, MA, PS, PP, PE, PB, Speed — all editable, starting at 0 for new characters
- **Attribute bonus display** — automatically shows bonuses at 16+ for all eight attributes based on the Palladium bonus table
- **Singleton drop zones** for five key character-defining items, in this order:
  - **Animal** — drag from TMNTOS Animals compendium; auto-populates Bio-E, size, and abilities
  - **Origin** — drag from Mutant Animal Origins, Contemporary Origins, Cross Dimensional Origins, or Time Travel Origins compendiums (one per character)
  - **Creator / Background** — drag from Creator Organizations or Experimental Backgrounds compendiums
  - **Education** — drag from Wild Animal Education compendium
  - **Alignment** — drag from TMNTOS Alignments compendium
- Each drop zone replaces its previous entry when a new item is dropped

#### Skills Tab
- Two-column layout: **Professional Skills** and **Amateur Skills**
- Each skill displays name, category, attribute, base %, per-level bonus, and current total %
- Skill totals **auto-scale with level** — when you change the character's level, all non-physical skills recalculate automatically
- Physical skills (Running, Gymnastics, etc.) display with "—" and no roll button since they grant passive bonuses
- Non-physical skills show a **Roll** button that posts a d% roll to chat

#### Combat Tab
- **Combat Training** — drag from TMNTOS or TMNTTA Combat Training compendiums; bonuses apply automatically at every level
- **Weapon Proficiencies** — drag WP skills directly onto the combat tab
- **Armor and Shield** equip slots with current SDC tracking
- **Weapon list** with roll buttons for attack and damage
- **Actions and Reactions** checkboxes — unlocked automatically as combat training levels are gained
- **Initiative, Strike, Parry, Dodge** roll buttons with full bonus breakdowns in chat cards
- **Critical range** displayed and tracked per combat training progression

#### Bio-E / Mutate Tab
- **Animal info panel** showing build, original size level, starting Bio-E, length/weight, mutant changes text, and attribute bonuses
- **Size Level control** — + and − buttons adjust size from the animal's original level; each step costs 5 Bio-E
- **Size attribute effects panel** — shows IQ, PS, PE, Speed, SDC, and Bio-E bonuses/penalties for the current size level (color-coded green/red)
- **Animal Abilities checklist** — all abilities from the selected animal, with Bio-E cost; check to purchase
- **Natural Weapons checklist** — all natural weapons from the selected animal, with Bio-E cost; check to purchase
- **Human Features** — Biped, Hands, Speech, Looks; each has None (0), Partial (5), Full (10) options
- **Bio-E Totals** panel showing Starting Bio-E, Size Adjustment, Abilities, Natural Weapons, Human Features, and Remaining Bio-E in real time

#### Psionics / Spells / Strangeness Tab
- Powers and spells display with name, roll, save, range, duration, and effect
- Stats panel for Spells per Day, Spell Combat, Spell Strength, Save vs Spell/Circle/Psionics/Strangeness

#### Inventory Tab
- Gear and equipment list

#### Notes Tab
- Four ProseMirror rich-text editors: General, Combat, Equipment, Mutant Build

---

### NPC Sheet
- Streamlined two-tab sheet (Combat / Notes) for fast GM play
- Supports all the same drag-drop items as the character sheet
- Full chat card rolls for Initiative, Strike, Parry, Dodge, Attack, and Damage
- Animal drop populates Bio-E and mutation data identically to the character sheet

---

### Chat Cards & Damage System
All dice rolls post to chat with themed TMNT-style cards showing the actor's portrait, roll type, bonus breakdown, and natural 20 / natural 1 callouts.

**Damage rolls include two Apply buttons:**
- **Apply to SDC** — applies damage through layered SDC pools in order: Shield SDC → Armor SDC → Actor SDC → HP overflow. Any damage that punches through all SDC layers automatically overflows into HP.
- **Apply to HP** — applies damage directly to HP, bypassing SDC.

**Targeting:** The Apply buttons affect whichever token(s) are currently selected on the canvas. Select your target token first, then click Apply. If no token is selected, damage falls back to the attacker. Multiple selected tokens all take the full damage individually.

After applying, a **Damage Result card** posts to chat showing exactly which layer absorbed damage, the before/after values for each pool, and the amount absorbed — so the table always knows what happened.

---

### Vehicle Actor
A dedicated vehicle sheet with portrait, SDC tracker, and fields for:
- Device name and category (Time Machine / Dimension Device)
- Top speed, range, crew, passengers, cargo
- Cost, weight, area of effect, recharge time
- Malfunction text, Portable and Vehicle-Mountable checkboxes
- Notes field

---

### Time Machine Actor
A full time machine sheet with three drag-and-drop device zones:
- **Installed Time Device** — drag from TMNTTA Time Devices compendium
- **Temporal Support Devices** — drag from TMNTTA Temporal Support Devices compendium
- **Installation Cost Records** — drag from TMNTTA Install Costs compendium

Each dropped device is recorded as a data entry (not an owned item), showing name, details, and cost. Entries can be removed individually with the ✕ button.

---

## Compendium Library

The system ships with **26 compendiums** organized into two sidebar folders.

### TMNTOS Folder (16 compendiums)
| Compendium | Entries | Notes |
|---|---|---|
| Alignments | 7 | All Palladium alignment types |
| Amateur Skills | 74 | Full amateur skill list |
| Animal Abilities | 68 | All purchasable animal abilities |
| Animals | 110 | Full animal roster with Bio-E, abilities, natural weapons, and attribute bonuses |
| Armor | 33 | Ancient, modern, and TMNTTA period costumes / libraries / currency |
| Combat Training | 6 | Basic, Expert, Martial Arts, Ninjutsu, Assassin, Feral — full 15-level progressions |
| Creator Organizations | 9 | Roll table for deliberate experimentation origins |
| Gear | 90 | General equipment |
| Mutant Animal Origins | 3 | Random Mutation, Accidental Encounter, Deliberate Experimentation |
| Natural Weapons | 79 | All animal natural weapon types |
| Professional Skills | 120 | Full professional skill list |
| Psionics | 59 | All psionic powers organized by category folder |
| Shields | 9 | Small/Medium/Large × Wood&Leather/Polycarbonate/Metal Ballistic |
| Vehicles | 43 | Landcraft, Watercraft, Aircraft (Actor type with full stats) |
| Weapons | 99 | Full weapon list |
| Wild Animal Education | 4 | Education background options |

### TMNTTA Folder (10 compendiums)
| Compendium | Entries | Notes |
|---|---|---|
| Combat Training | 2 | Wizard and Time Lord — full 15-level progressions |
| Contemporary Origins | 10 | Standard mutant through experimental test animal |
| Cross Dimensional Origins | 5 | Accidental visitor through inventor of transit machine |
| Experimental Backgrounds | 4 | Adopted, Indoctrinated, Caged, Escaped |
| Install Costs | 30 | Vehicle-specific installation costs for time/dimension devices |
| Temporal Support Devices | 6 | ARD, TE Feelie, Q-Dump, DCD, Triple-D, Signal Beacon |
| Time Devices | 6 | Time Projector, Temporal Gate, Portable Time Machine, and more |
| Time Spells | 11 | Temporal Barrier through Time Warp (watch icon) |
| Time Travel Origins | 6 | Origin roll table for TMNTTA characters |
| Wizard Spells | 49 | Full wizard spell list (Anti-Magic Cloud through Words of Truth) |

---

## Styling & Fonts

The system uses **CCWildWords Roman** — the same comic lettering font used in the original TMNT comics — applied system-wide including all sheets, chat cards, and journal entries. Both new and existing journal entries automatically use the font without any changes needed to journal documents.

The theme uses a dark green header palette (`#234d2f`) with tan/parchment content areas and color-coded red/green stat displays on the Bio-E tab.

---

## Known Limitations & Notes

- **Armor and Shield SDC** is tracked via the `sdcValue` field on equipped items, which ticks down as damage is absorbed. When an item's SDC reaches 0 it is effectively destroyed and provides no further protection. Reset the value manually to repair.
- **Attribute bonuses** (16+) are displayed as reference only — they must be applied manually to the bonus fields on the Core tab since Palladium bonuses are situational.
- **Size level attribute effects** are displayed as reference only and must be applied manually, as the Palladium rules require GM interpretation for some effects.
- The **Airship** actor type is a placeholder for future development.

---

## Credits

**System Design & Development:** Belor McKraken

Based on *Teenage Mutant Ninja Turtles & Other Strangeness* by Kevin Eastman and Peter Laird, published by Palladium Books. This is a fan-made Foundry VTT implementation and is not affiliated with or endorsed by Palladium Books or Viacom/Nickelodeon. All game content references are used for compatibility purposes under fair use.

**Font:** CCWildWords by Comicraft — used with appreciation for its TMNT heritage.

---

## License

This Foundry VTT system implementation is released under the [MIT License](LICENSE). Game rules, setting content, and intellectual property remain the property of their respective owners.




---


PUSH UPDATE 3/21/2026

Compendiums loaded with basic information. There is no descriptions of items with the exception of basic stats for weapons, shields, and armor. This would include things like damage dice and SDC rating of armor and cost of items.

- Weapons
- Armor
- gear
- vehicles
- skills
- animals
- psionics
- spells

Character sheet is updated into a 4 tab system

Chat cards for rolling with weapons added.

Still very much a work in progress but looking better :)



ORIGINAL PUSH 3/14/2026

This is a system for Foundry VTT to run the Teenage Mutant Ninja Turtles &amp; Other Strangeness Redux system complete with Ooze dice!

Ooze dice are not currently included in this version.

this is a v1 version that "technically" does load but still has a long way to go.

As of right now the character sheet loads and saves information. Very much in an alpha stage.
