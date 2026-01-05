import { OsMonitor } from '../../src/monitoring/OsMonitor';

describe('OsMonitor', () => {
  let mockPlugin: any;
  let osMonitor: OsMonitor;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    osMonitor = new OsMonitor(mockPlugin);
  });

  afterEach(() => {
    osMonitor.restore();
  });

  describe('constructor', () => {
    it('should initialize with plugin', () => {
      expect(osMonitor).toBeInstanceOf(OsMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorHomedirSpy = jest.spyOn(osMonitor as any, 'monitorHomedir');
      const monitorUserInfoSpy = jest.spyOn(osMonitor as any, 'monitorUserInfo');
      const monitorHostnameSpy = jest.spyOn(osMonitor as any, 'monitorHostname');
      const monitorPlatformSpy = jest.spyOn(osMonitor as any, 'monitorPlatform');
      const monitorArchSpy = jest.spyOn(osMonitor as any, 'monitorArch');
      const monitorReleaseSpy = jest.spyOn(osMonitor as any, 'monitorRelease');
      const monitorTypeSpy = jest.spyOn(osMonitor as any, 'monitorType');
      const monitorTmpdirSpy = jest.spyOn(osMonitor as any, 'monitorTmpdir');
      const monitorNetworkInterfacesSpy = jest.spyOn(osMonitor as any, 'monitorNetworkInterfaces');
      const monitorCpusSpy = jest.spyOn(osMonitor as any, 'monitorCpus');
      const monitorTotalmemSpy = jest.spyOn(osMonitor as any, 'monitorTotalmem');
      const monitorFreememSpy = jest.spyOn(osMonitor as any, 'monitorFreemem');
      const monitorUptimeSpy = jest.spyOn(osMonitor as any, 'monitorUptime');
      const monitorLoadavgSpy = jest.spyOn(osMonitor as any, 'monitorLoadavg');

      osMonitor.initialize();

      expect(monitorHomedirSpy).toHaveBeenCalled();
      expect(monitorUserInfoSpy).toHaveBeenCalled();
      expect(monitorHostnameSpy).toHaveBeenCalled();
      expect(monitorPlatformSpy).toHaveBeenCalled();
      expect(monitorArchSpy).toHaveBeenCalled();
      expect(monitorReleaseSpy).toHaveBeenCalled();
      expect(monitorTypeSpy).toHaveBeenCalled();
      expect(monitorTmpdirSpy).toHaveBeenCalled();
      expect(monitorNetworkInterfacesSpy).toHaveBeenCalled();
      expect(monitorCpusSpy).toHaveBeenCalled();
      expect(monitorTotalmemSpy).toHaveBeenCalled();
      expect(monitorFreememSpy).toHaveBeenCalled();
      expect(monitorUptimeSpy).toHaveBeenCalled();
      expect(monitorLoadavgSpy).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore without errors', () => {
      osMonitor.initialize();
      expect(() => osMonitor.restore()).not.toThrow();
    });

    it('should be safe to call restore multiple times', () => {
      osMonitor.initialize();
      expect(() => {
        osMonitor.restore();
        osMonitor.restore();
      }).not.toThrow();
    });
  });
});
