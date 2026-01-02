const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { PackageJsonParser } = require('../dist/parsers/PackageJsonParser');

describe('PackageJsonParser', () => {
  const parser = new PackageJsonParser();
  const fixturesDir = path.join(__dirname, 'fixtures');

  it('should parse a package.json file', () => {
    const filePath = path.join(fixturesDir, 'test-package.json');
    const pkg = parser.parseFile(filePath);

    assert.strictEqual(pkg.name, 'test-package');
    assert.strictEqual(pkg.version, '1.0.0');
    assert.strictEqual(pkg.description, 'A test package');
    assert.strictEqual(pkg.license, 'MIT');
  });

  it('should extract dependencies correctly', () => {
    const filePath = path.join(fixturesDir, 'test-package.json');
    const pkg = parser.parseFile(filePath);

    assert.strictEqual(pkg.dependencies.length, 2);
    assert.strictEqual(pkg.devDependencies.length, 2);
    assert.strictEqual(pkg.peerDependencies.length, 1);
    assert.strictEqual(pkg.optionalDependencies.length, 1);
  });

  it('should extract dependency details', () => {
    const filePath = path.join(fixturesDir, 'test-package.json');
    const pkg = parser.parseFile(filePath);

    const expressDep = pkg.dependencies.find(d => d.name === 'express');
    assert.ok(expressDep);
    assert.strictEqual(expressDep.version, '^4.18.0');
    assert.strictEqual(expressDep.type, 'dependencies');

    const lodashDep = pkg.dependencies.find(d => d.name === 'lodash');
    assert.ok(lodashDep);
    assert.strictEqual(lodashDep.version, '~4.17.21');
  });

  it('should get all dependencies combined', () => {
    const filePath = path.join(fixturesDir, 'test-package.json');
    const pkg = parser.parseFile(filePath);
    const allDeps = parser.getAllDependencies(pkg);

    assert.strictEqual(allDeps.length, 6);
  });

  it('should find a specific dependency', () => {
    const filePath = path.join(fixturesDir, 'test-package.json');
    const pkg = parser.parseFile(filePath);
    
    const expressDep = parser.getDependency(pkg, 'express');
    assert.ok(expressDep);
    assert.strictEqual(expressDep.name, 'express');
    
    const nonExistent = parser.getDependency(pkg, 'non-existent');
    assert.strictEqual(nonExistent, undefined);
  });

  it('should check if package has dependency', () => {
    const filePath = path.join(fixturesDir, 'test-package.json');
    const pkg = parser.parseFile(filePath);
    
    assert.strictEqual(parser.hasDependency(pkg, 'express'), true);
    assert.strictEqual(parser.hasDependency(pkg, 'typescript'), true);
    assert.strictEqual(parser.hasDependency(pkg, 'non-existent'), false);
  });

  it('should parse package.json from string', () => {
    const content = JSON.stringify({
      name: 'test',
      version: '1.0.0',
      dependencies: {
        'dep1': '1.0.0'
      }
    });

    const pkg = parser.parse(content);
    assert.strictEqual(pkg.name, 'test');
    assert.strictEqual(pkg.version, '1.0.0');
    assert.strictEqual(pkg.dependencies.length, 1);
  });
});
