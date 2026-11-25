# Euphrates Hall: the Voxel Estate

One big self-contained three.js (0.160.0) voxel page. Live at https://eliperlovalt.github.io/Eh/ (this repo's root `index.html`, served by GitHub Pages from `main`). Current version: v1.64. The brand line in the page says the version; bump it on every release.

## Where things are
- `src/index.html`: THE SOURCE (about 760 KB, one file, ES module importing three from a CDN). Edit this, never the root file.
- `index.html` (root): the built web copy. Made by `python3 tools/build.py src/index.html index.html` (bundles three with esbuild, minifies whitespace). Do not hand-edit. First time on a new machine: `npm i three@0.160.0 esbuild` somewhere, then set `EH_NODE_MODULES` to that `node_modules` folder.
- `src/estate-plan.json`, `src/kits.json`: data the page embeds or mirrors. `kits.json` and the `KITS()` function inside the source embed the Depot's code from `depot/`; keep them in step with it.
- `windows.json`, `room-register.json`, `wall-moves-v20.json`: issued data. The register lists all 157 rooms as built; the wall-moves file is the agreed plan for v20.
- `tools/README.md`: the running engineering notes, one section per version ("Since v1.15" ... "Since v1.19"). Read it before changing anything.
- `tools/tests/`: Playwright tests and tools. `harness.py` serves a folder and opens the page in headless Chrome (set `CHROME` to a Chrome binary; software GL works; it takes three from `EH_NODE_MODULES` too). Test the source with FOLDER = `src`, the built copy with FOLDER = the repo root. `metrics.py BASE NEW` measures load, heap, geometry, draws and triangles.

## Your first job (the owner's order, 14 November 2026)
1. Read it all: `tools/README.md`, then `src/index.html` end to end.
2. Hyper-optimize it: load time, frame time, draw calls, triangles, memory, on a phone first. Measure before and after; change nothing you cannot measure.
3. Give the owner ten suggestions for what to improve next, ranked, each with what it costs and what it buys.
Then stop and report before starting larger rebuilds.

## Rules that bind every change
- Run `walk_test.py`, `reach_test.py` and `audit_test.py` on BOTH `src/` and the built root copy before every push. No push if one fails.
- `tools/tests/gate.sh` runs all six plus a build check; a hook in `.claude/` blocks page pushes until it passes and blocks hand edits to the root copy.
- Compare frame times against the last version with `ftime3.py OLD_FOLDER NEW_FOLDER "" 2` (16.7 ms steps; noise about 4 percent). No push on a real slowdown.
- Both copies every time: rebuild the root `index.html` whenever `src/index.html` changes.
- Never delete old versions or files. Never offer to. Git history is the archive.
- The page must run on a phone in landscape, GTA-style touch controls. That is the target device.
- Debug hooks live on `window.__vx` (grid, buildings, props queue, settle stats, skins, palette). Tests depend on them.

## You are the Estate AND the Depot (His Grace's order, 14 Nov 2026)
There is no separate Depot chat any more. You make the parts and you place them.
- The Depot's work lives in `depot/` (start with `depot/README.md` and `depot/HANDOFF.md`). Change a kit there, then carry it into the source: `KITS()` in `src/index.html` and `src/kits.json` embed the Depot's code, so keep them in step with `depot/`.
- Depot v20 (13 Nov) is delivered but not fitted: plans for every room (`rooms20.json`), the glazing cross, the balcony door case, hero trees, the stronger spring, 15 new parts. Fit it as part of the backlog.
- Still binding: outer building boxes do not move. Changes to the outside and roofline go through the kits (`ornament.js`, `contours.js`), never as one-off voxels on a wall face.
- Measure every new part: triangles near and far, as the Depot's tables do in `HANDOFF.md`.

## How the source is laid out (search for these names)
`G/S` voxel grid get/set, palette `C`/`PAL`, `BLD[]` building specs (boxes, levels, rooms, doors), `HALLS`, `FLIGHTS` (stairs), `PQ` prop queue, `RK` room kit, `furnishFrom` (places a Depot room plan), `settle()` (post-pass: seating groups, plants, rugs, wall pieces, doors), `GROUPS` (culled mesh groups), `LIFE`/`lifeStep` (people and animals with bodies), `fitContours`/`skinSet`/`skinStep` (Depot stonework, dressed in a Web Worker), `mergeWater`, `TRAILS`/`trailAt`, `surf`/`baseH` (ground), `build()` (boot order), `frame()` (loop).

## The backlog
`BACKLOG.md` lists every idea not yet built, A1 to G1, with an owner for each. **Standing order (14 Nov): His Grace kept every line and wants it all done in one run once the first job is reported.** Follow the terms in BACKLOG.md under "keep all, do it all": skip anything redundant or already done (marked, never built twice), keep the Depot fence, ask his choices in one quiz at the start, ship in tested batches, and report once at the end. Never delete a line.

## Known open work
- v20: the 23 wall moves in `wall-moves-v20.json`, then new room plans from the Depot for every room.
- Bodies do not yet use doors, stairs or seats. The werewolf is a scaled dog. The Great Cedar is a stand-in.
- Every clickable object opens a fixed link (`URLS`, `ROOMOF`, `HOUSEDOCS` in the source). That wiring is to be redesigned.

## The owner
Address him as Your Grace. Short sentences, answer first, no em dashes ever. He gives the goal; you do the rest and ask taste questions as short multiple-choice quizzes. Every question to him is a clickable quiz (the question tool), never a list he must type an answer to (his order, 23 Nov 2026). Always give the Estate as its GitHub Pages link.
