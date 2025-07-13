import pkg from 'fs-extra';
const {copySync} = pkg;

copySync('src/schematics/store/files', 'dist/schematics/store/files', { overwrite: true });
copySync('src/schematics/store/schema.json', 'dist/schematics/store/schema.json', { overwrite: true });

console.log('Template files copied.');