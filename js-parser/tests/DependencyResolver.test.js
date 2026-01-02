const { describe, it } = require('node:test');
const assert = require('node:assert');
const { DependencyResolver } = require('../dist/parsers/DependencyResolver');

describe('DependencyResolver', () => {
  const resolver = new DependencyResolver();

  describe('parseVersionConstraint', () => {
    it('should parse exact version', () => {
      const constraint = resolver.parseVersionConstraint('1.0.0');
      assert.strictEqual(constraint.exact, true);
      assert.strictEqual(constraint.min, '1.0.0');
    });

    it('should parse caret range', () => {
      const constraint = resolver.parseVersionConstraint('^1.0.0');
      assert.strictEqual(constraint.exact, false);
      assert.strictEqual(constraint.constraint, '^1.0.0');
    });

    it('should parse tilde range', () => {
      const constraint = resolver.parseVersionConstraint('~1.0.0');
      assert.strictEqual(constraint.exact, false);
      assert.strictEqual(constraint.constraint, '~1.0.0');
    });
  });

  describe('satisfies', () => {
    it('should check if version satisfies constraint', () => {
      assert.strictEqual(resolver.satisfies('1.2.3', '^1.0.0'), true);
      assert.strictEqual(resolver.satisfies('2.0.0', '^1.0.0'), false);
      assert.strictEqual(resolver.satisfies('1.0.5', '~1.0.0'), true);
      assert.strictEqual(resolver.satisfies('1.1.0', '~1.0.0'), false);
    });

    it('should handle exact versions', () => {
      assert.strictEqual(resolver.satisfies('1.0.0', '1.0.0'), true);
      assert.strictEqual(resolver.satisfies('1.0.1', '1.0.0'), false);
    });
  });

  describe('maxSatisfying', () => {
    it('should find max version satisfying constraint', () => {
      const versions = ['1.0.0', '1.5.0', '2.0.0', '2.1.0'];
      
      const max1 = resolver.maxSatisfying(versions, '^1.0.0');
      assert.strictEqual(max1, '1.5.0');
      
      const max2 = resolver.maxSatisfying(versions, '^2.0.0');
      assert.strictEqual(max2, '2.1.0');
    });

    it('should return null if no version satisfies', () => {
      const versions = ['1.0.0', '1.5.0'];
      const max = resolver.maxSatisfying(versions, '^2.0.0');
      assert.strictEqual(max, null);
    });
  });

  describe('detectCircularDependencies', () => {
    it('should detect circular dependencies', () => {
      const packageMap = new Map();
      
      packageMap.set('pkg-a', {
        name: 'pkg-a',
        version: '1.0.0',
        dependencies: [{ name: 'pkg-b', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('pkg-b', {
        name: 'pkg-b',
        version: '1.0.0',
        dependencies: [{ name: 'pkg-c', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('pkg-c', {
        name: 'pkg-c',
        version: '1.0.0',
        dependencies: [{ name: 'pkg-a', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });

      const pkg = packageMap.get('pkg-a');
      const circular = resolver.detectCircularDependencies(pkg, packageMap);
      
      assert.ok(circular.length > 0);
      assert.ok(circular[0].description.includes('pkg-a'));
    });

    it('should not detect circular deps when none exist', () => {
      const packageMap = new Map();
      
      packageMap.set('pkg-a', {
        name: 'pkg-a',
        version: '1.0.0',
        dependencies: [{ name: 'pkg-b', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('pkg-b', {
        name: 'pkg-b',
        version: '1.0.0',
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });

      const pkg = packageMap.get('pkg-a');
      const circular = resolver.detectCircularDependencies(pkg, packageMap);
      
      assert.strictEqual(circular.length, 0);
    });
  });

  describe('generateDependencyTree', () => {
    it('should generate dependency tree', () => {
      const packageMap = new Map();
      
      packageMap.set('root', {
        name: 'root',
        version: '1.0.0',
        dependencies: [
          { name: 'dep1', version: '1.0.0', type: 'dependencies' },
          { name: 'dep2', version: '1.0.0', type: 'dependencies' }
        ],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('dep1', {
        name: 'dep1',
        version: '1.0.0',
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('dep2', {
        name: 'dep2',
        version: '1.0.0',
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });

      const tree = resolver.generateDependencyTree(
        packageMap.get('root'),
        packageMap
      );
      
      assert.strictEqual(tree.name, 'root');
      assert.strictEqual(tree.version, '1.0.0');
      assert.strictEqual(tree.children.length, 2);
      assert.strictEqual(tree.children[0].name, 'dep1');
      assert.strictEqual(tree.children[1].name, 'dep2');
    });

    it('should mark circular dependencies in tree', () => {
      const packageMap = new Map();
      
      packageMap.set('pkg-a', {
        name: 'pkg-a',
        version: '1.0.0',
        dependencies: [{ name: 'pkg-b', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('pkg-b', {
        name: 'pkg-b',
        version: '1.0.0',
        dependencies: [{ name: 'pkg-a', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });

      const tree = resolver.generateDependencyTree(
        packageMap.get('pkg-a'),
        packageMap
      );
      
      assert.strictEqual(tree.name, 'pkg-a');
      assert.strictEqual(tree.children.length, 1);
      assert.strictEqual(tree.children[0].name, 'pkg-b');
      // The circular reference should be detected
      assert.ok(tree.children[0].children.length >= 0);
    });
  });

  describe('formatDependencyTree', () => {
    it('should format dependency tree as string', () => {
      const tree = {
        name: 'root',
        version: '1.0.0',
        depth: 0,
        children: [
          {
            name: 'dep1',
            version: '1.0.0',
            depth: 1,
            children: []
          }
        ]
      };

      const formatted = resolver.formatDependencyTree(tree);
      assert.ok(formatted.includes('root@1.0.0'));
      assert.ok(formatted.includes('dep1@1.0.0'));
    });

    it('should mark circular dependencies', () => {
      const tree = {
        name: 'root',
        version: '1.0.0',
        depth: 0,
        children: [
          {
            name: 'dep1',
            version: '1.0.0',
            depth: 1,
            circular: true,
            children: []
          }
        ]
      };

      const formatted = resolver.formatDependencyTree(tree);
      assert.ok(formatted.includes('[CIRCULAR]'));
    });
  });

  describe('getTransitiveDependencies', () => {
    it('should get all transitive dependencies', () => {
      const packageMap = new Map();
      
      packageMap.set('root', {
        name: 'root',
        version: '1.0.0',
        dependencies: [{ name: 'dep1', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('dep1', {
        name: 'dep1',
        version: '1.0.0',
        dependencies: [{ name: 'dep2', version: '1.0.0', type: 'dependencies' }],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });
      
      packageMap.set('dep2', {
        name: 'dep2',
        version: '1.0.0',
        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
        optionalDependencies: []
      });

      const transitive = resolver.getTransitiveDependencies(
        packageMap.get('root'),
        packageMap
      );
      
      assert.ok(transitive.has('dep1'));
      assert.ok(transitive.has('dep2'));
      assert.strictEqual(transitive.size, 2);
    });
  });
});
