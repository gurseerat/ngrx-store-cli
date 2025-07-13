const fs = require('fs-extra');

fs.copySync('src/schematics/store/files', 'dist/schematics/store/files', { overwrite: true });
fs.copySync('src/schematics/store/schema.json', 'dist/schematics/store/schema.json', { overwrite: true });

console.log('Template files copied.');