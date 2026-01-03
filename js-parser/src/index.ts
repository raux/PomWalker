// Export types
export * from './types/Dependency';
export * from './types/Package';
export * from './types/PackageJson';
export * from './types/LockFile';

// Export parsers
export * from './parsers/PackageJsonParser';
export * from './parsers/LockFileParser';
export * from './parsers/DependencyResolver';

// Re-export for convenience
import { PackageJsonParser } from './parsers/PackageJsonParser';
import { LockFileParser } from './parsers/LockFileParser';
import { DependencyResolver } from './parsers/DependencyResolver';

/**
 * Main parser class that combines all parsers
 */
export class JSParser {
  private packageParser: PackageJsonParser;
  private lockFileParser: LockFileParser;
  private resolver: DependencyResolver;

  constructor() {
    this.packageParser = new PackageJsonParser();
    this.lockFileParser = new LockFileParser();
    this.resolver = new DependencyResolver();
  }

  /**
   * Get the package.json parser
   */
  getPackageParser(): PackageJsonParser {
    return this.packageParser;
  }

  /**
   * Get the lock file parser
   */
  getLockFileParser(): LockFileParser {
    return this.lockFileParser;
  }

  /**
   * Get the dependency resolver
   */
  getResolver(): DependencyResolver {
    return this.resolver;
  }

  /**
   * Parse a package.json file
   */
  parsePackageJson(filePath: string) {
    return this.packageParser.parseFile(filePath);
  }

  /**
   * Parse a lock file
   */
  parseLockFile(filePath: string) {
    return this.lockFileParser.parseFile(filePath);
  }
}
