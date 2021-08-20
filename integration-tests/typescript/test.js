'use strict';

const path = require('path');
const childProcess = require('child_process');

const { dependencies } = require('./package.json');

const typescriptDependencies = Object.keys(dependencies)
  .filter((name) => name.startsWith('typescript-'))
  .sort((a, b) => b.localeCompare(a));

typescriptDependencies.forEach((typescriptDependency) => {
  console.log(`Starting test on ${typescriptDependency}...`);

  const tscBin = path.join(__dirname, 'node_modules', typescriptDependency, 'bin/tsc');

  childProcess.execSync(tscBin, { stdio: 'inherit' });
});
