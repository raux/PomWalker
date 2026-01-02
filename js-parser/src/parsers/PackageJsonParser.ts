import * as fs from 'fs';
import * as path from 'path';
import { Package } from '../types/Package';
import { Dependency } from '../types/Dependency';
import { PackageJson } from '../types/PackageJson';

/**
 * Parser for package.json files
 */
export class PackageJsonParser {
  /**
   * Parse a package.json file from a file path
   */
  parseFile(filePath: string): Package {
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parse(content, filePath);
  }

  /**
   * Parse a package.json from a string
   */
  parse(content: string, filePath?: string): Package {
    const json: PackageJson = JSON.parse(content);
    
    return {
      name: json.name,
      version: json.version,
      description: json.description,
      keywords: json.keywords,
      author: json.author,
      contributors: json.contributors,
      license: json.license,
      repository: json.repository,
      homepage: json.homepage,
      bugs: json.bugs,
      main: json.main,
      types: json.types || json.typings,
      scripts: json.scripts,
      dependencies: this.parseDependencies(json.dependencies, 'dependencies'),
      devDependencies: this.parseDependencies(json.devDependencies, 'devDependencies'),
      peerDependencies: this.parseDependencies(json.peerDependencies, 'peerDependencies'),
      optionalDependencies: this.parseDependencies(json.optionalDependencies, 'optionalDependencies'),
      workspaces: json.workspaces,
      private: json.private,
      engines: json.engines,
      filePath: filePath
    };
  }

  /**
   * Parse dependencies from a dependencies object
   */
  private parseDependencies(
    deps: Record<string, string> | undefined,
    type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'
  ): Dependency[] {
    if (!deps) {
      return [];
    }

    return Object.entries(deps).map(([name, version]) => ({
      name,
      version,
      type,
      optional: type === 'optionalDependencies'
    }));
  }

  /**
   * Extract all dependencies from a package (all types combined)
   */
  getAllDependencies(pkg: Package): Dependency[] {
    return [
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies
    ];
  }

  /**
   * Get dependency by name from a package
   */
  getDependency(pkg: Package, name: string): Dependency | undefined {
    return this.getAllDependencies(pkg).find(dep => dep.name === name);
  }

  /**
   * Check if a package has a specific dependency
   */
  hasDependency(pkg: Package, name: string): boolean {
    return this.getDependency(pkg, name) !== undefined;
  }
}
