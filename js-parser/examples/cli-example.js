#!/usr/bin/env node

/**
 * Simple CLI example for the JS Parser
 * Usage: node examples/cli-example.js <path-to-package.json>
 */

const path = require('path');
const { JSParser } = require('../dist/index');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cli-example.js <path-to-package.json>');
    console.log('');
    console.log('Example: node cli-example.js ../package.json');
    process.exit(1);
  }

  const packagePath = args[0];
  const parser = new JSParser();

  try {
    console.log('Parsing package.json...\n');
    const pkg = parser.parsePackageJson(packagePath);

    console.log('='.repeat(60));
    console.log(`Package: ${pkg.name}`);
    console.log(`Version: ${pkg.version}`);
    if (pkg.description) {
      console.log(`Description: ${pkg.description}`);
    }
    if (pkg.license) {
      console.log(`License: ${pkg.license}`);
    }
    console.log('='.repeat(60));
    console.log('');

    // Display dependencies
    if (pkg.dependencies.length > 0) {
      console.log('Dependencies:');
      pkg.dependencies.forEach(dep => {
        console.log(`  - ${dep.name}@${dep.version}`);
      });
      console.log('');
    }

    if (pkg.devDependencies.length > 0) {
      console.log('Dev Dependencies:');
      pkg.devDependencies.forEach(dep => {
        console.log(`  - ${dep.name}@${dep.version}`);
      });
      console.log('');
    }

    if (pkg.peerDependencies.length > 0) {
      console.log('Peer Dependencies:');
      pkg.peerDependencies.forEach(dep => {
        console.log(`  - ${dep.name}@${dep.version}`);
      });
      console.log('');
    }

    // Try to parse lock file if it exists
    const lockFilePath = path.join(path.dirname(packagePath), 'package-lock.json');
    const fs = require('fs');
    
    if (fs.existsSync(lockFilePath)) {
      console.log('Found package-lock.json, parsing...\n');
      const lockFile = parser.parseLockFile(lockFilePath);
      
      const lockedDeps = parser.getLockFileParser().getAllLockedDependencies(lockFile);
      console.log(`Total locked packages: ${lockedDeps.size}`);
      console.log('');
      
      // Show resolved versions for declared dependencies
      if (pkg.dependencies.length > 0) {
        console.log('Resolved versions:');
        pkg.dependencies.forEach(dep => {
          const resolved = parser.getLockFileParser().getResolvedVersion(lockFile, dep.name);
          if (resolved) {
            console.log(`  - ${dep.name}: ${dep.version} → ${resolved}`);
          }
        });
      }
    }

    console.log('');
    console.log('Summary:');
    console.log(`  Total dependencies: ${pkg.dependencies.length}`);
    console.log(`  Dev dependencies: ${pkg.devDependencies.length}`);
    console.log(`  Peer dependencies: ${pkg.peerDependencies.length}`);
    console.log(`  Optional dependencies: ${pkg.optionalDependencies.length}`);

  } catch (error) {
    console.error('Error parsing package:', error.message);
    process.exit(1);
  }
}

main();
