import { checkAvailability } from "../../src/utils.ts";
import { ROOMS } from "../../src/data.ts";
const a101 = ROOMS[0];
const probes: [string, number, number, number][] = [
  ["NaN start", 540, NaN, 720],
  ["NaN end", 540, 660, NaN],
  ["NaN current", NaN, 660, 720],
  ["fractional 660.5-720", 540, 660.5, 720],
  ["Infinity end", 540, 660, Infinity],
];
for (const [name, c, s, e] of probes) console.log(name.padEnd(22), JSON.stringify(checkAvailability(a101, c, s, e)));
