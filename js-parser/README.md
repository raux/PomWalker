# JS Parser - JavaScript/npm Package Parser

A TypeScript-based parser for analyzing JavaScript/npm packages with comprehensive support for dependency analysis, version resolution, and lock file parsing.

## Features

- **Package.json parsing** - Extract metadata (name, version, description, authors, etc.)
- **Dependency analysis** - Parse dependencies, devDependencies, peerDependencies, optionalDependencies
- **Version resolution** - Understand semver constraints and ranges
- **Lock file parsing** - Support package-lock.json and yarn.lock
- **Circular dependency detection** - Detect and report circular dependencies
- **Dependency tree generation** - Generate and visualize dependency trees
- **TypeScript interfaces** - Full TypeScript support with type definitions

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```typescript
import { JSParser } from './dist';

const parser = new JSParser();

// Parse a package.json file
const pkg = parser.parsePackageJson('./package.json');
console.log(`Package: ${pkg.name}@${pkg.version}`);
console.log(`Dependencies: ${pkg.dependencies.length}`);

// Parse a lock file
const lockFile = parser.parseLockFile('./package-lock.json');
```

### Using Individual Parsers

#### PackageJsonParser

```typescript
import { PackageJsonParser } from './dist';

const parser = new PackageJsonParser();

// Parse from file
const pkg = parser.parseFile('./package.json');

// Parse from string
const content = JSON.stringify({ name: 'my-app', version: '1.0.0' });
const pkg2 = parser.parse(content);

// Get all dependencies
const allDeps = parser.getAllDependencies(pkg);

// Check for specific dependency
const hasExpress = parser.hasDependency(pkg, 'express');

// Get specific dependency
const expressDep = parser.getDependency(pkg, 'express');
```

#### LockFileParser

```typescript
import { LockFileParser } from './dist';

const parser = new LockFileParser();

// Parse package-lock.json or yarn.lock
const lockFile = parser.parseFile('./package-lock.json');

// Get resolved version for a package
const version = parser.getResolvedVersion(lockFile, 'express');

// Get all locked dependencies
const lockedDeps = parser.getAllLockedDependencies(lockFile);
```

#### DependencyResolver

```typescript
import { DependencyResolver } from './dist';

const resolver = new DependencyResolver();

// Parse version constraints
const constraint = resolver.parseVersionConstraint('^1.0.0');

// Check if version satisfies constraint
const satisfies = resolver.satisfies('1.2.3', '^1.0.0'); // true

// Find max version satisfying constraint
const versions = ['1.0.0', '1.5.0', '2.0.0'];
const max = resolver.maxSatisfying(versions, '^1.0.0'); // '1.5.0'

// Detect circular dependencies
const packageMap = new Map();
// ... populate packageMap
const circular = resolver.detectCircularDependencies(pkg, packageMap);

// Generate dependency tree
const tree = resolver.generateDependencyTree(pkg, packageMap);

// Format tree as string
const treeString = resolver.formatDependencyTree(tree);
console.log(treeString);

// Get all transitive dependencies
const transitive = resolver.getTransitiveDependencies(pkg, packageMap);
```

## API Documentation

### Types

#### Package

Represents a parsed npm package with all metadata and dependencies.

```typescript
interface Package {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  author?: string | { name: string; email?: string; url?: string };
  license?: string;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  peerDependencies: Dependency[];
  optionalDependencies: Dependency[];
  // ... more fields
}
```

#### Dependency

Represents a dependency with version constraints.

```typescript
interface Dependency {
  name: string;
  version: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  optional?: boolean;
  resolvedVersion?: string;
  dependencies?: Dependency[];
}
```

#### DependencyTreeNode

Represents a node in a dependency tree.

```typescript
interface DependencyTreeNode {
  name: string;
  version: string;
  children: DependencyTreeNode[];
  depth: number;
  circular?: boolean;
}
```

#### CircularDependency

Result of circular dependency detection.

```typescript
interface CircularDependency {
  chain: string[];
  description: string;
}
```

### Classes

#### JSParser

Main parser class that combines all parsers.

**Methods:**
- `getPackageParser()` - Get the package.json parser
- `getLockFileParser()` - Get the lock file parser
- `getResolver()` - Get the dependency resolver
- `parsePackageJson(filePath: string)` - Parse a package.json file
- `parseLockFile(filePath: string)` - Parse a lock file

#### PackageJsonParser

Parser for package.json files.

**Methods:**
- `parseFile(filePath: string): Package` - Parse from file
- `parse(content: string, filePath?: string): Package` - Parse from string
- `getAllDependencies(pkg: Package): Dependency[]` - Get all dependencies
- `getDependency(pkg: Package, name: string): Dependency | undefined` - Get specific dependency
- `hasDependency(pkg: Package, name: string): boolean` - Check if dependency exists

#### LockFileParser

Parser for lock files (package-lock.json and yarn.lock).

**Methods:**
- `parseFile(filePath: string): LockFile` - Parse from file (auto-detects type)
- `parsePackageLock(content: string): PackageLockFile` - Parse package-lock.json
- `parseYarnLock(content: string): YarnLockFile` - Parse yarn.lock
- `getResolvedVersion(lockFile: LockFile, packageName: string): string | undefined` - Get resolved version
- `getAllLockedDependencies(lockFile: LockFile): Map<string, string>` - Get all locked dependencies

#### DependencyResolver

Resolver for analyzing and resolving dependencies.

**Methods:**
- `parseVersionConstraint(constraint: string): VersionConstraint` - Parse version constraint
- `satisfies(version: string, constraint: string): boolean` - Check if version satisfies constraint
- `maxSatisfying(versions: string[], constraint: string): string | null` - Find max satisfying version
- `detectCircularDependencies(pkg: Package, packageMap: Map<string, Package>): CircularDependency[]` - Detect circular dependencies
- `generateDependencyTree(pkg: Package, packageMap: Map<string, Package>, includeDevDeps?: boolean, maxDepth?: number): DependencyTreeNode` - Generate dependency tree
- `formatDependencyTree(tree: DependencyTreeNode, prefix?: string): string` - Format tree as string
- `getTransitiveDependencies(pkg: Package, packageMap: Map<string, Package>, includeDevDeps?: boolean): Set<string>` - Get transitive dependencies

## Testing

The library includes comprehensive unit tests for all parsers and features.

```bash
npm test
```

Tests cover:
- ✅ Package.json parsing
- ✅ Dependency extraction (all types)
- ✅ Version constraint handling
- ✅ Lock file parsing (package-lock.json and yarn.lock)
- ✅ Circular dependency detection
- ✅ Dependency tree generation
- ✅ Semver resolution

## Example Output

### Dependency Tree

```
my-app@1.0.0
├── express@4.18.2
│   └── body-parser@1.20.1
└── lodash@4.17.21
```

### Circular Dependencies

```
Circular dependency detected: pkg-a → pkg-b → pkg-c → pkg-a
```

## Supported Formats

- **package.json** - Full support for all standard fields
- **package-lock.json** - Versions 1, 2, and 3
- **yarn.lock** - Yarn v1 format (simplified parser)

## Semver Support

The library uses the [semver](https://www.npmjs.com/package/semver) package for version resolution, supporting:
- Exact versions: `1.0.0`
- Caret ranges: `^1.0.0`
- Tilde ranges: `~1.0.0`
- Greater than: `>1.0.0`
- Less than: `<2.0.0`
- Ranges: `>=1.0.0 <2.0.0`
- And more

## Building

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory with type definitions.

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.

## Related Projects

- [PomWalker](../) - Maven POM parser (Java-based)
