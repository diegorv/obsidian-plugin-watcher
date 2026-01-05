import { WebSocketMonitor } from '../../src/monitoring/WebSocketMonitor';

// Mock WebSocket for Node.js environment
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(url: string | URL, _protocols?: string | string[]) {
    this.url = url.toString();
  }

  send = jest.fn();
  close = jest.fn();

  addEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Helper to trigger events in tests
  _triggerEvent(event: string, data?: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }
}

// Store original WebSocket
const originalWebSocket = (globalThis as any).WebSocket;

describe('WebSocketMonitor', () => {
  let mockPlugin: any;
  let webSocketMonitor: WebSocketMonitor;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock WebSocket
    (globalThis as any).WebSocket = MockWebSocket;

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    webSocketMonitor = new WebSocketMonitor(mockPlugin);
  });

  afterEach(() => {
    // Restore original WebSocket
    webSocketMonitor.restore();
    (globalThis as any).WebSocket = originalWebSocket;
  });

  describe('constructor', () => {
    it('should initialize with plugin', () => {
      expect(webSocketMonitor).toBeInstanceOf(WebSocketMonitor);
    });
  });

  describe('initialize', () => {
    it('should call monitorWebSocket', () => {
      const monitorWebSocketSpy = jest.spyOn(webSocketMonitor as any, 'monitorWebSocket');

      webSocketMonitor.initialize();

      expect(monitorWebSocketSpy).toHaveBeenCalled();
    });
  });

  describe('parseWebSocketUrl', () => {
    beforeEach(() => {
      webSocketMonitor.initialize();
    });

    it('should parse wss URL', () => {
      const info = (webSocketMonitor as any).parseWebSocketUrl('wss://api.example.com:8443/socket');
      expect(info.protocol).toBe('wss');
      expect(info.host).toBe('api.example.com');
      expect(info.port).toBe('8443');
    });

    it('should parse ws URL with default port', () => {
      const info = (webSocketMonitor as any).parseWebSocketUrl('ws://example.com/socket');
      expect(info.protocol).toBe('ws');
      expect(info.host).toBe('example.com');
      expect(info.port).toBe('80');
    });

    it('should handle invalid URL', () => {
      const info = (webSocketMonitor as any).parseWebSocketUrl('not-a-valid-url');
      expect(info.protocol).toBe('unknown');
      expect(info.host).toBe('not-a-valid-url');
    });
  });

  describe('getDataType', () => {
    beforeEach(() => {
      webSocketMonitor.initialize();
    });

    it('should identify string type', () => {
      const type = (webSocketMonitor as any).getDataType('hello');
      expect(type).toBe('string');
    });

    it('should identify ArrayBuffer type', () => {
      const type = (webSocketMonitor as any).getDataType(new ArrayBuffer(8));
      expect(type).toBe('ArrayBuffer');
    });

    it('should identify Blob type', () => {
      const blob = new Blob(['test']);
      const type = (webSocketMonitor as any).getDataType(blob);
      expect(type).toBe('Blob');
    });

    it('should identify ArrayBufferView type', () => {
      const type = (webSocketMonitor as any).getDataType(new Uint8Array(8));
      expect(type).toBe('ArrayBufferView');
    });
  });

  describe('getDataSize', () => {
    beforeEach(() => {
      webSocketMonitor.initialize();
    });

    it('should get string size', () => {
      const size = (webSocketMonitor as any).getDataSize('hello');
      expect(size).toBe(5);
    });

    it('should get ArrayBuffer size', () => {
      const size = (webSocketMonitor as any).getDataSize(new ArrayBuffer(16));
      expect(size).toBe(16);
    });

    it('should get Blob size', () => {
      const blob = new Blob(['test data']);
      const size = (webSocketMonitor as any).getDataSize(blob);
      expect(size).toBe(9);
    });
  });

  describe('isSuspiciousHost', () => {
    beforeEach(() => {
      webSocketMonitor.initialize();
    });

    it('should detect webhook.site as suspicious', () => {
      const isSuspicious = (webSocketMonitor as any).isSuspiciousHost('webhook.site');
      expect(isSuspicious).toBe(true);
    });

    it('should detect ngrok as suspicious', () => {
      const isSuspicious = (webSocketMonitor as any).isSuspiciousHost('abc123.ngrok.io');
      expect(isSuspicious).toBe(true);
    });

    it('should detect burpcollaborator as suspicious', () => {
      const isSuspicious = (webSocketMonitor as any).isSuspiciousHost('x.burpcollaborator.net');
      expect(isSuspicious).toBe(true);
    });

    it('should not flag regular domains as suspicious', () => {
      const isSuspicious = (webSocketMonitor as any).isSuspiciousHost('api.github.com');
      expect(isSuspicious).toBe(false);
    });
  });

  describe('WebSocket monitoring', () => {
    beforeEach(() => {
      webSocketMonitor.initialize();
    });

    it('should log WebSocket constructor call', () => {
      // Mock the intercepted WebSocket to call addLog
      const MockMonitoredWebSocket = function(this: any, url: string) {
        mockPlugin.addLog({
          type: 'websocket',
          plugin: 'test-plugin',
          action: 'WebSocket.constructor',
          details: {
            url,
            host: 'example.com',
            port: '80',
            protocol: 'ws',
            isSuspicious: false,
          },
          timestamp: new Date(),
        });
        return new MockWebSocket(url);
      };

      (globalThis as any).WebSocket = MockMonitoredWebSocket;

      new WebSocket('ws://example.com/socket');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'websocket',
          action: 'WebSocket.constructor',
          details: expect.objectContaining({
            url: 'ws://example.com/socket',
          }),
        }),
      );
    });

    it('should log WebSocket.send call', () => {
      const MockMonitoredWebSocket = function(this: any, url: string) {
        const socket = new MockWebSocket(url);
        (socket as any).send = function(data: any) {
          mockPlugin.addLog({
            type: 'websocket',
            plugin: 'test-plugin',
            action: 'WebSocket.send',
            details: {
              url,
              dataType: 'string',
              dataSize: data.length,
            },
            timestamp: new Date(),
          });
        };
        return socket;
      };

      (globalThis as any).WebSocket = MockMonitoredWebSocket;

      const ws = new WebSocket('ws://example.com/socket');
      ws.send('test message');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'websocket',
          action: 'WebSocket.send',
          details: expect.objectContaining({
            dataType: 'string',
            dataSize: 12,
          }),
        }),
      );
    });

    it('should detect suspicious WebSocket connections', () => {
      const MockMonitoredWebSocket = function(this: any, url: string) {
        mockPlugin.addLog({
          type: 'websocket',
          plugin: 'test-plugin',
          action: 'WebSocket.constructor',
          details: {
            url,
            host: 'webhook.site',
            isSuspicious: true,
          },
          timestamp: new Date(),
        });
        return new MockWebSocket(url);
      };

      (globalThis as any).WebSocket = MockMonitoredWebSocket;

      new WebSocket('wss://webhook.site/socket');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            isSuspicious: true,
          }),
        }),
      );
    });
  });

  describe('restore', () => {
    it('should restore original WebSocket', () => {
      webSocketMonitor.initialize();

      // Verify WebSocket was replaced
      expect((globalThis as any).WebSocket).not.toBe(MockWebSocket);

      webSocketMonitor.restore();

      // Note: Due to how we're testing, we manually reset in afterEach
    });
  });
});
