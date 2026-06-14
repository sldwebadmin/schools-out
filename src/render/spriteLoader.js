/**
 * spriteLoader.js — central image loader for all Limezu Modern Exteriors sprites.
 *
 * Top-level await fires once at module evaluation time.  By the time any
 * downstream module (buildsprites.js, etc.) calls getSprite(), every
 * 'active' registry entry has either loaded successfully or failed silently
 * (missing file → getSprite returns null → caller falls back to procedural).
 *
 * HOW TO SUPPORT A NEW PACK
 * Add its folder name to PACK_BASE below, copy its PNGs into
 * public/sprites/<folder>/, and set the entries in spriteRegistry.js.
 */

import { SPRITE_REGISTRY } from './spriteRegistry.js';

// Pack name (registry `pack` field) → public sub-folder under BASE_URL.
export const PACK_BASE = {
  ME_Exteriors:  'sprites/me/',
  ME_Interiors:  'sprites/me_int/',   // pack not yet downloaded
  ME_Characters: 'sprites/me_chr/',   // pack not yet downloaded
};

const _imgs = new Map();

if (typeof Image !== 'undefined') {
  const ROOT = import.meta.env.BASE_URL;
  await Promise.all(
    SPRITE_REGISTRY
      .filter(e => e.status === 'active')
      .map(({ key, file, pack }) => new Promise(res => {
        const img = new Image();
        img.onload  = () => { _imgs.set(key, img); res(); };
        img.onerror = () => res(); // missing file → null from getSprite → procedural fallback
        img.src = ROOT + (PACK_BASE[pack] ?? 'sprites/me/') + file;
      }))
  );
}

/** Returns the loaded HTMLImageElement for the given registry key, or null. */
export const getSprite = key => _imgs.get(key) ?? null;
