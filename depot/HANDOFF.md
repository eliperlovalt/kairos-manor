# Parts Depot v20: a plan for every room (Nov 13, 2026)

From KAIROS XI.1, the Depot side chat, to the Estate chat for v1.20. The full hand-off is the doc "Depot v20 to the Estate chat". This is the short form that travels with the files.

**New files:** `rooms20.json` (157 plans to the v1.19 register, 25 typed plans for the rooms the wall moves make, winter dress for each), `roomplan.js` (the planner itself: `ROOMPLAN.plan(row,{type})`, so the Estate can plan again from its own v20 register), `props6.js` (15 new parts).
**Changed:** `ornament.js` and `contours.js` (the slim glazing cross on every window; the balcony door case; version 20), `contourspecs.js` (the two balcony doors, for the Depot's preview only), `index.html` (the Rooms view shows rooms20.json, with a winter switch).
**Kept, untouched:** `rooms.json`, `plans8.json` and everything else. The household still reads plans8.json.

**Load order:** props.js ... props5.js, **props6.js**, **roomplan.js** (needs nothing), then as before.

**rooms20.json:** `{version, against, convention, rooms:[157], typed:[25]}`. A plan: `key` ("building / storey / name", with " #n" where a name repeats), `id`, `name`, `building`, `storey`, `type`, `variant`, `box`, `y`, `w`, `d`, `ceiling`, `doors`, `windows`, `holes`, `fire`, `focal`, `items` (`k,o,x,y,z,r,on`), `runs`, `art` (the wall art by rule: `{i,k,wall,centred,lower}`), `winter` (extra items for the winter dress), `notes`, `audit`. Local blocks, as plans8.json.

**Hero trees and the spring (added the same day):** `trees.js` v2 adds greatOak, greatCedar, greatBeech (`TREES.HERO`), cherry, chestnut and beech; the first five species grow as before, seed for seed. `seasons.js` v2 adds bud, blossomEarly, candles, petals, spring and bulbs to `state()`, and a brighter spring in `restyle()` and the grass. `flowers.js` v2 adds snowdrop, crocus, daffodil, primrose and bluebell, the layouts drift, carpet and spring, and `FLOWERS.inBloom(st)`. `treeview.js` and `flowerview.js` show them.

**Contours:** `CONTOURS.dress(spec,{glaze:false})` or `CONTOURS.STYLES[k].glaze=false` leaves the cross off. A row marked `door` at the balcony storey gets the balcony door case and two glazed leaves. Hall 74,422 near (was 72,358), the rest 62,796 near (was 57,376), far 23,998.

---

# Parts Depot v15: the contours (Nov 12, 2026)

From KAIROS XI.1, the Depot side chat. His Grace walked Estate v1.14 and asked what happened to the contours of the building. There never were any. This kit gives every building its outside: plinth, string courses, pilasters, a surround on every window, door cases, cornice, parapet, tower tops, the dome's ribs, the skyline. Drop-in; nothing touches the Estate's files.

**What is new in v15:** `ornament.js` (the pieces), `contours.js` (the layout, one call per building). For the Depot only: `contourspecs.js` (a copy of your building specs) and `contourview.js` (the Contours tab).

**Load order:** props.js, props2, props3, props4, props5, floors, sets, livery, seasons, trees, flowers, water, animals, fire, sound, manor, use, household, hands, chores, **ornament, contours**. Both need trees.js before them (they mesh with `TREES.mesh`).

## His Grace's taste (quiz, Nov 12, 2026)

- Stonework: **ornate, Highclere-like**. Window heads: **alternating** triangle and curve on the state floor, plainer hoods above. Trim: **darker** than the wall. Balconies: **the whole second storey** of the south front.
- He was shown three directions for the south front and chose **A, "Pinnacles"**: a pilaster on every pier, three orders stacked, a crested parapet, an obelisk over every bay.

## The whole integration

```js
// once per building, at load or when the list of openings changes
const hall = CONTOURS.dress(BLD[hallId], {
  style: 'hall',
  openings: WINDOWS,                      // your windows.json rows; leave out and the v1.14 wall rule is replayed
  neighbours: [BLD[stateId], BLD[serviceId]],
  existing: [ {x0:-26.5,z0:30.5,x1:26.5,z1:42.5,y1:7.5},     // south terrace
              {x0:-14.5,z0:-78.5,x1:14.5,z1:-66.5,y1:7.5} ]  // north terrace
});
const skin = CONTOURS.object(THREE, hall, { material: PMAT() });   // a Group
scene.add(skin);
skin.update(camera.position);             // when the eye moves: swaps near and far per piece (far beyond 115 blocks)
```

- `spec` is **your own `building()` spec, as it stands**: `levels`, `boxes` (x0, z0, x1, z1, roofY, roof, yb, ov, winEvery, winW, winRows, only, glassWalls), `doors`. Nothing is translated. Colours and rooms in it are ignored.
- **Styles:** `hall`, `state`, `service`, `chapel`, `glass`, `stable`, `gate`, `lodge`, `farm`, and the village kinds `cottage`, `bakery`, `shop`, `smithy`, `school`, `inn`, `church`.
- **The real list.** `openings` takes rows in either shape: `{box, side:'N'|'S'|'E'|'W', a0, a1, y0, y1, door}` (world blocks along the wall, edges not centres) or `{x, y, z, facing, w, h, door}` (x and z the centre of the opening on the wall line, y the lowest pane cell). Both give the same skin as the replayed rule; tested.
- **`dress` returns** `{pieces, tris, quads, faces, solids, cross, pruned, blind}`.
  - `pieces`: `[{id, centre, min, max, near, far}]`, none more than 64 blocks across. `near` and `far` are `{pos, col, nor, index, quads}` in world space.
  - `faces`: `[{box, side, o, f, n, L, depth}]`. `depth` is one number per wall cell (index `floor(u) + floor(v) * ceil(L)`, u along the wall from `o`, v up): how far the skin stands out there in blocks, 0 where the wall is bare. Use it for collision. vines.js will use it in v17 as `cover`.
  - `solids`: the ground pieces to make solid (below).
  - `cross`: cells in front of a pane. Always 0: the kit takes out any cell within 2 blocks in front of an opening and then proves it.
- **`CONTOURS.object`** tags every mesh `userData.k='contour'`, `userData.o={building, piece, lod}`. Geometry is shared by every object made from the same dressed building.
- **Colours** are baked into vertex colours as sRGB numbers, exactly as trees.js and flowers.js do. Treat them the same way. (The Depot's Contours tab converts them to linear to show true colour.)
- **Village houses:** dress each kind once, in its own blocks, and place it with your quarter turn.

```js
const kind = CONTOURS.dress(CONTOURS.village('cottage'), { style: 'cottage' });
const g = CONTOURS.object(THREE, kind, { material: PMAT() });
g.matrixAutoUpdate = false; g.matrix.copy(CONTOURS.houseMatrix(THREE, h.x0, h.z0, W, D, q)); scene.add(g);   // x0, z0, q as vbuild has them
```

## What you must do when you fit it

1. **Remove the window bars and sills** (`buildWindowDetail`) on every building you dress. The surrounds replace them. That returns about 190,000 triangles.
2. **Remove the old south porch** (the paired square columns at x -10, -9, 9, 10 and the canopy at y 18). The new portico stands in the same footprint.
3. **Make the solids solid** (list below), and use `faces[].depth` for anything that walks close to a wall.
4. **Flat-roof merlons** (the one-block teeth every 2 blocks) are swallowed by the parapet base. Leave them or remove them. The tower corner posts with their gold caps, and the State Wing's gold finials every 8 blocks, are swallowed by obelisk pedestals in the same way.
5. **Pass the real list** as soon as it exists. The replayed rule is Estate v1.14's. I did not re-read your newer build.

## Every building, and what it costs (triangles)

| Building | Style | Near | Far | Pieces |
|---|---|---|---|---|
| Euphrates Hall | Pinnacles: rusticated base, three stacked orders, balcony on the south, crested parapet with an obelisk on every pier, strapwork cresting over the door, portico, four tower caps, lantern, drum ring, eight ribs and a crown on the dome | 72,358 | 11,948 | 9 |
| The State Wing | Giant pilasters across the tall state windows, alternating pediments, rusticated base, crested parapet, obelisks every 8 | 14,116 | 2,200 | 2 |
| The Service Wing | Plain: plinth, string, slim cornice, quoins, solid parapet, corner obelisks | 4,348 | 366 | 2 |
| The Chapel | Gothic: buttresses between the lancets, pointed hoods, corbel table, stepped gable coping, a cross | 3,938 | 1,142 | 1 |
| The Glasshouse | Stone base wall, corner posts, door cases, iron ridge cresting and finials. The glass is untouched | 1,524 | 352 | 1 |
| The Stable Court | Stone on brick: lintels with keystones, arched cases on the carriage doors, stepped copings, a clock turret on the ridge | 7,558 | 2,362 | 3 |
| The Gatehouse | Plinth, string, cornice, crested parapet, corner obelisks, an arch over the drive | 4,540 | 1,034 | 1 |
| The Lodge | Quoins, keystone windows, eaves course, door hood, ridge finials | 1,394 | 168 | 1 |
| The Home Farm and Woodyard | White boards on red: lintels and sills, corner boards, door frames, ridge finials | 1,342 | 374 | 2 |
| Cottage (20 stand) | Plinth, corner boards, sill bands, door hood, ridge finials | 516 | 112 | 1 |
| Bakery (2) | The same, with a hanging sign | 562 | 112 | 1 |
| Shop (2) | The same, with a shop fascia | 496 | 112 | 1 |
| Smithy (2) | The same, with a heavy lintel and a sign | 466 | 112 | 1 |
| School (2) | The same, with a bell-cote | 496 | 124 | 1 |
| Inn (2) | The same, with a porch and a sign | 594 | 112 | 1 |
| Village church (2) | Buttresses, sill band, bell-cote, a cross | 1,534 | 324 | 1 |

**Against the budgets:**

- The hall, near: **72,358 of 120,000**. With the window bars gone that is a net saving of about 118,000 triangles on the lawn view.
- Every other building, near: 38,760, plus the 32 village houses at 18,616: **57,376 of 60,000**.
- Far, the whole estate: **23,978 of 25,000**.
- An ordinary window surround is 17 to 27 quads near (ceiling 30) and nothing far (ceiling 4). The pedimented state-floor surround is 39. There are about a hundred of those on the hall, not a handful, so it breaks the per-piece ceiling; the whole-building budget, which the primer says wins, holds with room to spare.
- Nothing stands more than 2 blocks out from a wall face, except the portico, the tower tops, the dome and the stable turret.

**Time to dress** (desktop Chrome, headless): the hall 2.7 seconds, the State Wing and the Stable Court 0.6 each, the Service Wing 0.3, everything else under 0.2, a village kind under 0.1. About 5 seconds for the whole estate. Not timed on a phone. Dress one building per idle slice, or once and keep the arrays.

## Blank bays

About one pane in eight is blind and you will remove many. Where the rhythm of a front expects a window and the list has none, the kit dresses the bay as blind: the same frame as its neighbours round a sunk panel, and on a state floor an arched niche. Tested by removing one window in four: the hall dressed 102 blank bays, the State Wing 24, with no change to the design and no pane crossed. Try it with the "Blank bay test" button.

## Ground pieces to make solid

- **The hall's portico:** six stone piers, each 1.5 blocks square, from the terrace (y 7.5) to y 16. Front row at z 38.5 to 40: x -10.5 to -9, -5.75 to -4.25, 4.25 to 5.75, 9 to 10.5. Side piers at z 34.75 to 36.25: x -10.5 to -9 and 9 to 10.5. The way to the door between the middle piers is 8.5 blocks clear.
- **The Chapel and each village church:** every buttress, 1 block wide and 1 block out, between the windows and at the corners. `solids` lists them.
- Nothing else below head height stands more than three quarters of a block from its wall. The balcony is at y 17 and the gate arch springs at y 8.

## Limits you should know

1. **Not seen in first person inside the Estate.** Checked in the Depot preview only, at 390 by 844 and wider, by day and at dusk.
2. **Built from Estate v1.14's wall rule**, replayed, because `windows.json` was never filed. If your walls or windows have changed, pass the real list and it will follow.
3. **No glazing bars.** You remove the bars, and nothing of mine may cross a pane, so a pane is now bare glass in a stone frame. If His Grace wants a slim cross back, say so and v15.1 adds it as its own switch.
4. **The balcony has no door onto it.** It runs the south front at y 17.5 with a rail 1 block high, and the portico roof joins it. Walkers cannot reach it unless you cut a door. It is on the south front only.
5. **Baked, not instanced.** X.1 specified start, middle and end caps sharing geometry. This kit bakes each building into pieces of 64 blocks instead, and reports the counts. A village kind is shared by all its houses.
6. **At two inner corners** (the Stable Court, the Home Farm) a window sits hard against the next wall. The pane rule cut a notch in that wall's door jamb or corner board there.
7. **Three facts about the hall's walls** that the skin follows faithfully: the east towers' top windows sit two blocks west of the windows below; the last window at the east end of each row is one block wide; the front door touches a window on each side (dressed as one door case).
8. **The gate arch** spans the drive between the two towers on the south side: 11 blocks wide, 7.5 blocks clear at the sides and 10 at the crown. Check your carriages.
9. **The dome's ribs** run over the dome's glass. That glass is roof, not a pane, so the pane rule does not cover it.
10. **32 village houses**, not about sixty: two villages of sixteen.
11. The plain walls, roofs and panes in the Contours tab are a stand-in for the Estate. Only the skin is the kit.

## Not got from the Estate

- `windows.json`. Still not in the Estate artifact.
- The word that the floor plan is settled, and a fresh `estate-plan.json` (needed for v18, not for this).
- The main chat's list of what it needs from the Depot. His Grace meant to bring it; it did not reach this chat.

---

# Parts Depot v14: one package for the main chat (Nov 12, 2026)

From KAIROS X.1. By His Grace's order this Depot is now the single thing to take: every part from v1 to v14, with the newest Globe bundled inside. Nothing here touches the Estate's files.

**What is new in v14:** the flower kit (`flowers.js`), the newest Globe under `globe/`, and button rows that scroll with a mouse (v13.1). v13 added the tree kit (`trees.js`, below).

**Load order:** props.js, props2, props3, props4, props5, floors, sets, livery, seasons, **trees, flowers**, water, animals, fire, sound, manor, use, household, hands, chores.

## The Globe, bundled

- Lives at `globe/` : `index.html`, `js/` (engine, geo, gl, layers, worker, earcut, topojson-client), `data/` (edition, world-110m, world-50m, admin1). It is the Globe artifact as of Nov 12 (version 1794502067-01a3), copied whole. The old root `globe.html` is retired and no longer opened by anything; it stays in the Depot and is kept. His Grace keeps old files; never delete it or offer to.
- **His Grace's rule (Nov 12): touching the globe always opens the latest Globe, wherever it is.** That is the live artifact, [private link: kept off the public repo], opened in a new tab (`GLOBE_LIVE` and `openGlobe()` in `worldview.js`). Use that link in the Estate; never pin a version.
- **Fallback:** the bundled copy. Open `globe/index.html` in a full-screen iframe (`openGlobeBundled()`); it posts `{type:'globe-close'}` from "Back to the house" and takes `{type:'globe-data', filed, flash, layers, theatres}`. Use it only when a new tab is blocked or offline. It goes stale; the live link does not.
- It loads d3 from cdnjs, as the Globe artifact does. Its worker and data paths are relative, so keep the folder shape.
- **Limit:** Ask the globe, spoken briefs and downloads use the host's `claude` capabilities (sample, tts, downloads). Inside an iframe of another artifact these are not granted. The Ask box still shows there and will not answer. If you want them, declare those capabilities on the Estate or hide `#ask` when embedding.
- About 2.3 MB of data. `admin1.json` (1.5 MB) loads only when the eye zooms in.

## flowers.js

Load after trees.js (it uses `TREES.mesh`) and seasons.js. Plain script, three.js passed in. Preview: the Flowers tab.

- **Kinds:** `tulip`, `rose`, `lily`, `lavender`, `hydrangea`, `iris`, `peony`, `poppy`, `wild` (daisy, cornflower, buttercup, campion, or `mixed`). Colours per kind in `FLOWERS.info[kind].colors`.
- **Voxel size:** near is 1/16 of a block (unit .0625); bush foliage uses 1/8 cells. Far is a quarter block (unit .25), a few cubes per plant.
- **Calls:**
  - `FLOWERS.build(kind,{seed,color,stage,lod})` returns `{V,unit,size}`. Parts: `stem`, `leaf`, `petal`, `eye`.
  - `FLOWERS.geometry(THREE,kind,{seed,color,stage,lod})` returns a cached, indexed BufferGeometry.
  - `FLOWERS.stage(kind,st)` gives `bloom`, `green`, `bare` or `dry` for a `SEASONS.state`. Each kind has its own bloom window (tulips days 95 to 135, roses 150 to 290, and so on). Flowers do not use `SEASONS.restyle`.
  - `FLOWERS.layout(kind,{x0,z0,x1,z1},{seed,species,colors,density})` fills a rectangle and returns `[{species,color,x,z,rot,seed}]`. Layouts: `bed` (drifts), `border` (tall at the back; `back:'n'|'s'|'e'|'w'`), `parterre` (`edge`, `fill`, `centre`), `rows` (`gap`, `along`), `meadow`.
  - `FLOWERS.plant(THREE,list,{st,far,gone,variants,stage})` plants a list instanced: 3 shapes per kind and colour, one InstancedMesh per shape and level. Call `bed.update(camera.position,dt)` each frame and `bed.season(st)` when the day changes. Near within 14 blocks, far to 70, nothing beyond. `stage:'bloom'` forces everything into flower.
- **Tags:** each mesh carries `userData.k='flower'` and `userData.o={species,color,seed,lod}`; the group carries `k='flowerbed'`.

## Flower quad counts (seeds 1 to 3)

| Kind | Near | Far | Height in blocks |
|---|---|---|---|
| Tulip | 56 | 10 | 0.5 to 0.6 |
| Poppy | 82 | 12 | 0.6 to 0.75 |
| Wildflowers | 85 to 110 | 14 to 23 | 0.55 |
| Iris | 96 to 106 | 10 to 16 | 0.9 |
| Lavender | 126 to 132 | 26 to 28 | 0.7 |
| Lily | 130 to 135 | 16 to 20 | 0.9 to 1 |
| Peony | 133 to 144 | 18 to 20 | 0.8 |
| Rose bush | 214 to 247 | 33 to 44 | 1.05 |
| Hydrangea | 212 to 236 | 46 to 55 | 1.25 |

Against the proposed ceiling of 60 quads a flower: only the tulip passes. The single-stem kinds run 80 to 135; the bushes (rose, hydrangea, peony) run 130 to 250 because each is a whole shrub with many blooms. Tell me what to cut. Layout sizes for a 10 x 4 rectangle: bed 239 plants, border 244, parterre 391, rows 100, meadow 47. A 391-plant parterre is about 30,000 quads all near and about 5,000 all far.

## Flower limits

1. **Real seasons are His Grace's choice (Nov 12): beds are not all in bloom at once, and he wants it that way.** Pass `st` and leave `stage` unset. Tulips are gone by June; in November nearly everything is cut back or dry. Do not force `stage:'bloom'` in the Estate.
2. Far plants are solid quarter-block cubes. Close up they look blocky; keep `far` at 14 or more.
3. Rose blooms sit on a coarse leaf mass, not on drawn canes. No climbing roses; those belong to the vine kit (v17).
4. Not seen in first person inside the Estate. Depot preview at phone size only.

---

# Parts Depot v13: the tree kit (Nov 12, 2026)

From KAIROS X.1, the Depot side chat. First kit of the Estate Batch. Drop-in; nothing touches the Estate's files.

## trees.js

Load after seasons.js. Plain script, three.js passed in, no imports, no network. Preview: the Trees tab.

- **Species:** `oak`, `cypress`, `cedar`, `willow`, `olive` (`TREES.SPECIES`). Evergreen: cypress, cedar, olive (`TREES.EVERGREEN`).
- **Three levels from one seed:** `hero` (unit .25, the full intricate tree), `near` (unit .5), `far` (unit 1; 1.5 for oak and cedar). Same seed, same tree, every load.
- **Calls:**
  - `TREES.build(species,{seed,lod})` returns `{V,unit,size,season}` in the props.js voxel format. Leaves carry part `leaf`, bark `b`.
  - `TREES.mesh(r)` returns `{pos,col,nor,index,quads}`, greedy-merged, light baked exactly as `PROPS.faces`. Indexed: set the index on your geometry.
  - `TREES.geometry(THREE,species,{seed,lod,st})` returns a cached BufferGeometry. Pass `st=SEASONS.state(date)` and it is dressed by `SEASONS.restyle` first.
  - `TREES.object(THREE,species,{seed,st})` returns a `THREE.LOD` with all three levels.
  - `TREES.forest(THREE,list,{st,variants,hero,far})` is the cheap way to plant the park. `list` is `[{species,x,z,y,rot,scale,seed}]`. Seeds fold into 4 shapes per species; each shape and level is one InstancedMesh with shared geometry. Call `grove.update(camera.position,dt)` each frame and `grove.season(st)` when season values change. `grove.stats()` reports draw calls and quads. Defaults: hero within 16 blocks, near within 60, far beyond.
- **Tags:** every mesh carries `userData.k='tree'` and `userData.o={species,seed,lod}`; the grove group carries `k='grove'`.
- **Material:** vertex colours, single sided (faces are wound outward). The old props.js trees needed DoubleSide; these do not.
- **Origin:** foot of the trunk, y up, one unit one block.

## Quad counts (average, worst of seeds 1 to 4) and size in blocks

| Species | Hero | Near | Far | Size (w x h) |
|---|---|---|---|---|
| Oak | 13,500 / 16,100 | 3,150 / 3,750 | 310 / 350 | about 19 x 12 |
| Cedar | 14,700 / 15,900 | 2,900 / 3,100 | 250 / 260 | about 17 x 12 |
| Willow | 7,400 / 8,000 | 1,550 / 1,650 | 310 / 370 | about 10 x 9 |
| Olive | 4,700 / 5,200 | 1,100 / 1,200 | 225 / 240 | about 12 x 9 |
| Cypress | 930 / 1,010 | 175 / 200 | 50 / 60 | about 3 x 12.5 |

Against the proposed ceilings (near 3,000, far 300): cypress, olive and willow pass near. Oak near averages 3,150 and runs to 3,750 on some seeds, cedar near to 3,150, and oak and willow far run to 350 to 370. Tell me if you want them cut; raising the far cell or picking seeds fixes it. The hero level is over 3,000 on purpose: use it only for the few trees closest to the eye, or not at all (`hero:0`). For scale, the old `treeOak` was 24,000 quads at one level.

A 146-tree grove in the preview: 20 draw calls and 34,000 quads seen from outside; 34 draw calls and 86,000 quads standing among them.

## Limits

1. Winter hero trees drop leaves voxel by voxel through `SEASONS.restyle`, so a bare oak has more faces than a summer one at near and far (holes open up). Check winter on a slow phone.
2. Sizes are larger than the old props.js trees (the oak spreads 19 blocks, not 12). Check spacing on the avenue.
3. Not seen in first person inside the Estate. Checked in the Depot preview at phone size only.
4. No sway. Leaves are tagged, so the Estate can add it.

---

## His Grace's taste for the next kits (quiz, Nov 12, 2026)

- **Flowers (v14):** all eight: roses, lilies, lavender, tulips, hydrangeas, irises, peonies, poppies and wildflowers.
- **More trees (a later version):** birch and poplar, apple and cherry in blossom, date palm and pomegranate.
- **Wall art (v18), rooms to design first:** war room and Map Room, library and study, his bedchamber and the Belvedere, great hall and dining rooms. All four matter; fill the rest after.

---

# Parts Depot: final handoff to the main chat (v12, Nov 12, 2026)

From the Parts Depot side chat. This is the last Depot for now: His Grace has moved the side chat to the Watchfloor globe. Everything here is drop-in; nothing touches the Estate's own files.

## His Grace's decision on what the Estate is for

GOLEM is being spread through the Estate. Each object stands for one specific page of GOLEM, and touching the object opens that page. The 86 hands-on pieces are the pattern he approved. `HANDS.rig(kind).use()` returns `{golem, page, real, open}`:

- `page` is the GOLEM page the piece should open (a label such as "Orders" or "Ledger"; map it to your real route).
- `real` is a category prompt ("Do the dishes"). Replace it with the live item from that GOLEM page.
- `open: 'globe'` means open `globe.html`; `open: 'golem'` means open the newest GOLEM build (the seeing stone, in His Grace's Belvedere).
- `USE.GOLEM` lists every part of GOLEM and the pieces that stand for it, so nothing is left outside the house.

## Answers to your list of parts not built in yet

Load order: props.js, props2, props3, props4, props5, floors, sets, livery, seasons, water, animals, fire, sound, manor, use, household, hands, chores. Suggested build order follows your list.

| Part | File | The whole integration |
|---|---|---|
| Water | water.js | `const lake=WATER.Lake(THREE,{cx,cz,rx,rz,depth,level})`; add `lake.mesh`. Each frame: `lake.step(dt)`, then `lake.mirror(renderer,scene,camera)` before your render. `lake.disturb(x,z)` for feet, boats, rain. `WATER.wade(lake,walker,dt)` tells you wade or swim. `lake.look(sky,{ice})` for colour and winter ice. The mirror costs one extra half-size render; skip it on slow phones with `reflect:false`. |
| Fire | fire.js | After a room is built: `const f=FIRE.ignite(THREE,roomGroup,{rule:FIRE.rule(st)})`, then `f.update(dt)`. Your meshes need `userData.k` (kind) and `userData.o`. It removes the static flame cubes and adds live ones. `maxLights` (default 12) caps point lights per room. |
| Seasons | seasons.js | `st=SEASONS.state(new Date())`, `sk=SEASONS.sky(st)` each frame; set your hemisphere and sun from `sk`. `SEASONS.restyle(V,st,opts)` returns `{V,glow}` for trees and windows: rebuild only when season values change. `SEASONS.Sky`, `.Weather`, `.Mist` are optional scene objects. You swap my trees for yours, so apply `restyle` to your tree voxels by tagging leaves `leaf`. |
| Sound | sound.js | `const snd=SOUND.Soundscape()`; `snd.start()` from a tap; `snd.update(dt,{st,water,fire,indoor,clock,music})` each frame. `snd.gong()`, `snd.bell(n)`, `snd.clock(quarter,strikes)`. No audio files. |
| The house responding | manor.js | `const m=MANOR.respond(THREE,group)`; `m.update(dt,{people:[{x,z}],vehicles,date,st})`. Works on meshes with `userData.k` of doorDouble, sash, clockLong, ironGate. You build your own doors as voxels, so either give those door voxels to `MANOR.leaf` or copy its hinge logic. `MANOR.Carriage` and `MANOR.Traffic` take a path, stops, delay and period. |
| Animals and liveries | animals.js, livery.js | `ANIMALS.build(kind,o)`, `ANIMALS.Rig(THREE,built,meshOf).pose(dt,{speed,mode})`, `ANIMALS.Brain(o).step(dt)`. `LIVERY.vox(agent)` replaces personVox; `LIVERY.rig(THREE,agent,meshOf).pose(dt,{mode,speed})` for walk, sit, ride, swim. |
| Room plans | plans8.json | One plan per real room, keyed by `key` (name @box@y), written against estate-plan.json v1.4. 7,585 items, 315 kinds. See the limits below before you fit it. |

## Since your primer

- **Beds for all 343.** plans8.json now holds 343 beds: a 218-bed dormitory in the Ballroom Cellars, plus second beds in attic rooms, lodgings, cottages, guest rooms and the inn. `HOUSEHOLD.create(...).beds` maps each agent id to `{i, n}` (room index, bed index).
- **Agents avoid each other.** In `HOUSEHOLD.at(hour)` walkers keep 0.34 blocks to the right of their line and hold back behind anyone within 0.75 blocks ahead. It is stateless; you do not need to add steering.
- **The household.** `HOUSEHOLD.create({plans,agents,rota}).at(hour)` returns every agent's room, activity, mode and position. `greet`, `defer` and `tour` are there too.
- **Hands on v2.** 86 kinds. Bells and the gong swing on their own pivot, the dart flies into the board, water falls from the spout into the basin.
- **The globe.** `globe.html` is the DataHub globe lifted whole. Open it in an overlay; post `{type:'globe-data', flash, layers}` to refresh; it posts `{type:'globe-close'}`.
- **Chores.** `CHORES.create({tasks})`: a turn is earned only by ticking a real task. Pass his Orders and daily checklist as `tasks`.

## Limits you should know before building

1. **Weight.** The furniture in plans8.json meshes to about 880,000 quads by my greedy count. Bake per room and draw only nearby rooms, or thin the fill items.
2. **Fit.** I placed with my own half-block collision grid against your door and window records, not your fitter. Some pieces will be refused.
3. **Routes.** HOUSEHOLD routes are computed on my plans. Rebuild after fitting, passing your fitted item list as `plans`. About 2% of in-room routes fall back to a straight line.
4. **Not seen in first person.** Every part was checked in the Depot preview, not inside the Estate.
5. **Labels only.** Nothing in the Depot holds His Grace's records. The example tasks in Chores and the `real` lines are placeholders.

## v1.65 (25 Nov 2026): six parts for the Sewing Room and the Upper Linen Room, and the cot
Made and placed by the Estate chat (there is no separate Depot chat). All in `props5.js`, after `dryingRack`; the page's embedded copy is the same text. Indoor pieces are drawn within 46 blocks, so far off they cost nothing.

| Part | What it is | Triangles near | Far |
|---|---|---|---|
| `dressForm` | A dress form on an ebony stand, a tape over its shoulders; with `c`, a dress in that cloth pinned on it | 160 (138 with `c`) | 0 |
| `clothBolts` | A wall rack of twelve bolts of cloth | 436 | 0 |
| `sewingTable` | A work table with a hand machine, cloth, shears, a pin cushion, a pattern | 242 | 0 |
| `workBasket` | A wicker basket of wools with a handle | 230 | 0 |
| `linenShelves` | Open shelves of folded linen, some tied in blue tape | 440 | 0 |
| `laundryBasket` | A hamper heaped with linen | 196 | 0 |
| `cot` (changed) | A top rail, a blue blanket, a muslin hood at the head | 342 | 0 |

## v1.66 (26 Nov 2026): chimney stacks in `contours.js`
Made by the Estate chat. `stacks(S,spec,b,bi,st,pal)`, called for the first box of a building whose roof is flat and whose style carries `stacks:{every,inset,w,d,h,pots}`. The page's embedded copy is the same text.

| Building | Stacks | Triangles near, before > after | Far, before > after |
|---|---|---|---|
| Euphrates Hall | 12 (two a side on the north and south fronts beside the middle, two each on the east and west) | 74,406 > 76,546 | 11,968 > 12,396 |
| The State Wing | by the rule | 14,524 > 15,788 | 2,200 > 2,488 |
| The Service Wing | by the rule | 4,684 > 5,780 | 366 > 590 |

One stack: about 178 triangles near (a base, a shaft, a neck band, a three-part cap, pots), 36 far (a shaft and a cap).

