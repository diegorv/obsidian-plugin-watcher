import { NodeNetworkMonitor } from '../../src/monitoring/NodeNetworkMonitor';

describe('NodeNetworkMonitor', () => {
  let mockPlugin: any;
  let nodeNetworkMonitor: NodeNetworkMonitor;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    nodeNetworkMonitor = new NodeNetworkMonitor(mockPlugin);
  });

  afterEach(() => {
    nodeNetworkMonitor.restore();
  });

  describe('constructor', () => {
    it('should initialize with plugin', () => {
      expect(nodeNetworkMonitor).toBeInstanceOf(NodeNetworkMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorHttpRequestSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorHttpRequest');
      const monitorHttpGetSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorHttpGet');
      const monitorHttpsRequestSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorHttpsRequest');
      const monitorHttpsGetSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorHttpsGet');
      const monitorNetConnectSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorNetConnect');
      const monitorNetCreateConnectionSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorNetCreateConnection');
      const monitorDgramCreateSocketSpy = jest.spyOn(nodeNetworkMonitor as any, 'monitorDgramCreateSocket');

      nodeNetworkMonitor.initialize();

      expect(monitorHttpRequestSpy).toHaveBeenCalled();
      expect(monitorHttpGetSpy).toHaveBeenCalled();
      expect(monitorHttpsRequestSpy).toHaveBeenCalled();
      expect(monitorHttpsGetSpy).toHaveBeenCalled();
      expect(monitorNetConnectSpy).toHaveBeenCalled();
      expect(monitorNetCreateConnectionSpy).toHaveBeenCalled();
      expect(monitorDgramCreateSocketSpy).toHaveBeenCalled();
    });
  });

  describe('isSuspiciousNetwork', () => {
    beforeEach(() => {
      nodeNetworkMonitor.initialize();
    });

    it('should detect webhook.site as suspicious', () => {
      const isSuspicious = (nodeNetworkMonitor as any).isSuspiciousNetwork('webhook.site');
      expect(isSuspicious).toBe(true);
    });

    it('should detect ngrok as suspicious', () => {
      const isSuspicious = (nodeNetworkMonitor as any).isSuspiciousNetwork('abc123.ngrok.io');
      expect(isSuspicious).toBe(true);
    });

    it('should detect burpcollaborator as suspicious', () => {
      const isSuspicious = (nodeNetworkMonitor as any).isSuspiciousNetwork('x.burpcollaborator.net');
      expect(isSuspicious).toBe(true);
    });

    it('should not flag regular domains as suspicious', () => {
      const isSuspicious = (nodeNetworkMonitor as any).isSuspiciousNetwork('api.github.com');
      expect(isSuspicious).toBe(false);
    });

    it('should handle undefined host', () => {
      const isSuspicious = (nodeNetworkMonitor as any).isSuspiciousNetwork(undefined);
      expect(isSuspicious).toBe(false);
    });
  });

  describe('parseRequestInfo', () => {
    beforeEach(() => {
      nodeNetworkMonitor.initialize();
    });

    it('should parse string URL', () => {
      const info = (nodeNetworkMonitor as any).parseRequestInfo('https://api.example.com:8443/data?q=1');
      expect(info.host).toBe('api.example.com');
      expect(info.port).toBe('8443');
      expect(info.path).toBe('/data?q=1');
    });

    it('should parse URL object', () => {
      const url = new URL('https://api.example.com/path');
      const info = (nodeNetworkMonitor as any).parseRequestInfo(url);
      expect(info.host).toBe('api.example.com');
      expect(info.path).toBe('/path');
    });

    it('should parse options object', () => {
      const options = {
        method: 'POST',
        hostname: 'api.example.com',
        port: 443,
        path: '/api/data',
      };
      const info = (nodeNetworkMonitor as any).parseRequestInfo(options);
      expect(info.method).toBe('POST');
      expect(info.host).toBe('api.example.com');
      expect(info.port).toBe(443);
      expect(info.path).toBe('/api/data');
    });
  });

  describe('parseNetConnectionInfo', () => {
    beforeEach(() => {
      nodeNetworkMonitor.initialize();
    });

    it('should parse port and host arguments', () => {
      const info = (nodeNetworkMonitor as any).parseNetConnectionInfo([8080, 'example.com']);
      expect(info.port).toBe(8080);
      expect(info.host).toBe('example.com');
    });

    it('should parse options object', () => {
      const info = (nodeNetworkMonitor as any).parseNetConnectionInfo([{ port: 3000, host: 'localhost' }]);
      expect(info.port).toBe(3000);
      expect(info.host).toBe('localhost');
    });

    it('should handle Unix socket path', () => {
      const info = (nodeNetworkMonitor as any).parseNetConnectionInfo(['/var/run/socket.sock']);
      expect(info.host).toBe('/var/run/socket.sock');
    });
  });

  describe('restore', () => {
    it('should restore without errors', () => {
      nodeNetworkMonitor.initialize();
      expect(() => nodeNetworkMonitor.restore()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      nodeNetworkMonitor.initialize();
    });

    it('should handle invalid URL gracefully', () => {
      const info = (nodeNetworkMonitor as any).parseRequestInfo('not-a-valid-url');
      expect(info.host).toBe('not-a-valid-url');
    });

    it('should handle empty arguments for net.connect', () => {
      const info = (nodeNetworkMonitor as any).parseNetConnectionInfo([]);
      expect(info.host).toBe('unknown');
      expect(info.port).toBeUndefined();
    });
  });
});
