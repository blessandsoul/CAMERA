const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'client/public/data/products');
const files = fs.readdirSync(dir).filter(f => f.startsWith('camera-'));
const brands = {};
files.forEach(f => {
  const p = JSON.parse(fs.readFileSync(path.join(dir, f)));
  const brand = (p.specs.find(s => s.key.ka === 'ბრენდი') || {}).value || 'Unknown';
  const res = (p.specs.find(s => s.key.ka === 'რეზოლუცია') || {}).value || '';
  if (!brands[brand]) brands[brand] = [];
  brands[brand].push({ id: p.id, res });
});
Object.entries(brands).forEach(([b, items]) => {
  console.log(b + ': ' + items.length + ' cameras - sample: ' + items.slice(0,2).map(i => i.id + '/' + i.res).join(', '));
});
console.log('\nTotal cameras:', files.length);
