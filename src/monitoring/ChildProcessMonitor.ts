import { BaseMonitor } from './BaseMonitor';

const child_process = require('child_process');

export class ChildProcessMonitor extends BaseMonitor {
  private originalExec: any = null;
  private originalExecSync: any = null;
  private originalSpawn: any = null;
  private originalSpawnSync: any = null;
  private originalExecFile: any = null;
  private originalExecFileSync: any = null;
  private originalFork: any = null;

  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorExec();
    this.monitorExecSync();
    this.monitorSpawn();
    this.monitorSpawnSync();
    this.monitorExecFile();
    this.monitorExecFileSync();
    this.monitorFork();
  }

  private monitorExec() {
    const self = this;
    this.originalExec = child_process.exec;
    const original = this.originalExec;

    child_process.exec = function(
      command: string,
      optionsOrCallback?: any,
      callback?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const commandInfo = self.parseCommand(command);

      self.addLog('process', 'child_process.exec', {
        command: commandInfo.executable,
        args: commandInfo.args,
        fullCommand: command,
        isDangerous: self.isDangerousCommand(command),
        isSuspicious: self.isSuspiciousCommand(command),
      }, pluginName);

      return original.call(child_process, command, optionsOrCallback, callback);
    };
  }

  private monitorExecSync() {
    const self = this;
    this.originalExecSync = child_process.execSync;
    const original = this.originalExecSync;

    child_process.execSync = function(
      command: string,
      options?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const commandInfo = self.parseCommand(command);

      self.addLog('process', 'child_process.execSync', {
        command: commandInfo.executable,
        args: commandInfo.args,
        fullCommand: command,
        isDangerous: self.isDangerousCommand(command),
        isSuspicious: self.isSuspiciousCommand(command),
      }, pluginName);

      return original.call(child_process, command, options);
    };
  }

  private monitorSpawn() {
    const self = this;
    this.originalSpawn = child_process.spawn;
    const original = this.originalSpawn;

    child_process.spawn = function(
      command: string,
      argsOrOptions?: any,
      options?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
      const fullCommand = [command, ...args].join(' ');

      self.addLog('process', 'child_process.spawn', {
        command,
        args,
        fullCommand,
        isDangerous: self.isDangerousCommand(fullCommand),
        isSuspicious: self.isSuspiciousCommand(fullCommand),
      }, pluginName);

      return original.call(child_process, command, argsOrOptions, options);
    };
  }

  private monitorSpawnSync() {
    const self = this;
    this.originalSpawnSync = child_process.spawnSync;
    const original = this.originalSpawnSync;

    child_process.spawnSync = function(
      command: string,
      argsOrOptions?: any,
      options?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
      const fullCommand = [command, ...args].join(' ');

      self.addLog('process', 'child_process.spawnSync', {
        command,
        args,
        fullCommand,
        isDangerous: self.isDangerousCommand(fullCommand),
        isSuspicious: self.isSuspiciousCommand(fullCommand),
      }, pluginName);

      return original.call(child_process, command, argsOrOptions, options);
    };
  }

  private monitorExecFile() {
    const self = this;
    this.originalExecFile = child_process.execFile;
    const original = this.originalExecFile;

    child_process.execFile = function(
      file: string,
      argsOrOptionsOrCallback?: any,
      optionsOrCallback?: any,
      callback?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const args = Array.isArray(argsOrOptionsOrCallback) ? argsOrOptionsOrCallback : [];
      const fullCommand = [file, ...args].join(' ');

      self.addLog('process', 'child_process.execFile', {
        command: file,
        args,
        fullCommand,
        isDangerous: self.isDangerousCommand(fullCommand),
        isSuspicious: self.isSuspiciousCommand(fullCommand),
      }, pluginName);

      return original.call(child_process, file, argsOrOptionsOrCallback, optionsOrCallback, callback);
    };
  }

  private monitorExecFileSync() {
    const self = this;
    this.originalExecFileSync = child_process.execFileSync;
    const original = this.originalExecFileSync;

    child_process.execFileSync = function(
      file: string,
      argsOrOptions?: any,
      options?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
      const fullCommand = [file, ...args].join(' ');

      self.addLog('process', 'child_process.execFileSync', {
        command: file,
        args,
        fullCommand,
        isDangerous: self.isDangerousCommand(fullCommand),
        isSuspicious: self.isSuspiciousCommand(fullCommand),
      }, pluginName);

      return original.call(child_process, file, argsOrOptions, options);
    };
  }

  private monitorFork() {
    const self = this;
    this.originalFork = child_process.fork;
    const original = this.originalFork;

    child_process.fork = function(
      modulePath: string,
      argsOrOptions?: any,
      options?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];

      self.addLog('process', 'child_process.fork', {
        modulePath,
        args,
        isDangerous: false,
        isSuspicious: self.isSuspiciousPath(modulePath),
      }, pluginName);

      return original.call(child_process, modulePath, argsOrOptions, options);
    };
  }

  private parseCommand(command: string): { executable: string; args: string[] } {
    const parts = command.trim().split(/\s+/);
    return {
      executable: parts[0] || '',
      args: parts.slice(1),
    };
  }

  private isDangerousCommand(command: string): boolean {
    const dangerousPatterns = [
      // File system destruction
      /\brm\s+(-rf?|--recursive|--force)/i,
      /\brmdir\b/i,
      /\bdel\s+\/[sf]/i, // Windows del
      /\bformat\b/i,
      /\bmkfs\b/i,
      /\bdd\s+if=/i,

      // System modification
      /\bchmod\s+[0-7]{3,4}/i,
      /\bchown\b/i,
      /\bsudo\b/i,
      /\bsu\s/i,

      // Network exfiltration
      /\bcurl\b.*(-d|--data|-X\s*POST)/i,
      /\bwget\b/i,
      /\bnc\s+-[elp]/i, // netcat
      /\bscp\b/i,
      /\brsync\b/i,

      // Code execution
      /\beval\b/i,
      /\bpython\s+-c/i,
      /\bnode\s+-e/i,
      /\bperl\s+-e/i,
      /\bruby\s+-e/i,
      /\bpowershell\b/i,
      /\bcmd\.exe\b/i,

      // Process manipulation
      /\bkill\s+-9/i,
      /\bpkill\b/i,
      /\bkillall\b/i,

      // Credential access
      /\bpasswd\b/i,
      /\/etc\/shadow/i,
      /\/etc\/passwd/i,

      // Persistence
      /\bcrontab\b/i,
      /\bsystemctl\s+(enable|start)/i,
      /\blaunchctl\b/i,
    ];

    return dangerousPatterns.some(pattern => pattern.test(command));
  }

  private isSuspiciousCommand(command: string): boolean {
    const suspiciousPatterns = [
      // Information gathering
      /\bwhoami\b/i,
      /\bid\b/i,
      /\buname\b/i,
      /\bhostname\b/i,
      /\bifconfig\b/i,
      /\bip\s+addr/i,
      /\bnetstat\b/i,
      /\bps\s+(aux|ef)/i,
      /\benv\b/i,
      /\bprintenv\b/i,
      /\bset\b/i,

      // File enumeration
      /\bfind\s+.*-name/i,
      /\blocate\b/i,
      /\bls\s+.*-la/i,

      // Encoding/obfuscation
      /\bbase64\b/i,
      /\bxxd\b/i,
      /\bopenssl\b/i,

      // Network scanning
      /\bnmap\b/i,
      /\bping\b/i,
      /\btraceroute\b/i,
      /\bdig\b/i,
      /\bnslookup\b/i,

      // SSH/remote access
      /\bssh\b/i,
      /\btelnet\b/i,

      // Git (possible data exfil)
      /\bgit\s+(push|clone|remote)/i,

      // Archives
      /\btar\b.*(-[cz]|--create)/i,
      /\bzip\b/i,
      /\bgzip\b/i,

      // Screen/clipboard
      /\bscreencapture\b/i,
      /\bxclip\b/i,
      /\bpbcopy\b/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(command));
  }

  private isSuspiciousPath(path: string): boolean {
    const suspiciousPatterns = [
      /\.ssh/i,
      /\.aws/i,
      /\.gnupg/i,
      /credentials/i,
      /secrets/i,
      /password/i,
      /token/i,
      /\.env/i,
      /\/tmp\//i,
      /\/var\/tmp\//i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(path));
  }

  override restore() {
    if (this.originalExec) {
      child_process.exec = this.originalExec;
    }
    if (this.originalExecSync) {
      child_process.execSync = this.originalExecSync;
    }
    if (this.originalSpawn) {
      child_process.spawn = this.originalSpawn;
    }
    if (this.originalSpawnSync) {
      child_process.spawnSync = this.originalSpawnSync;
    }
    if (this.originalExecFile) {
      child_process.execFile = this.originalExecFile;
    }
    if (this.originalExecFileSync) {
      child_process.execFileSync = this.originalExecFileSync;
    }
    if (this.originalFork) {
      child_process.fork = this.originalFork;
    }
  }
}
