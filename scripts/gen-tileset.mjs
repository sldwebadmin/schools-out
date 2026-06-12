/**
 * Generates public/tileset.png — a 32×416 PNG (13 zone tiles, 32px each).
 * One solid-color tile per zone type, with a 2px dark border for visibility in Tiled.
 * Run with: node scripts/gen-tileset.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { deflateSync } from 'zlib';
import { ZONE_COLORS } from '../src/world/tiledata.js';

// ── Minimal PNG encoder ───────────────────────────────────────────────
function makeCRC32Table() {
  const t = new Uint32Array(256);
  for(let i = 0; i < 256; i++) {
    let c = i;
    for(let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
}
const CRC_TABLE = makeCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for(let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const c   = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, c]);
}

function encodePNG(w, h, rgb) {
  // rgb: Uint8Array of w*h*3 bytes (R,G,B)
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for(let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0; // filter = None
    for(let x = 0; x < w; x++) {
      const s = (y * w + x) * 3, d = y * (w * 3 + 1) + 1 + x * 3;
      raw[d] = rgb[s]; raw[d+1] = rgb[s+1]; raw[d+2] = rgb[s+2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRGB(s) {
  const n = parseInt(s.replace('#',''), 16);
  return [(n>>16)&0xFF, (n>>8)&0xFF, n&0xFF];
}

// ── Build pixel data ─────────────────────────────────────────────────
const N  = ZONE_COLORS.length - 1; // 13 zones (index 0 is null/unused)
const TW = 32, TH = 32;
const W  = TW, H  = N * TH;
const rgb = new Uint8Array(W * H * 3);

for(let zone = 1; zone <= N; zone++) {
  const [r,g,b] = hexToRGB(ZONE_COLORS[zone]);
  const y0 = (zone - 1) * TH;
  for(let y = y0; y < y0 + TH; y++) {
    for(let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      // 2px dark border so individual tiles are visible in Tiled's editor grid
      const border = (x < 2 || x >= W-2 || y - y0 < 2 || y - y0 >= TH-2) ? 0.4 : 1;
      rgb[i]   = Math.round(r * border);
      rgb[i+1] = Math.round(g * border);
      rgb[i+2] = Math.round(b * border);
    }
  }
}

mkdirSync('./public', { recursive: true });
writeFileSync('./public/tileset.png', encodePNG(W, H, rgb));
console.log(`Wrote public/tileset.png  (${W}×${H} px, ${N} zone tiles)`);
