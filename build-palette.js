const fs = require('fs');
const j = JSON.parse(fs.readFileSync(__dirname + '/coloursJSON.json', 'utf8'));

const BLACKLIST = [
  /^water/, /_water$/, /lava/, /^sand/, /gravel/, /concrete_powder/, /anvil/, /_door/, /^door/,
  /bed$/, /^bed_/, /piston/, /carpet/, /pressure_plate/, /rail/, /torch/, /sign/, /banner/,
  /sapling/, /tulip/, /orchid/, /dandelion/, /poppy/, /allium/, /bluet/, /daisy/, /lilac/,
  /rose/, /peony/, /fern/, /^grass$/, /short_grass/, /tall_grass/, /double_plant/, /snow/,
  /^cake/, /farmland/, /dirt_path/, /glass/, /ice/, /slime/, /honey/, /mushroom/, /wheat/,
  /cobweb/, /frogspawn/, /sniffer_egg/, /turtle_egg/, /sculk/,
  /_stairs$/, /_slab$/, /candle/, /frogspawn/, /sculk_vein/, /hanging_/, /pitcher_/, /sniffer_egg/
];

function score(name, b) {
  let s = 0;
  if (b.supportBlockMandatory) s -= 60;
  if (b.flammable) s -= 6;
  if (/^.*_concrete$|concrete$/.test(name) && !/powder/.test(name)) s += 50;
  if (/_wool$/.test(name)) s += 34;
  if (/terracotta/.test(name) && !/glazed/.test(name)) s += 22;
  if (/_block$|block_of_/.test(name)) s += 8;
  if (/planks/.test(name)) s += 6;
  if (/glazed/.test(name)) s -= 40;
  return s;
}

const out = [];
let dropped = 0;
for (const [id, entry] of Object.entries(j)) {
  const tones = entry.tonesRGB;
  if (!tones || !tones.normal) { dropped++; continue; }

  // collect blocks valid in 1.20 (resolving "&version" references)
  const candidates = [];
  for (const [bi, b] of Object.entries(entry.blocks || {})) {
    let v = b.validVersions && b.validVersions['1.20'];
    if (v === undefined) continue;
    let guard = 0;
    while (typeof v === 'string' && v.startsWith('&')) {
      v = b.validVersions[v.slice(1)];
      if (guard++ > 10) break;
    }
    if (!v || typeof v === 'string') continue;
    candidates.push({ idx: Number(bi), name: v.NBTName, display: b.displayName, b });
  }
  if (!candidates.length) { dropped++; continue; }

  let best = null;
  for (const c of candidates) {
    if (BLACKLIST.some(re => re.test(c.name))) continue;
    const s = score(c.name, c.b);
    if (!best || s > best.s) best = { ...c, s };
  }
  if (!best) { dropped++; continue; } // no placeable solid block for this colour

  out.push({
    id: Number(id),
    block: 'minecraft:' + best.name,
    display: best.display,
    tones: tones,
  });
}

out.sort((a, b) => a.id - b.id);
fs.writeFileSync(__dirname + '/palette.json', JSON.stringify(out));
console.log('colours:', out.length, 'dropped:', dropped);
for (const c of out) console.log(String(c.id).padStart(3), c.display.padEnd(28), c.block.replace('minecraft:', ''));
