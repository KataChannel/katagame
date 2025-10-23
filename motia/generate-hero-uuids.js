const { v4: uuidv4 } = require('uuid');

// Read heroes.seed.ts and replace string IDs with UUIDs
const fs = require('fs');
const path = require('path');

const file = './src/seeds/heroes.seed.ts';
let content = fs.readFileSync(file, 'utf-8');

// Create a mapping of hero IDs to UUIDs
const heroIds = content.match(/id: 'hero_[^']+'/g) || [];
const idMap = {};

heroIds.forEach((match, index) => {
  const oldId = match.replace(/id: '|'/g, '');
  if (!idMap[oldId]) {
    idMap[oldId] = uuidv4();
    console.log(`${oldId} => ${idMap[oldId]}`);
  }
});

// Replace all IDs with UUIDs
Object.entries(idMap).forEach(([oldId, newId]) => {
  content = content.replace(new RegExp(`'${oldId}'`, 'g'), `'${newId}'`);
});

fs.writeFileSync(file, content, 'utf-8');
console.log('✅ Updated heroes.seed.ts with UUIDs');
