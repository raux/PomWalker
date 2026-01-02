/**
 * Represents the structure of a package.json file
 */
export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  author?: string | { name: string; email?: string; url?: string };
  contributors?: Array<string | { name: string; email?: string; url?: string }>;
  license?: string;
  repository?: string | { type: string; url: string };
  homepage?: string;
  bugs?: string | { url?: string; email?: string };
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  bundledDependencies?: string[];
  workspaces?: string[] | { packages: string[] };
  private?: boolean;
  engines?: Record<string, string>;
  os?: string[];
  cpu?: string[];
  publishConfig?: Record<string, any>;
  [key: string]: any; // Allow additional fields
}
