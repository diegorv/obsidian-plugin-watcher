import { ChildProcessMonitor } from '../../src/monitoring/ChildProcessMonitor';

describe('ChildProcessMonitor', () => {
  let mockPlugin: any;
  let childProcessMonitor: ChildProcessMonitor;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    childProcessMonitor = new ChildProcessMonitor(mockPlugin);
  });

  afterEach(() => {
    childProcessMonitor.restore();
  });

  describe('constructor', () => {
    it('should initialize with plugin', () => {
      expect(childProcessMonitor).toBeInstanceOf(ChildProcessMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorExecSpy = jest.spyOn(childProcessMonitor as any, 'monitorExec');
      const monitorExecSyncSpy = jest.spyOn(childProcessMonitor as any, 'monitorExecSync');
      const monitorSpawnSpy = jest.spyOn(childProcessMonitor as any, 'monitorSpawn');
      const monitorSpawnSyncSpy = jest.spyOn(childProcessMonitor as any, 'monitorSpawnSync');
      const monitorExecFileSpy = jest.spyOn(childProcessMonitor as any, 'monitorExecFile');
      const monitorExecFileSyncSpy = jest.spyOn(childProcessMonitor as any, 'monitorExecFileSync');
      const monitorForkSpy = jest.spyOn(childProcessMonitor as any, 'monitorFork');

      childProcessMonitor.initialize();

      expect(monitorExecSpy).toHaveBeenCalled();
      expect(monitorExecSyncSpy).toHaveBeenCalled();
      expect(monitorSpawnSpy).toHaveBeenCalled();
      expect(monitorSpawnSyncSpy).toHaveBeenCalled();
      expect(monitorExecFileSpy).toHaveBeenCalled();
      expect(monitorExecFileSyncSpy).toHaveBeenCalled();
      expect(monitorForkSpy).toHaveBeenCalled();
    });
  });

  describe('isDangerousCommand', () => {
    beforeEach(() => {
      childProcessMonitor.initialize();
    });

    it('should detect rm -rf as dangerous', () => {
      const isDangerous = (childProcessMonitor as any).isDangerousCommand('rm -rf /tmp/data');
      expect(isDangerous).toBe(true);
    });

    it('should detect sudo as dangerous', () => {
      const isDangerous = (childProcessMonitor as any).isDangerousCommand('sudo apt install');
      expect(isDangerous).toBe(true);
    });

    it('should detect curl with POST as dangerous', () => {
      const isDangerous = (childProcessMonitor as any).isDangerousCommand('curl -X POST http://example.com -d "data"');
      expect(isDangerous).toBe(true);
    });

    it('should detect powershell as dangerous', () => {
      const isDangerous = (childProcessMonitor as any).isDangerousCommand('powershell.exe -Command "Get-Process"');
      expect(isDangerous).toBe(true);
    });

    it('should not flag ls as dangerous', () => {
      const isDangerous = (childProcessMonitor as any).isDangerousCommand('ls -la');
      expect(isDangerous).toBe(false);
    });
  });

  describe('isSuspiciousCommand', () => {
    beforeEach(() => {
      childProcessMonitor.initialize();
    });

    it('should detect whoami as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousCommand('whoami');
      expect(isSuspicious).toBe(true);
    });

    it('should detect hostname as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousCommand('hostname');
      expect(isSuspicious).toBe(true);
    });

    it('should detect base64 encoding as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousCommand('cat file | base64');
      expect(isSuspicious).toBe(true);
    });

    it('should detect nmap as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousCommand('nmap -sV localhost');
      expect(isSuspicious).toBe(true);
    });

    it('should detect git push as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousCommand('git push origin main');
      expect(isSuspicious).toBe(true);
    });

    it('should not flag echo as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousCommand('echo "hello"');
      expect(isSuspicious).toBe(false);
    });
  });

  describe('parseCommand', () => {
    beforeEach(() => {
      childProcessMonitor.initialize();
    });

    it('should parse simple command', () => {
      const result = (childProcessMonitor as any).parseCommand('ls -la /home');
      expect(result.executable).toBe('ls');
      expect(result.args).toEqual(['-la', '/home']);
    });

    it('should handle command with no args', () => {
      const result = (childProcessMonitor as any).parseCommand('whoami');
      expect(result.executable).toBe('whoami');
      expect(result.args).toEqual([]);
    });

    it('should handle extra whitespace', () => {
      const result = (childProcessMonitor as any).parseCommand('  ls   -la   ');
      expect(result.executable).toBe('ls');
      expect(result.args).toEqual(['-la']);
    });
  });

  describe('isSuspiciousPath', () => {
    beforeEach(() => {
      childProcessMonitor.initialize();
    });

    it('should detect .ssh paths as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousPath('/home/user/.ssh/keys');
      expect(isSuspicious).toBe(true);
    });

    it('should detect .env files as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousPath('/app/.env.production');
      expect(isSuspicious).toBe(true);
    });

    it('should detect /tmp paths as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousPath('/tmp/malicious.sh');
      expect(isSuspicious).toBe(true);
    });

    it('should not flag normal paths as suspicious', () => {
      const isSuspicious = (childProcessMonitor as any).isSuspiciousPath('/home/user/documents/file.txt');
      expect(isSuspicious).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore without errors', () => {
      childProcessMonitor.initialize();
      expect(() => childProcessMonitor.restore()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      childProcessMonitor.initialize();
    });

    it('should handle empty command', () => {
      const result = (childProcessMonitor as any).parseCommand('');
      expect(result.executable).toBe('');
      expect(result.args).toEqual([]);
    });

    it('should handle command with special characters', () => {
      const isDangerous = (childProcessMonitor as any).isDangerousCommand('echo "hello; rm -rf /"');
      expect(isDangerous).toBe(true);
    });
  });
});
