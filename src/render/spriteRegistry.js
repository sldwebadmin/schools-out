/**
 * spriteRegistry.js — master table of every external sprite in the game.
 *
 * HOW TO ADD A SPRITE
 * 1. Copy the PNG into public/sprites/<pack_folder>/ (e.g. public/sprites/me/).
 * 2. Add a row here with status:'active'.
 * 3. Use getSprite(key) in the appropriate bake/draw function.
 * That's it — the loader reads this table automatically.
 *
 * FIELDS
 *   key     – stable camelCase identifier used in bake functions. Never rename;
 *             stored in WeakMap at startup.
 *   file    – filename inside the pack's public folder.
 *   pack    – which Limezu pack the file comes from (determines sub-folder).
 *   type    – 'building' | 'prop' | 'ground' | 'character'
 *   status  – 'active'   → loaded at startup, available via getSprite()
 *             'planned'  → not yet copied; documents the roadmap
 *   region  – which game area(s) this sprite appears in
 *   covers  – the procedural code path this sprite replaces (retirement guide)
 *
 * PACK → PUBLIC SUB-FOLDER  (defined in spriteLoader.js)
 *   ME_Exteriors   →  sprites/me/
 *   ME_Interiors   →  sprites/me_int/   (pack not yet downloaded)
 *   ME_Characters  →  sprites/me_chr/   (pack not yet downloaded)
 */

