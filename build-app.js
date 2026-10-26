const fs = require('fs');
const tpl = fs.readFileSync(__dirname + '/app.template.html', 'utf8');
const palette = JSON.parse(fs.readFileSync(__dirname + '/palette.json', 'utf8'));
const json = JSON.stringify(palette);
if (!tpl.includes('__PALETTE__')) throw new Error('no palette placeholder');
fs.writeFileSync(__dirname + '/map-forge.html', tpl.replace('__PALETTE__', json));
console.log('map-forge.html:', fs.statSync(__dirname + '/map-forge.html').size, 'bytes,', palette.length, 'colors');
