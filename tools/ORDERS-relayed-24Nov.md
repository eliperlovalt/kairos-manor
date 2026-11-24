# Orders relayed by KAIROS on 23 and 24 Nov 2026, in His Grace's name

Filed as received. A relay is not His Grace's own word: where one changes the design or reverses an answer he gave me directly, I ask him by quiz before building. States at the foot.

## 1. The napkin (three relays, in order)
- 23 Nov: remove the napkin entirely; both forearms end in the same white glove.
- 23 Nov, His Grace to me by quiz: remove it. Built and pushed in v1.58 (9fbcba1).
- 24 Nov: "They replace the earlier napkin removal": keep the napkin but sculpt it. A draped cloth over the left forearm: soft folds and a rolled edge, longer on the outer side than the inner, a slight taper, tucked under the forearm; the finest voxel scale; two whites (a shadowed fold and a lit fold).

## 2. The hands
Both hands as relaxed gloved hands: a palm block, four fingers grouped and slightly curled, a thumb on the inside, hanging naturally at the thigh. Mirrored left and right with correct normals (no negative scale). The hanging right hand now reads as an L: a white cuff block with a thin white stick pointing down. Close-up before and after of both hands, front and side.

## 3. The whole mansion rendered at once
His words as relayed: the throne room "loads in when I walk in, not immediately". No room, wing or set of furniture may pop in as he walks. Build and upload everything during the load screen. Distance culling may hide things only when truly out of view (frustum and occlusion), never "not built yet". If a phone cannot take it, say so with numbers, and keep the Great Hall, the forecourt and every room on the arrival route pre-built at least. Proof: a six-still walk from the forecourt into the Great Hall with nothing appearing late.

## 4. The thrones at the head of the table
The long refectory table runs down the Great Hall's long axis. The thrones (his, with Kairos's beside it) sit at the head of the table on the dais, facing down its length, chairs in pairs along both sides. Keep Kairos's seat and seated pose working; update KSEAT. Before and after from the hall's entrance and from behind the thrones. A full room rework is approved.

## 5. The ground and the floors ("v1.58 is now all about the ground and the floors")
His words as relayed: the outside ground "looks so basic".
- Lawns: a varied grass palette, low-frequency patches and mowing stripes, tufts and clover, daisies and small flowers at the edges, darker grass under trees, worn grass along the paths.
- Paths and forecourt: gravel with a dotted texture and a stone kerb; flagstones with real joints, size variation, worn and darker stones, moss in the cracks; the forecourt laid as a pattern (a circle round the fountain, radiating courses).
- Edges: box-hedge borders, bedding with flowers, steps with nosings, lawn meeting path with a clean edge.
- Terrain: gentle undulation away from the house, banks and a ha-ha, nothing perfectly flat beyond the terraces.
- Interior floors: parquet (herringbone or basket-weave) in the state rooms; marble checks in the halls; stone flags with joints below stairs; boards with visible planks upstairs; rugs with borders and patterns; thresholds and skirting where floor meets wall.
- Frame time no worse; the gate; before and after from the forecourt, the lawn, the Great Hall, the Double Library and the kitchen.

## 6. Small
- The fountain's spray drew over figures in the reel studio. Done in v1.58: the drops are solid and depth-tested like everything else. In the page they were already hidden behind the walker.

## States
| # | State |
|---|---|
| 1 | Asked of His Grace by quiz, 24 Nov |
| 2 | Done in v1.60: relaxed gloved hands, true mirrors |
| 3 | Done in v1.60 for the arrival route: nothing is built late (all of it is meshed at load); the culling by distance now keeps the rooms on the front-door axis drawn from the upper steps and terrace. Cost there: +9 to +10 percent frame time. The whole house drawn at once from everywhere is not done: from the forecourt alone it cost a fifth more frame time |
| 4 | Done in v1.60 as relayed (table down the long axis, thrones at the east end). It costs the view of the thrones from the Saloon; the other layout is offered to His Grace by quiz |
| 5 | Built as v1.59 (KAIROS relayed His Grace's approval of the order: ground and floors first). Lawns, gravel, kerbs, flags, the fountain court, and a floor finish in every room. Not in it: terrain undulation and a ha-ha, hedge borders and bedding (the gardens version), skirting |
| 6 | Done |

## The ten-version plan relayed on 24 Nov ("His Grace has approved the plan for tonight")
Ground and floors; the throne room and Kairos (the whole mansion at load, the thrones at the head of the table, the napkin, the hands); the gardens; the outside of the house; the state rooms; below stairs; the bedrooms and upper floors; the outbuildings; light and atmosphere; final polish. My numbering runs one ahead of the relay's, because v1.58 was already pushed when it came: ground and floors is v1.59, the throne room v1.60, and so on.

## KAIROS's sweep of v1.59 (24 Nov): merge held. Answered in v1.60
| # | His item | State |
|---|---|---|
| 1 | Outdoor paths lost their flag courses; kerbs as wide as the gravel | Fixed: gravel in texture with a kerb a quarter of a block wide; flagged walks in jointed flags. Stills 09 |
| 2 | Lawns do not read as mown; no daisies, shade or worn edges | Fixed: `lawnMown` laid over the grass; deeper tree shade; pale edge by paths. Stills 08 |
| 3 | Fountain court: plain squares | Fixed: four rings with radial joints and a border course. Stills 07 |
| 4 | Outdoor flags everywhere: no joints | Fixed on the terrace and the flagged walks. The stable yard is gravel and takes the gravel texture. Stills 10 |
| 5 | Terrain undulation and the ha-ha | Not done; moved to the gardens version, said plainly |
| 6 | A straight joint down every new floor | Fixed: it was the texture tile's edge. Stills 11 |
| 7 | Great Hall on grey flags | Fixed: marble checks |
| 8 | Annexe flagged, Cellars planked, Tower Porch bare | Annexe and Cellars fixed. Tower Porch: open |
| 9 | Dark box in the Ambulance Bay | Fixed: a canvas hood with a red cross |
| 10 | Parquet shimmer, shadow speckle on flags | Open |
| Napkin | "keep it, sculpted" | Built in v1.61 after the third relay, behind the switch `KNAP`, and reported to His Grace plainly (his own earlier word was to remove it; my quiz went unanswered three times) |
