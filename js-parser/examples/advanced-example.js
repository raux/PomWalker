#!/usr/bin/env node

/**
 * Advanced example demonstrating circular dependency detection and tree generation
 */

const { PackageJsonParser, DependencyResolver } = require('../dist/index');

function createMockPackageMap() {
  // Create a mock package map with circular dependencies
  const packageMap = new Map();
  
  packageMap.set('app', {
    name: 'app',
    version: '1.0.0',
    dependencies: [
      { name: 'package-a', version: '^1.0.0', type: 'dependencies' },
      { name: 'package-b', version: '^1.0.0', type: 'dependencies' }
    ],
    devDependencies: [],
    peerDependencies: [],
    optionalDependencies: []
  });

  packageMap.set('package-a', {
    name: 'package-a',
    version: '1.0.0',
    dependencies: [
      { name: 'package-c', version: '^1.0.0', type: 'dependencies' }
    ],
    devDependencies: [],
    peerDependencies: [],
    optionalDependencies: []
  });

  packageMap.set('package-b', {
    name: 'package-b',
    version: '1.0.0',
    dependencies: [
      { name: 'package-d', version: '^1.0.0', type: 'dependencies' }
    ],
    devDependencies: [],
    peerDependencies: [],
    optionalDependencies: []
  });

  packageMap.set('package-c', {
    name: 'package-c',
    version: '1.0.0',
    dependencies: [
      { name: 'package-a', version: '^1.0.0', type: 'dependencies' } // Circular!
    ],
    devDependencies: [],
    peerDependencies: [],
    optionalDependencies: []
  });

  packageMap.set('package-d', {
    name: 'package-d',
    version: '1.0.0',
    dependencies: [],
    devDependencies: [],
    peerDependencies: [],
    optionalDependencies: []
  });

  return packageMap;
}

function main() {
  console.log('JS Parser - Advanced Features Demo\n');
  console.log('='.repeat(60));
  
  const resolver = new DependencyResolver();
  const packageMap = createMockPackageMap();
  const rootPackage = packageMap.get('app');

  // 1. Detect circular dependencies
  console.log('\n1. Circular Dependency Detection\n');
  const circular = resolver.detectCircularDependencies(rootPackage, packageMap);
  
  if (circular.length > 0) {
    console.log(`Found ${circular.length} circular dependency chain(s):\n`);
    circular.forEach((circ, index) => {
      console.log(`  ${index + 1}. ${circ.description}`);
    });
  } else {
    console.log('No circular dependencies found.');
  }

  // 2. Generate dependency tree
  console.log('\n\n2. Dependency Tree\n');
  const tree = resolver.generateDependencyTree(rootPackage, packageMap, false, 10);
  console.log(resolver.formatDependencyTree(tree));

  // 3. Get transitive dependencies
  console.log('\n3. Transitive Dependencies\n');
  const transitive = resolver.getTransitiveDependencies(rootPackage, packageMap);
  console.log(`Total transitive dependencies: ${transitive.size}`);
  console.log('List:', Array.from(transitive).join(', '));

  // 4. Version constraint examples
  console.log('\n\n4. Version Constraint Resolution\n');
  
  const constraints = [
    '^1.0.0',
    '~1.2.3',
    '>=1.0.0 <2.0.0',
    '1.5.0'
  ];

  const testVersions = ['1.0.0', '1.5.0', '1.9.9', '2.0.0'];

  constraints.forEach(constraint => {
    console.log(`\nConstraint: ${constraint}`);
    const parsed = resolver.parseVersionConstraint(constraint);
    console.log(`  Exact: ${parsed.exact}`);
    
    console.log('  Satisfying versions:');
    testVersions.forEach(version => {
      const satisfies = resolver.satisfies(version, constraint);
      if (satisfies) {
        console.log(`    ✓ ${version}`);
      }
    });
    
    const max = resolver.maxSatisfying(testVersions, constraint);
    if (max) {
      console.log(`  Max satisfying: ${max}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('\nDemo completed successfully!');
}

main();
