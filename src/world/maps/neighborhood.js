// Maple Court neighborhood section.
// Ground zones, walls, lamps, doors and transitions all come from
// public/neighborhood.json (open it in Tiled to edit).
// neighborhoodLoader.js fetches that JSON and exports the parsed data.

import {
  zoneAt, bakeInto, minimapBake,
  walls, lamps, doors, transitions, pickupSpots,
} from '../neighborhoodLoader.js';

export const neighborhood = {
  key:    'neighborhood',
  name:   'Maple Court',
  w:      5632,
  h:      3072,
  status: 'open',

  zoneAt,
  bakeInto,
  minimapBake,

  walls,
  canopies: [],
  lamps,
  doors,
  transitions,
  npcs:         [],
  pickupSpots,
  activities:   [],
};
