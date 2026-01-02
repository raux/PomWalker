import * as semver from 'semver';
import { Package } from '../types/Package';
import { Dependency, VersionConstraint } from '../types/Dependency';

/**
 * Result of circular dependency detection
 */
export interface CircularDependency {
  /** The circular dependency chain */
  chain: string[];
  
  /** Human-readable description */
  description: string;
}

/**
 * Node in a dependency tree
 */
export interface DependencyTreeNode {
  /** Package name */
  name: string;
  
  /** Package version */
  version: string;
  
  /** Child dependencies */
  children: DependencyTreeNode[];
  
  /** Depth in the tree */
  depth: number;
  
  /** Whether this node is circular */
  circular?: boolean;
}

/**
 * Resolver for analyzing and resolving dependencies
 */
export class DependencyResolver {
  /**
   * Parse a version constraint string
   */
  parseVersionConstraint(constraint: string): VersionConstraint {
    // Handle exact versions
    const cleanVersion = semver.clean(constraint);
    if (cleanVersion) {
      return {
        constraint,
        exact: true,
        min: cleanVersion,
        max: cleanVersion
      };
    }

    // Handle ranges
    const range = semver.validRange(constraint);
    if (range) {
      return {
        constraint,
        exact: false
      };
    }

    // Return as-is for unrecognized formats
    return {
      constraint,
      exact: false
    };
  }

  /**
   * Check if a version satisfies a constraint
   */
  satisfies(version: string, constraint: string): boolean {
    try {
      return semver.satisfies(version, constraint);
    } catch (e) {
      return false;
    }
  }

  /**
   * Find the maximum version that satisfies a constraint from a list
   */
  maxSatisfying(versions: string[], constraint: string): string | null {
    return semver.maxSatisfying(versions, constraint);
  }

  /**
   * Detect circular dependencies in a package
   * Returns an array of circular dependency chains
   */
  detectCircularDependencies(
    pkg: Package,
    packageMap: Map<string, Package>
  ): CircularDependency[] {
    const circularDeps: CircularDependency[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (packageName: string, chain: string[]) => {
      if (visiting.has(packageName)) {
        // Found a cycle
        const cycleStart = chain.indexOf(packageName);
        const cycle = [...chain.slice(cycleStart), packageName];
        circularDeps.push({
          chain: cycle,
          description: cycle.join(' → ')
        });
        return;
      }

      if (visited.has(packageName)) {
        return;
      }

      visiting.add(packageName);
      chain.push(packageName);

      const currentPkg = packageMap.get(packageName);
      if (currentPkg) {
        const allDeps = [
          ...currentPkg.dependencies,
          ...currentPkg.devDependencies,
          ...currentPkg.peerDependencies,
          ...currentPkg.optionalDependencies
        ];

        for (const dep of allDeps) {
          if (packageMap.has(dep.name)) {
            visit(dep.name, [...chain]);
          }
        }
      }

      visiting.delete(packageName);
      visited.add(packageName);
    };

    visit(pkg.name, []);
    return circularDeps;
  }

  /**
   * Generate a dependency tree for a package
   */
  generateDependencyTree(
    pkg: Package,
    packageMap: Map<string, Package>,
    includeDevDeps: boolean = false,
    maxDepth: number = 10
  ): DependencyTreeNode {
    const visited = new Set<string>();

    const buildTree = (
      packageName: string,
      version: string,
      depth: number
    ): DependencyTreeNode => {
      const node: DependencyTreeNode = {
        name: packageName,
        version,
        children: [],
        depth
      };

      // Check if we've already visited this package (circular dependency)
      const visitKey = `${packageName}@${version}`;
      if (visited.has(visitKey) || depth >= maxDepth) {
        node.circular = visited.has(visitKey);
        return node;
      }

      visited.add(visitKey);

      const currentPkg = packageMap.get(packageName);
      if (currentPkg) {
        let deps = [...currentPkg.dependencies];
        
        if (includeDevDeps) {
          deps = [...deps, ...currentPkg.devDependencies];
        }

        for (const dep of deps) {
          const childPkg = packageMap.get(dep.name);
          if (childPkg) {
            const childNode = buildTree(dep.name, childPkg.version, depth + 1);
            node.children.push(childNode);
          }
        }
      }

      return node;
    };

    return buildTree(pkg.name, pkg.version, 0);
  }

  /**
   * Format a dependency tree as a string
   */
  formatDependencyTree(tree: DependencyTreeNode, prefix: string = '', isRoot: boolean = true): string {
    let result = '';
    
    // Add current node
    if (isRoot) {
      result = `${tree.name}@${tree.version}`;
    } else {
      result = `${prefix}${tree.name}@${tree.version}`;
    }
    
    if (tree.circular) {
      result += ' [CIRCULAR]';
    }
    
    result += '\n';

    // Add children
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];
      const isLast = i === tree.children.length - 1;
      const childPrefix = (isRoot ? '' : prefix) + (isLast ? '└── ' : '├── ');
      const grandchildPrefix = (isRoot ? '' : prefix) + (isLast ? '    ' : '│   ');
      
      result += this.formatDependencyTree(child, grandchildPrefix, false);
    }

    return result;
  }

  /**
   * Get all transitive dependencies (flattened)
   */
  getTransitiveDependencies(
    pkg: Package,
    packageMap: Map<string, Package>,
    includeDevDeps: boolean = false
  ): Set<string> {
    const result = new Set<string>();
    const visited = new Set<string>();

    const visit = (packageName: string) => {
      if (visited.has(packageName)) {
        return;
      }
      visited.add(packageName);

      const currentPkg = packageMap.get(packageName);
      if (currentPkg) {
        let deps = [...currentPkg.dependencies];
        
        if (includeDevDeps) {
          deps = [...deps, ...currentPkg.devDependencies];
        }

        for (const dep of deps) {
          result.add(dep.name);
          visit(dep.name);
        }
      }
    };

    visit(pkg.name);
    return result;
  }
}
