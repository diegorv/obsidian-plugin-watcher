import { BaseMonitor } from './BaseMonitor';

export class WebSocketMonitor extends BaseMonitor {
  private OriginalWebSocket: typeof WebSocket | null = null;

  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorWebSocket();
  }

  private monitorWebSocket() {
    const self = this;

    // Check if WebSocket exists in the global scope
    if (typeof WebSocket === 'undefined') {
      return;
    }

    this.OriginalWebSocket = WebSocket;
    const Original = this.OriginalWebSocket;

    // Create a proxy class
    const MonitoredWebSocket = function(this: WebSocket, url: string | URL, protocols?: string | string[]) {
      const pluginName = self.detectPluginFromStack();
      const urlStr = url.toString();
      const urlInfo = self.parseWebSocketUrl(urlStr);

      self.addLog('websocket', 'WebSocket.constructor', {
        url: urlStr,
        host: urlInfo.host,
        port: urlInfo.port,
        protocol: urlInfo.protocol,
        protocols: protocols,
        isSuspicious: self.isSuspiciousHost(urlInfo.host),
      }, pluginName);

      // Create the actual WebSocket instance
      const socket = protocols !== undefined
        ? new Original(url, protocols)
        : new Original(url);

      // Monitor send method
      const originalSend = socket.send.bind(socket);
      socket.send = function(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        self.addLog('websocket', 'WebSocket.send', {
          url: urlStr,
          host: urlInfo.host,
          dataType: self.getDataType(data),
          dataSize: self.getDataSize(data),
          isSuspicious: self.isSuspiciousHost(urlInfo.host),
        }, pluginName);

        return originalSend(data);
      };

      // Monitor close method
      const originalClose = socket.close.bind(socket);
      socket.close = function(code?: number, reason?: string) {
        self.addLog('websocket', 'WebSocket.close', {
          url: urlStr,
          host: urlInfo.host,
          code,
          reason,
        }, pluginName);

        return originalClose(code, reason);
      };

      // Monitor events
      socket.addEventListener('open', () => {
        self.addLog('websocket', 'WebSocket.open', {
          url: urlStr,
          host: urlInfo.host,
          readyState: socket.readyState,
        }, pluginName);
      });

      socket.addEventListener('message', (event: MessageEvent) => {
        self.addLog('websocket', 'WebSocket.message', {
          url: urlStr,
          host: urlInfo.host,
          dataType: self.getDataType(event.data),
          dataSize: self.getDataSize(event.data),
        }, pluginName);
      });

      socket.addEventListener('error', () => {
        self.addLog('websocket', 'WebSocket.error', {
          url: urlStr,
          host: urlInfo.host,
          readyState: socket.readyState,
        }, pluginName);
      });

      socket.addEventListener('close', (event: CloseEvent) => {
        self.addLog('websocket', 'WebSocket.closed', {
          url: urlStr,
          host: urlInfo.host,
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        }, pluginName);
      });

      return socket;
    } as unknown as typeof WebSocket;

    // Copy static properties using Object.defineProperty to avoid read-only errors
    Object.defineProperty(MonitoredWebSocket, 'CONNECTING', { value: Original.CONNECTING, writable: false });
    Object.defineProperty(MonitoredWebSocket, 'OPEN', { value: Original.OPEN, writable: false });
    Object.defineProperty(MonitoredWebSocket, 'CLOSING', { value: Original.CLOSING, writable: false });
    Object.defineProperty(MonitoredWebSocket, 'CLOSED', { value: Original.CLOSED, writable: false });
    Object.setPrototypeOf(MonitoredWebSocket.prototype, Original.prototype);

    (globalThis as any).WebSocket = MonitoredWebSocket;
  }

  private parseWebSocketUrl(url: string): { protocol: string; host: string; port: string } {
    try {
      const parsed = new URL(url);
      return {
        protocol: parsed.protocol.replace(':', ''),
        host: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'wss:' ? '443' : '80'),
      };
    } catch {
      return {
        protocol: 'unknown',
        host: url,
        port: '',
      };
    }
  }

  private getDataType(data: any): string {
    if (typeof data === 'string') return 'string';
    if (data instanceof ArrayBuffer) return 'ArrayBuffer';
    if (data instanceof Blob) return 'Blob';
    if (ArrayBuffer.isView(data)) return 'ArrayBufferView';
    return typeof data;
  }

  private getDataSize(data: any): number {
    if (typeof data === 'string') return data.length;
    if (data instanceof ArrayBuffer) return data.byteLength;
    if (data instanceof Blob) return data.size;
    if (ArrayBuffer.isView(data)) return data.byteLength;
    return 0;
  }

  private isSuspiciousHost(host: string): boolean {
    const suspiciousPatterns = [
      'webhook.site',
      'requestbin',
      'ngrok',
      'pipedream',
      'hookbin',
      'beeceptor',
      'mockbin',
      'smee.io',
      'burpcollaborator',
      'oastify.com',
      'interact.sh',
      'canarytokens',
      'dnslog',
      'ceye.io',
      'sockjs',
      'socket.io',
    ];

    const lowerHost = host.toLowerCase();
    return suspiciousPatterns.some(pattern => lowerHost.includes(pattern));
  }

  override restore() {
    if (this.OriginalWebSocket) {
      (globalThis as any).WebSocket = this.OriginalWebSocket;
    }
  }
}
