import * as fs from 'fs';
import { PackageLockFile, YarnLockFile, LockFile, LockFileEntry } from '../types/LockFile';

/**
 * Parser for lock files (package-lock.json and yarn.lock)
 */
export class LockFileParser {
  /**
   * Parse a lock file from a file path
   * Automatically detects the lock file type
   */
  parseFile(filePath: string): LockFile {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (filePath.endsWith('yarn.lock')) {
      return this.parseYarnLock(content);
    } else if (filePath.endsWith('package-lock.json')) {
      return this.parsePackageLock(content);
    } else {
      throw new Error(`Unsupported lock file: ${filePath}`);
    }
  }

  /**
   * Parse package-lock.json content
   */
  parsePackageLock(content: string): PackageLockFile {
    const lockFile: PackageLockFile = JSON.parse(content);
    return lockFile;
  }

  /**
   * Parse yarn.lock content
   * Note: This is a simplified parser for yarn.lock format
   */
  parseYarnLock(content: string): YarnLockFile {
    const entries: Record<string, any> = {};
    const lines = content.split('\n');
    
    let currentPackage: string | null = null;
    let currentEntry: any = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }

      // Detect package declaration (no leading spaces and ends with colon)
      if (line.length > 0 && line[0] !== ' ' && line[0] !== '\t' && line.trim().endsWith(':')) {
        // Save previous entry if exists
        if (currentPackage && Object.keys(currentEntry).length > 0) {
          entries[currentPackage] = currentEntry;
        }
        
        // Start new entry - remove trailing colon
        currentPackage = line.trim().slice(0, -1);
        currentEntry = {};
      } 
      // Parse entry properties (with indentation)
      else if (line.trim() && currentPackage && (line[0] === ' ' || line[0] === '\t')) {
        const trimmed = line.trim();
        const colonIndex = trimmed.indexOf(' ');
        
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          let value = trimmed.substring(colonIndex + 1).trim();
          
          // Remove quotes
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          
          if (key === 'version' || key === 'resolved' || key === 'integrity') {
            currentEntry[key] = value;
          } else if (key === 'dependencies' || key === 'optionalDependencies') {
            currentEntry[key] = {};
          }
        }
      }
    }

    // Save last entry
    if (currentPackage && Object.keys(currentEntry).length > 0) {
      entries[currentPackage] = currentEntry;
    }

    return {
      type: 'yarn',
      entries
    };
  }

  /**
   * Get the resolved version for a package from the lock file
   */
  getResolvedVersion(lockFile: LockFile, packageName: string): string | undefined {
    if ('type' in lockFile && lockFile.type === 'yarn') {
      // Search in yarn lock entries
      for (const [key, entry] of Object.entries(lockFile.entries)) {
        if (key.startsWith(packageName + '@')) {
          return entry.version;
        }
      }
    } else {
      // Search in package-lock.json
      const pkgLock = lockFile as PackageLockFile;
      
      // Try dependencies first (v1 format)
      if (pkgLock.dependencies && pkgLock.dependencies[packageName]) {
        return pkgLock.dependencies[packageName].version;
      }
      
      // Try packages (v2+ format)
      if (pkgLock.packages) {
        const packageKey = `node_modules/${packageName}`;
        if (pkgLock.packages[packageKey]) {
          return pkgLock.packages[packageKey].version;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Get all locked dependencies
   */
  getAllLockedDependencies(lockFile: LockFile): Map<string, string> {
    const result = new Map<string, string>();

    if ('type' in lockFile && lockFile.type === 'yarn') {
      // Process yarn lock
      for (const [key, entry] of Object.entries(lockFile.entries)) {
        // Handle scoped packages (e.g., '@babel/core@^7.0.0')
        let packageName: string;
        if (key.startsWith('@')) {
          // Scoped package: find the second '@'
          const secondAtIndex = key.indexOf('@', 1);
          packageName = secondAtIndex > 0 ? key.substring(0, secondAtIndex) : key;
        } else {
          // Regular package
          const atIndex = key.indexOf('@');
          packageName = atIndex > 0 ? key.substring(0, atIndex) : key;
        }
        
        if (packageName && entry.version) {
          result.set(packageName, entry.version);
        }
      }
    } else {
      // Process package-lock.json
      const pkgLock = lockFile as PackageLockFile;
      
      if (pkgLock.dependencies) {
        for (const [name, entry] of Object.entries(pkgLock.dependencies)) {
          result.set(name, entry.version);
        }
      }
      
      if (pkgLock.packages) {
        for (const [path, entry] of Object.entries(pkgLock.packages)) {
          if (path.startsWith('node_modules/')) {
            const name = path.substring('node_modules/'.length);
            result.set(name, entry.version);
          }
        }
      }
    }

    return result;
  }
}
