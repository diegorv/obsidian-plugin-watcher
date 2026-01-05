import { BaseMonitor } from './BaseMonitor';

const fs = require('fs');

export class NodeFsMonitor extends BaseMonitor {
  private originalReadFileSync: any = null;
  private originalReadFile: any = null;
  private originalWriteFileSync: any = null;
  private originalWriteFile: any = null;
  private originalExistsSync: any = null;
  private originalStatSync: any = null;
  private originalReaddirSync: any = null;
  private originalReaddir: any = null;

  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorReadFileSync();
    this.monitorReadFile();
    this.monitorWriteFileSync();
    this.monitorWriteFile();
    this.monitorExistsSync();
    this.monitorStatSync();
    this.monitorReaddirSync();
    this.monitorReaddir();
  }

  private monitorReadFileSync() {
    const self = this;
    this.originalReadFileSync = fs.readFileSync;
    const original = this.originalReadFileSync;

    fs.readFileSync = function(path: any, options?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);
      const startTime = performance.now();

      try {
        const result = original.call(fs, path, options);
        const endTime = performance.now();

        self.addLog('nodejs', 'fs.readFileSync', {
          path: pathStr,
          encoding: typeof options === 'string' ? options : options?.encoding || 'buffer',
          size: typeof result === 'string' ? result.length : result.length,
          readTime: Math.round(endTime - startTime),
          isExternalFile: !pathStr.includes('.obsidian') && !pathStr.includes('node_modules'),
          isSensitivePath: self.isSensitivePath(pathStr),
        }, pluginName);

        return result;
      } catch (error: any) {
        self.addLog('nodejs', 'fs.readFileSync-error', {
          path: pathStr,
          error: error.message || String(error),
        }, pluginName);
        throw error;
      }
    };
  }

  private monitorReadFile() {
    const self = this;
    this.originalReadFile = fs.readFile;
    const original = this.originalReadFile;

    fs.readFile = function(path: any, optionsOrCallback: any, callback?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);
      const startTime = performance.now();

      const actualCallback = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
      const options = typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback;

      const wrappedCallback = (err: any, data: any) => {
        const endTime = performance.now();

        if (err) {
          self.addLog('nodejs', 'fs.readFile-error', {
            path: pathStr,
            error: err.message,
          }, pluginName);
        } else {
          self.addLog('nodejs', 'fs.readFile', {
            path: pathStr,
            encoding: typeof options === 'string' ? options : options?.encoding || 'buffer',
            size: typeof data === 'string' ? data.length : data.length,
            readTime: Math.round(endTime - startTime),
            isExternalFile: !pathStr.includes('.obsidian') && !pathStr.includes('node_modules'),
            isSensitivePath: self.isSensitivePath(pathStr),
          }, pluginName);
        }

        if (actualCallback) actualCallback(err, data);
      };

      if (typeof optionsOrCallback === 'function') {
        return original.call(fs, path, wrappedCallback);
      } else {
        return original.call(fs, path, options, wrappedCallback);
      }
    };
  }

  private monitorWriteFileSync() {
    const self = this;
    this.originalWriteFileSync = fs.writeFileSync;
    const original = this.originalWriteFileSync;

    fs.writeFileSync = function(path: any, data: any, options?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);
      const startTime = performance.now();

      try {
        const result = original.call(fs, path, data, options);
        const endTime = performance.now();

        self.addLog('nodejs', 'fs.writeFileSync', {
          path: pathStr,
          size: typeof data === 'string' ? data.length : data.byteLength,
          writeTime: Math.round(endTime - startTime),
          isExternalFile: !pathStr.includes('.obsidian') && !pathStr.includes('node_modules'),
          isSensitivePath: self.isSensitivePath(pathStr),
        }, pluginName);

        return result;
      } catch (error: any) {
        self.addLog('nodejs', 'fs.writeFileSync-error', {
          path: pathStr,
          error: error.message || String(error),
        }, pluginName);
        throw error;
      }
    };
  }

  private monitorWriteFile() {
    const self = this;
    this.originalWriteFile = fs.writeFile;
    const original = this.originalWriteFile;

    fs.writeFile = function(path: any, data: any, optionsOrCallback: any, callback?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);
      const startTime = performance.now();

      const actualCallback = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
      const options = typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback;

      const wrappedCallback = (err: any) => {
        const endTime = performance.now();

        if (err) {
          self.addLog('nodejs', 'fs.writeFile-error', {
            path: pathStr,
            error: err.message,
          }, pluginName);
        } else {
          self.addLog('nodejs', 'fs.writeFile', {
            path: pathStr,
            size: typeof data === 'string' ? data.length : data.byteLength,
            writeTime: Math.round(endTime - startTime),
            isExternalFile: !pathStr.includes('.obsidian') && !pathStr.includes('node_modules'),
            isSensitivePath: self.isSensitivePath(pathStr),
          }, pluginName);
        }

        if (actualCallback) actualCallback(err);
      };

      if (typeof optionsOrCallback === 'function') {
        return original.call(fs, path, data, wrappedCallback);
      } else {
        return original.call(fs, path, data, options, wrappedCallback);
      }
    };
  }

  private monitorExistsSync() {
    const self = this;
    this.originalExistsSync = fs.existsSync;
    const original = this.originalExistsSync;

    fs.existsSync = function(path: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);

      const result = original.call(fs, path);

      if (self.isSensitivePath(pathStr) || (!pathStr.includes('.obsidian') && !pathStr.includes('node_modules'))) {
        self.addLog('nodejs', 'fs.existsSync', {
          path: pathStr,
          exists: result,
          isSensitivePath: self.isSensitivePath(pathStr),
        }, pluginName);
      }

      return result;
    };
  }

  private monitorStatSync() {
    const self = this;
    this.originalStatSync = fs.statSync;
    const original = this.originalStatSync;

    fs.statSync = function(path: any, options?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);

      try {
        const result = original.call(fs, path, options);

        if (self.isSensitivePath(pathStr) || (!pathStr.includes('.obsidian') && !pathStr.includes('node_modules'))) {
          self.addLog('nodejs', 'fs.statSync', {
            path: pathStr,
            isFile: result.isFile(),
            isDirectory: result.isDirectory(),
            size: result.size,
            isSensitivePath: self.isSensitivePath(pathStr),
          }, pluginName);
        }

        return result;
      } catch (error: any) {
        self.addLog('nodejs', 'fs.statSync-error', {
          path: pathStr,
          error: error.message || String(error),
        }, pluginName);
        throw error;
      }
    };
  }

  private monitorReaddirSync() {
    const self = this;
    this.originalReaddirSync = fs.readdirSync;
    const original = this.originalReaddirSync;

    fs.readdirSync = function(path: any, options?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);

      try {
        const result = original.call(fs, path, options);

        if (self.isSensitivePath(pathStr) || (!pathStr.includes('.obsidian') && !pathStr.includes('node_modules'))) {
          self.addLog('nodejs', 'fs.readdirSync', {
            path: pathStr,
            itemCount: Array.isArray(result) ? result.length : 0,
            isSensitivePath: self.isSensitivePath(pathStr),
          }, pluginName);
        }

        return result;
      } catch (error: any) {
        self.addLog('nodejs', 'fs.readdirSync-error', {
          path: pathStr,
          error: error.message || String(error),
        }, pluginName);
        throw error;
      }
    };
  }

  private monitorReaddir() {
    const self = this;
    this.originalReaddir = fs.readdir;
    const original = this.originalReaddir;

    fs.readdir = function(path: any, optionsOrCallback: any, callback?: any) {
      const pluginName = self.detectPluginFromStack();
      const pathStr = String(path);

      const actualCallback = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
      const options = typeof optionsOrCallback === 'function' ? undefined : optionsOrCallback;

      const wrappedCallback = (err: any, files: any) => {
        if (err) {
          self.addLog('nodejs', 'fs.readdir-error', {
            path: pathStr,
            error: err.message,
          }, pluginName);
        } else if (self.isSensitivePath(pathStr) || (!pathStr.includes('.obsidian') && !pathStr.includes('node_modules'))) {
          self.addLog('nodejs', 'fs.readdir', {
            path: pathStr,
            itemCount: Array.isArray(files) ? files.length : 0,
            isSensitivePath: self.isSensitivePath(pathStr),
          }, pluginName);
        }

        if (actualCallback) actualCallback(err, files);
      };

      if (typeof optionsOrCallback === 'function') {
        return original.call(fs, path, wrappedCallback);
      } else {
        return original.call(fs, path, options, wrappedCallback);
      }
    };
  }

  private isSensitivePath(path: string): boolean {
    const sensitivePaths = [
      '.ssh', '.aws', '.gnupg', '.gitconfig', '.bashrc', '.zshrc',
      '.profile', '.npmrc', '.netrc', 'credentials', 'secrets',
      'password', 'token', 'private', 'id_rsa', 'id_ed25519',
      'id_ecdsa', '.env', 'config.json', 'settings.json',
    ];

    const lowerPath = path.toLowerCase();
    return sensitivePaths.some(sensitive => lowerPath.includes(sensitive));
  }

  override restore() {
    if (this.originalReadFileSync) fs.readFileSync = this.originalReadFileSync;
    if (this.originalReadFile) fs.readFile = this.originalReadFile;
    if (this.originalWriteFileSync) fs.writeFileSync = this.originalWriteFileSync;
    if (this.originalWriteFile) fs.writeFile = this.originalWriteFile;
    if (this.originalExistsSync) fs.existsSync = this.originalExistsSync;
    if (this.originalStatSync) fs.statSync = this.originalStatSync;
    if (this.originalReaddirSync) fs.readdirSync = this.originalReaddirSync;
    if (this.originalReaddir) fs.readdir = this.originalReaddir;
  }
}