export const SPRITE_REGISTRY = [

  // ── ME_Exteriors · Buildings · Neighbourhood ───────────────────────────

  { key:'house_country',
    file:'Country_House.png',             pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (player + estate lots)' },

  { key:'house_country_nb',
    file:'Country_House_No_Banisters.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (purple-lot neighbour)' },

  { key:'house_2',
    file:'Toy_House_2.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (blue-lot bungalow)' },

  { key:'house_3',
    file:'Toy_House_3.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (green-lot bungalow)' },

  { key:'house_4',
    file:'Toy_House_4.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (tan-lot bungalow)' },

  { key:'house_6',
    file:'Toy_House_6.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (plum-lot bungalow)' },

  { key:'house_7',
    file:'Toy_House_7.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Court',
    covers:'props.js drawWall type=house (rose-lot bungalow)' },

  // ── ME_Exteriors · Buildings · School ─────────────────────────────────

  { key:'school_facade',
    file:'School_1.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'School District',
    covers:'props.js drawWall type=school (main façade ≥1000px wide)' },

  // ── ME_Exteriors · Buildings · Market ─────────────────────────────────

  { key:'market_mall',
    file:'Mall_1.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Maple Mart District',
    covers:'props.js drawWall type=market (main wall ≥1000px wide)' },

  { key:'market_med_1', file:'Market_Medium_1.png', pack:'ME_Exteriors',
    type:'building', status:'active', region:'Maple Mart District',
    covers:'props.js drawWall type=market (medium walls 400-999px)' },
  { key:'market_med_2', file:'Market_Medium_2.png', pack:'ME_Exteriors',
    type:'building', status:'active', region:'Maple Mart District',
    covers:'props.js drawWall type=market (medium walls 400-999px)' },
  { key:'market_med_3', file:'Market_Medium_3.png', pack:'ME_Exteriors',
    type:'building', status:'active', region:'Maple Mart District',
    covers:'props.js drawWall type=market (medium walls 400-999px)' },
  { key:'market_med_4', file:'Market_Medium_4.png', pack:'ME_Exteriors',
    type:'building', status:'active', region:'Maple Mart District',
    covers:'props.js drawWall type=market (medium walls 400-999px)' },
  { key:'market_med_5', file:'Market_Medium_5.png', pack:'ME_Exteriors',
    type:'building', status:'active', region:'Maple Mart District',
    covers:'props.js drawWall type=market (medium walls 400-999px)' },
  { key:'market_med_6', file:'Market_Medium_6.png', pack:'ME_Exteriors',
    type:'building', status:'active', region:'Maple Mart District',
    covers:'props.js drawWall type=market (medium walls 400-999px)' },

  // ── ME_Exteriors · Buildings · Treehouse Village ───────────────────────

  { key:'treehouse',
    file:'Tree_House_1.png', pack:'ME_Exteriors',
    type:'building', status:'active',
    region:'Treehouse Village',
    covers:'props.js drawWall type=treehouse' },

  // ── ME_Exteriors · Props · Fences ─────────────────────────────────────
  // Theme 24 — 9-tile directional set (32×32 each).
  // Horizontal runs use Top row; vertical runs use Middle column.

  { key:'fence_tl', file:'Fence_1_Top_Left.png',     pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (horiz left cap / vert top cap)' },
  { key:'fence_tm', file:'Fence_1_Top_Middle.png',    pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (horiz repeating middle)' },
  { key:'fence_tr', file:'Fence_1_Top_Right.png',     pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (horiz right cap)' },
  { key:'fence_ml', file:'Fence_1_Middle_Left.png',   pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (vert repeating middle)' },
  { key:'fence_mr', file:'Fence_1_Middle_Right.png',  pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (vert right side)' },
  { key:'fence_bl', file:'Fence_1_Bottom_Left.png',   pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (vert bottom cap)' },
  { key:'fence_bm', file:'Fence_1_Bottom_Middle.png', pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (horiz bottom/inside run)' },
  { key:'fence_br', file:'Fence_1_Bottom_Right.png',  pack:'ME_Exteriors',
    type:'prop', status:'active', region:'all',
    covers:'props.js drawWall type=fence (corner)' },

  // ── ME_Exteriors · Props · Athletic ───────────────────────────────────

  { key:'bball_net',
    file:'Basketball_Net_1.png', pack:'ME_Exteriors',
    type:'prop', status:'active',
    region:'Athletic Fields',
    covers:'props.js drawWall type=hoop' },

  { key:'soccer_net',
    file:'Soccer_Net_1.png', pack:'ME_Exteriors',
    type:'prop', status:'active',
    region:'Athletic Fields',
    covers:'props.js drawWall type=goal' },

  // ── ME_Exteriors · Ground · LAWN (Maple Court neighbourhood + Maple Park) ──
  // Grass_1 fill tiles: singles _11, _12, _14, _16 are confirmed interior fills
  // (not edge/transition tiles). tile/subfolder naming: terrain/<name>.
  // Loaded into tilecache variant slots v=0..3; drawn via drawZoneTile.

  { key:'ground_lawn_1', file:'terrain/Grass_1_11.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'Maple Court / Maple Park',
    covers:'tilecache.js drawLawn (LAWN zone variant 0)' },
  { key:'ground_lawn_2', file:'terrain/Grass_1_12.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'Maple Court / Maple Park',
    covers:'tilecache.js drawLawn (LAWN zone variant 1)' },
  { key:'ground_lawn_3', file:'terrain/Grass_1_14.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'Maple Court / Maple Park',
    covers:'tilecache.js drawLawn (LAWN zone variant 2)' },
  { key:'ground_lawn_4', file:'terrain/Grass_1_16.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'Maple Court / Maple Park',
    covers:'tilecache.js drawLawn (LAWN zone variant 3)' },

  // ── ME_Exteriors · Ground · ROAD ──────────────────────────────────────
  // Asphalt_1 fill tiles: _16, _20, _22, _24 confirmed interior fills.

  { key:'ground_road_1', file:'terrain/Asphalt_1_16.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all roads',
    covers:'tilecache.js drawRoad (ROAD zone variant 0)' },
  { key:'ground_road_2', file:'terrain/Asphalt_1_20.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all roads',
    covers:'tilecache.js drawRoad (ROAD zone variant 1)' },
  { key:'ground_road_3', file:'terrain/Asphalt_1_22.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all roads',
    covers:'tilecache.js drawRoad (ROAD zone variant 2)' },
  { key:'ground_road_4', file:'terrain/Asphalt_1_24.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all roads',
    covers:'tilecache.js drawRoad (ROAD zone variant 3)' },

  // ── ME_Exteriors · Ground · SIDEWALK ──────────────────────────────────
  // Sidewalk_1 fill tiles: _1–_4 are solid/seam-variant fills.

  { key:'ground_sidewalk_1', file:'terrain/Sidewalk_1_1.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all sidewalks',
    covers:'tilecache.js drawSidewalk (SIDEWALK zone variant 0)' },
  { key:'ground_sidewalk_2', file:'terrain/Sidewalk_1_2.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all sidewalks',
    covers:'tilecache.js drawSidewalk (SIDEWALK zone variant 1)' },
  { key:'ground_sidewalk_3', file:'terrain/Sidewalk_1_3.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all sidewalks',
    covers:'tilecache.js drawSidewalk (SIDEWALK zone variant 2)' },
  { key:'ground_sidewalk_4', file:'terrain/Sidewalk_1_4.png', pack:'ME_Exteriors',
    type:'ground', status:'active', region:'all sidewalks',
    covers:'tilecache.js drawSidewalk (SIDEWALK zone variant 3)' },

  // ── ME_Exteriors · Ground · Remaining zones — Planned ─────────────────
  // (activate zone by zone after Harry approves neighbourhood look)

  { key:'ground_meadow',   file:'terrain/Grass_1_11.png', pack:'ME_Exteriors',
    type:'ground', status:'planned', region:'Meadow Reserve / wild',
    covers:'tilecache.js MEADOW zone' },
  { key:'ground_forest',   file:'terrain/Grass_2_X.png',  pack:'ME_Exteriors',
    type:'ground', status:'planned', region:'Whispering Woods',
    covers:'tilecache.js FOREST zone' },
  { key:'ground_blacktop', file:'terrain/Sidewalk_3_X.png',pack:'ME_Exteriors',
    type:'ground', status:'planned', region:'School District / Maple Mart District',
    covers:'tilecache.js BLACKTOP + COURT + MARKET zones' },
  { key:'ground_sandbox',  file:'terrain/Sand_1_X.png',    pack:'ME_Exteriors',
    type:'ground', status:'planned', region:'Maple Park / beach strip',
    covers:'tilecache.js SANDBOX zone' },
  { key:'ground_dirt',     file:'terrain/Dirt_1_X.png',    pack:'ME_Exteriors',
    type:'ground', status:'planned', region:'Construction Site / paths',
    covers:'tilecache.js DIRT + GRAVEL zones' },

  // ── ME_Exteriors · Props · World — Planned ────────────────────────────

  { key:'prop_tree_1',      file:'Tree_1.png',       pack:'ME_Exteriors',
    type:'prop', status:'planned', region:'Whispering Woods / Maple Court',
    covers:'props.js drawWall type=tree' },
  { key:'prop_bench',       file:'Bench_1.png',      pack:'ME_Exteriors',
    type:'prop', status:'planned', region:'all',
    covers:'no current renderer — new prop type' },
  { key:'prop_lamp',        file:'Street_Lamp_1.png',pack:'ME_Exteriors',
    type:'prop', status:'planned', region:'roads',
    covers:'no current renderer — new prop type' },

  // ── ME_Interiors · All — Planned ──────────────────────────────────────
  // Interior backgrounds for house, school, market, treehouse.
  // One sprite per room; drawn behind interior NPCs/furniture.

  { key:'int_house_main',   file:'House_Main_1.png', pack:'ME_Interiors',
    type:'building', status:'planned', region:'interior:house',
    covers:'interiorMaps.js house background (currently solid colour)' },
  { key:'int_school_hall',  file:'School_Hall_1.png',pack:'ME_Interiors',
    type:'building', status:'planned', region:'interior:school',
    covers:'interiorMaps.js school background' },

  // ── ME_Characters · All — Planned ─────────────────────────────────────
  // Walk-cycle sprite sheets (4-direction, 3-frame each) for all on-screen actors.

  { key:'char_player',      file:'Character_1.png',  pack:'ME_Characters',
    type:'character', status:'planned', region:'all',
    covers:'sheet.js buildSheets player sprite' },
  { key:'char_npc_1',       file:'Character_2.png',  pack:'ME_Characters',
    type:'character', status:'planned', region:'all',
    covers:'sheet.js buildSheets NPC variant 1' },
  { key:'char_npc_2',       file:'Character_3.png',  pack:'ME_Characters',
    type:'character', status:'planned', region:'all',
    covers:'sheet.js buildSheets NPC variant 2' },
  { key:'char_npc_3',       file:'Character_4.png',  pack:'ME_Characters',
    type:'character', status:'planned', region:'all',
    covers:'sheet.js buildSheets NPC variant 3' },
  { key:'char_dog',         file:'Dog_1.png',         pack:'ME_Characters',
    type:'character', status:'planned', region:'all',
    covers:'sheet.js buildSheets Biscuit (dog) sprite' },
];
