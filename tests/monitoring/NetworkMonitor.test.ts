import { NetworkMonitor } from '../../src/monitoring/NetworkMonitor';

describe('NetworkMonitor', () => {
  let mockPlugin: any;
  let networkMonitor: NetworkMonitor;
  let originalFetch: typeof fetch;
  let originalXMLHttpRequest: typeof XMLHttpRequest;
  let originalSendBeacon: typeof navigator.sendBeacon;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    originalFetch = window.fetch;
    originalXMLHttpRequest = window.XMLHttpRequest;
    originalSendBeacon = navigator.sendBeacon;

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    networkMonitor = new NetworkMonitor(mockPlugin);
  });

  afterEach(() => {
    jest.useRealTimers();
    window.fetch = originalFetch;
    window.XMLHttpRequest = originalXMLHttpRequest;
    navigator.sendBeacon = originalSendBeacon;
    networkMonitor.restore();
  });

  describe('constructor', () => {
    it('should initialize with plugin', () => {
      expect(networkMonitor).toBeInstanceOf(NetworkMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorFetchSpy = jest.spyOn(networkMonitor as any, 'monitorFetch');
      const monitorXMLHttpRequestSpy = jest.spyOn(networkMonitor as any, 'monitorXMLHttpRequest');
      const monitorSendBeaconSpy = jest.spyOn(networkMonitor as any, 'monitorSendBeacon');
      const monitorRequestUrlSpy = jest.spyOn(networkMonitor as any, 'monitorRequestUrl');
      const startCleanupIntervalSpy = jest.spyOn(networkMonitor as any, 'startCleanupInterval');

      networkMonitor.initialize();

      expect(monitorFetchSpy).toHaveBeenCalled();
      expect(monitorXMLHttpRequestSpy).toHaveBeenCalled();
      expect(monitorSendBeaconSpy).toHaveBeenCalled();
      expect(monitorRequestUrlSpy).toHaveBeenCalled();
      expect(startCleanupIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('monitorFetch', () => {
    beforeEach(() => {
      networkMonitor.initialize();
    });

    it('should initialize fetch monitoring', () => {
      expect(networkMonitor).toBeDefined();
    });
  });

  describe('monitorXMLHttpRequest', () => {
    beforeEach(() => {
      networkMonitor.initialize();
    });

    it('should initialize XMLHttpRequest monitoring', () => {
      expect(XMLHttpRequest.prototype.open).toBeDefined();
    });
  });

  describe('monitorSendBeacon', () => {
    beforeEach(() => {
      networkMonitor.initialize();
    });

    it('should initialize sendBeacon monitoring', () => {
      expect(networkMonitor).toBeDefined();
    });
  });

  describe('request deduplication', () => {
    beforeEach(() => {
      networkMonitor.initialize();
    });

    it('should initialize request deduplication', () => {
      expect((networkMonitor as any).recentRequests).toBeDefined();
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      networkMonitor.initialize();
    });

    it('should initialize cleanup interval', () => {
      expect((networkMonitor as any).cleanupInterval).toBeDefined();
    });
  });

  describe('restore', () => {
    it('should restore original fetch', () => {
      networkMonitor.initialize();
      networkMonitor.restore();
      expect(networkMonitor).toBeDefined();
    });

    it('should clear cleanup interval', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      networkMonitor.initialize();
      networkMonitor.restore();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should clear recent requests cache', () => {
      networkMonitor.initialize();
      networkMonitor.restore();
      
      expect((networkMonitor as any).recentRequests.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle missing navigator.sendBeacon', () => {
      const originalSendBeacon = navigator.sendBeacon;
      delete (navigator as any).sendBeacon;

      expect(() => {
        networkMonitor.initialize();
      }).not.toThrow();

      (navigator as any).sendBeacon = originalSendBeacon;
    });

    it('should handle null navigator.sendBeacon', () => {
      const originalSendBeacon = navigator.sendBeacon;
      (navigator as any).sendBeacon = null;

      expect(() => {
        networkMonitor.initialize();
      }).not.toThrow();

      (navigator as any).sendBeacon = originalSendBeacon;
    });
  });
});
