/**
 * Represents a lock file entry
 */
export interface LockFileEntry {
  /** The resolved version */
  version: string;
  
  /** The resolved package location/URL */
  resolved?: string;
  
  /** Integrity hash */
  integrity?: string;
  
  /** Dependencies of this locked package */
  dependencies?: Record<string, string>;
  
  /** Whether this dependency is optional */
  optional?: boolean;
  
  /** Whether this dependency is a dev dependency */
  dev?: boolean;
}

/**
 * Represents a parsed lock file (package-lock.json)
 */
export interface PackageLockFile {
  /** Lock file format version */
  lockfileVersion: number;
  
  /** Package name */
  name: string;
  
  /** Package version */
  version: string;
  
  /** Whether package-lock.json should be committed */
  requires?: boolean;
  
  /** Locked packages (flat structure in v1) */
  dependencies?: Record<string, LockFileEntry>;
  
  /** Locked packages (nested structure in v2+) */
  packages?: Record<string, LockFileEntry & { 
    name?: string;
    license?: string;
    engines?: Record<string, string>;
  }>;
}

/**
 * Represents a Yarn lock file entry
 */
export interface YarnLockEntry {
  /** The resolved version */
  version: string;
  
  /** The resolved package URL */
  resolved?: string;
  
  /** Integrity hash */
  integrity?: string;
  
  /** Dependencies */
  dependencies?: Record<string, string>;
  
  /** Optional dependencies */
  optionalDependencies?: Record<string, string>;
}

/**
 * Represents a parsed Yarn lock file
 */
export interface YarnLockFile {
  /** Type identifier */
  type: 'yarn';
  
  /** Yarn version */
  version?: string;
  
  /** All locked packages */
  entries: Record<string, YarnLockEntry>;
}

/**
 * Union type for all supported lock file formats
 */
export type LockFile = PackageLockFile | YarnLockFile;
