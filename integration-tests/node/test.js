'use strict';

const path = require('path');
const childProcess = require('child_process');

const { dependencies } = require('./package.json');

const nodeDependencies = Object.keys(dependencies)
  .filter((name) => name.startsWith('node-'))
  .sort((a, b) => b.localeCompare(a));

nodeDependencies.forEach((nodeDependency) => {
  console.log(`Starting test on ${nodeDependency}...`);

  const nodeBin = path.join(__dirname, 'node_modules', nodeDependency, 'bin/node');

  childProcess.execSync(`${nodeBin} index.js`, { stdio: 'inherit' });
});
