import pkg from 'fs-extra';
const {copySync} = pkg;

copySync('src/schematics/store/files', 'dist/schematics/store/files', { overwrite: true });
console.log('Template files copied.');