import { Dependency } from './Dependency';

/**
 * Represents a parsed npm package
 */
export interface Package {
  /** The package name */
  name: string;
  
  /** The package version */
  version: string;
  
  /** Package description */
  description?: string;
  
  /** Package keywords */
  keywords?: string[];
  
  /** Package author */
  author?: string | { name: string; email?: string; url?: string };
  
  /** Package contributors */
  contributors?: Array<string | { name: string; email?: string; url?: string }>;
  
  /** Package license */
  license?: string;
  
  /** Repository information */
  repository?: string | { type: string; url: string };
  
  /** Homepage URL */
  homepage?: string;
  
  /** Bugs/issues URL */
  bugs?: string | { url?: string; email?: string };
  
  /** Main entry point */
  main?: string;
  
  /** TypeScript types entry point */
  types?: string;
  
  /** Package scripts */
  scripts?: Record<string, string>;
  
  /** Production dependencies */
  dependencies: Dependency[];
  
  /** Development dependencies */
  devDependencies: Dependency[];
  
  /** Peer dependencies */
  peerDependencies: Dependency[];
  
  /** Optional dependencies */
  optionalDependencies: Dependency[];
  
  /** Workspace configuration for monorepos */
  workspaces?: string[] | { packages: string[] };
  
  /** Whether this is a private package */
  private?: boolean;
  
  /** Engines specification */
  engines?: Record<string, string>;
  
  /** The file path to the package.json */
  filePath?: string;
}
