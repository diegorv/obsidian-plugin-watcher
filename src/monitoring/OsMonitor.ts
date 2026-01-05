import { BaseMonitor } from './BaseMonitor';

const os = require('os');

export class OsMonitor extends BaseMonitor {
  private originalHomedir: any = null;
  private originalUserInfo: any = null;
  private originalHostname: any = null;
  private originalPlatform: any = null;
  private originalArch: any = null;
  private originalRelease: any = null;
  private originalType: any = null;
  private originalTmpdir: any = null;
  private originalNetworkInterfaces: any = null;
  private originalCpus: any = null;
  private originalTotalmem: any = null;
  private originalFreemem: any = null;
  private originalUptime: any = null;
  private originalLoadavg: any = null;

  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorHomedir();
    this.monitorUserInfo();
    this.monitorHostname();
    this.monitorPlatform();
    this.monitorArch();
    this.monitorRelease();
    this.monitorType();
    this.monitorTmpdir();
    this.monitorNetworkInterfaces();
    this.monitorCpus();
    this.monitorTotalmem();
    this.monitorFreemem();
    this.monitorUptime();
    this.monitorLoadavg();
  }

  private monitorHomedir() {
    const self = this;
    this.originalHomedir = os.homedir;
    const original = this.originalHomedir;

    os.homedir = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.homedir', {
        result,
        isSensitive: true,
      }, pluginName);

      return result;
    };
  }

  private monitorUserInfo() {
    const self = this;
    this.originalUserInfo = os.userInfo;
    const original = this.originalUserInfo;

    os.userInfo = function(options?: any) {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os, options);

      self.addLog('nodejs', 'os.userInfo', {
        username: result.username,
        uid: result.uid,
        gid: result.gid,
        shell: result.shell,
        homedir: result.homedir,
        isSensitive: true,
      }, pluginName);

      return result;
    };
  }

  private monitorHostname() {
    const self = this;
    this.originalHostname = os.hostname;
    const original = this.originalHostname;

    os.hostname = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.hostname', {
        result,
        isSensitive: true,
      }, pluginName);

      return result;
    };
  }

  private monitorPlatform() {
    const self = this;
    this.originalPlatform = os.platform;
    const original = this.originalPlatform;

    os.platform = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.platform', {
        result,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorArch() {
    const self = this;
    this.originalArch = os.arch;
    const original = this.originalArch;

    os.arch = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.arch', {
        result,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorRelease() {
    const self = this;
    this.originalRelease = os.release;
    const original = this.originalRelease;

    os.release = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.release', {
        result,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorType() {
    const self = this;
    this.originalType = os.type;
    const original = this.originalType;

    os.type = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.type', {
        result,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorTmpdir() {
    const self = this;
    this.originalTmpdir = os.tmpdir;
    const original = this.originalTmpdir;

    os.tmpdir = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.tmpdir', {
        result,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorNetworkInterfaces() {
    const self = this;
    this.originalNetworkInterfaces = os.networkInterfaces;
    const original = this.originalNetworkInterfaces;

    os.networkInterfaces = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      const interfaceNames = result ? Object.keys(result) : [];
      const ipAddresses = result
        ? Object.values(result)
          .flat()
          .filter((iface: any) => iface && !iface.internal)
          .map((iface: any) => ({ family: iface.family, address: iface.address }))
        : [];

      self.addLog('nodejs', 'os.networkInterfaces', {
        interfaceCount: interfaceNames.length,
        interfaces: interfaceNames,
        externalIpCount: ipAddresses.length,
        isSensitive: true,
      }, pluginName);

      return result;
    };
  }

  private monitorCpus() {
    const self = this;
    this.originalCpus = os.cpus;
    const original = this.originalCpus;

    os.cpus = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.cpus', {
        cpuCount: result.length,
        model: result[0]?.model,
        speed: result[0]?.speed,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorTotalmem() {
    const self = this;
    this.originalTotalmem = os.totalmem;
    const original = this.originalTotalmem;

    os.totalmem = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.totalmem', {
        bytes: result,
        gigabytes: Math.round(result / (1024 * 1024 * 1024) * 100) / 100,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorFreemem() {
    const self = this;
    this.originalFreemem = os.freemem;
    const original = this.originalFreemem;

    os.freemem = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.freemem', {
        bytes: result,
        gigabytes: Math.round(result / (1024 * 1024 * 1024) * 100) / 100,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorUptime() {
    const self = this;
    this.originalUptime = os.uptime;
    const original = this.originalUptime;

    os.uptime = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.uptime', {
        seconds: result,
        hours: Math.round(result / 3600 * 100) / 100,
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  private monitorLoadavg() {
    const self = this;
    this.originalLoadavg = os.loadavg;
    const original = this.originalLoadavg;

    os.loadavg = function() {
      const pluginName = self.detectPluginFromStack();
      const result = original.call(os);

      self.addLog('nodejs', 'os.loadavg', {
        load1min: result[0],
        load5min: result[1],
        load15min: result[2],
        isSensitive: false,
      }, pluginName);

      return result;
    };
  }

  override restore() {
    if (this.originalHomedir) os.homedir = this.originalHomedir;
    if (this.originalUserInfo) os.userInfo = this.originalUserInfo;
    if (this.originalHostname) os.hostname = this.originalHostname;
    if (this.originalPlatform) os.platform = this.originalPlatform;
    if (this.originalArch) os.arch = this.originalArch;
    if (this.originalRelease) os.release = this.originalRelease;
    if (this.originalType) os.type = this.originalType;
    if (this.originalTmpdir) os.tmpdir = this.originalTmpdir;
    if (this.originalNetworkInterfaces) os.networkInterfaces = this.originalNetworkInterfaces;
    if (this.originalCpus) os.cpus = this.originalCpus;
    if (this.originalTotalmem) os.totalmem = this.originalTotalmem;
    if (this.originalFreemem) os.freemem = this.originalFreemem;
    if (this.originalUptime) os.uptime = this.originalUptime;
    if (this.originalLoadavg) os.loadavg = this.originalLoadavg;
  }
}
