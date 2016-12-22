#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const tags = process.argv.slice(2);

console.log(chalk.gray('Generating Dockerfiles...'));

// Exit if no tags were provided
if (!tags.length) {
  console.log(chalk.yellow('No tags provided'));
  process.exit(0);
}

const rootPath = path.resolve(__dirname, '..');

// Grab the template
const template = fs.readFileSync(path.join(rootPath, 'Dockerfile.template'), 'utf8');

// Generate a Dockerfile for each tag
const promises = tags.map(tag => new Promise((resolve, reject) => {
  const dockerfile = template.replace(/\{\{TAG\}\}/g, tag);

  fs.mkdir(path.join(rootPath, tag), (err) => {
    if (err) {
      reject(err);
    } else {
      fs.writeFile(path.join(rootPath, tag, 'Dockerfile'), dockerfile, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(tag);
        }
      });
    }
  });
}));

Promise.all(promises).then((tags) => {
  tags.forEach((tag) => {
    console.log('[✓] ' + chalk.cyan(tag));
  });
  console.log(chalk.green('Success'));
  process.exit(0);
}, (err) => {
  console.log(chalk.red('Error'));
  console.error(err);
  process.exit(1);
});
