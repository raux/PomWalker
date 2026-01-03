/**
 * Represents a dependency in a package.json file
 */
export interface Dependency {
  /** The name of the dependency package */
  name: string;
  
  /** The version constraint (e.g., "^1.0.0", "~2.3.4", ">=1.2.3 <2.0.0") */
  version: string;
  
  /** The type of dependency */
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
  
  /** Whether this dependency is optional */
  optional?: boolean;
  
  /** The resolved version from lock file, if available */
  resolvedVersion?: string;
  
  /** Transitive dependencies of this package */
  dependencies?: Dependency[];
}

/**
 * Represents version constraint information
 */
export interface VersionConstraint {
  /** The original semver string */
  constraint: string;
  
  /** Minimum version (if specified) */
  min?: string;
  
  /** Maximum version (if specified) */
  max?: string;
  
  /** Whether the constraint is exact */
  exact: boolean;
}
