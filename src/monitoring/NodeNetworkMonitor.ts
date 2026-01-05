import { BaseMonitor } from './BaseMonitor';

const http = require('http');
const https = require('https');
const net = require('net');
const dgram = require('dgram');

export class NodeNetworkMonitor extends BaseMonitor {
  private originalHttpRequest: any = null;
  private originalHttpGet: any = null;
  private originalHttpsRequest: any = null;
  private originalHttpsGet: any = null;
  private originalNetConnect: any = null;
  private originalNetCreateConnection: any = null;
  private originalDgramCreateSocket: any = null;

  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorHttpRequest();
    this.monitorHttpGet();
    this.monitorHttpsRequest();
    this.monitorHttpsGet();
    this.monitorNetConnect();
    this.monitorNetCreateConnection();
    this.monitorDgramCreateSocket();
  }

  private monitorHttpRequest() {
    const self = this;
    this.originalHttpRequest = http.request;
    const original = this.originalHttpRequest;

    http.request = function(
      urlOrOptions: any,
      optionsOrCallback?: any,
      callback?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const requestInfo = self.parseRequestInfo(urlOrOptions, optionsOrCallback);

      self.addLog('nodejs', 'http.request', {
        protocol: 'http',
        method: requestInfo.method,
        host: requestInfo.host,
        port: requestInfo.port,
        path: requestInfo.path,
        isSuspicious: self.isSuspiciousNetwork(requestInfo.host),
      }, pluginName);

      return original.call(http, urlOrOptions, optionsOrCallback, callback);
    };
  }

  private monitorHttpGet() {
    const self = this;
    this.originalHttpGet = http.get;
    const original = this.originalHttpGet;

    http.get = function(
      urlOrOptions: any,
      optionsOrCallback?: any,
      callback?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const requestInfo = self.parseRequestInfo(urlOrOptions, optionsOrCallback);

      self.addLog('nodejs', 'http.get', {
        protocol: 'http',
        method: 'GET',
        host: requestInfo.host,
        port: requestInfo.port,
        path: requestInfo.path,
        isSuspicious: self.isSuspiciousNetwork(requestInfo.host),
      }, pluginName);

      return original.call(http, urlOrOptions, optionsOrCallback, callback);
    };
  }

  private monitorHttpsRequest() {
    const self = this;
    this.originalHttpsRequest = https.request;
    const original = this.originalHttpsRequest;

    https.request = function(
      urlOrOptions: any,
      optionsOrCallback?: any,
      callback?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const requestInfo = self.parseRequestInfo(urlOrOptions, optionsOrCallback);

      self.addLog('nodejs', 'https.request', {
        protocol: 'https',
        method: requestInfo.method,
        host: requestInfo.host,
        port: requestInfo.port,
        path: requestInfo.path,
        isSuspicious: self.isSuspiciousNetwork(requestInfo.host),
      }, pluginName);

      return original.call(https, urlOrOptions, optionsOrCallback, callback);
    };
  }

  private monitorHttpsGet() {
    const self = this;
    this.originalHttpsGet = https.get;
    const original = this.originalHttpsGet;

    https.get = function(
      urlOrOptions: any,
      optionsOrCallback?: any,
      callback?: any,
    ) {
      const pluginName = self.detectPluginFromStack();
      const requestInfo = self.parseRequestInfo(urlOrOptions, optionsOrCallback);

      self.addLog('nodejs', 'https.get', {
        protocol: 'https',
        method: 'GET',
        host: requestInfo.host,
        port: requestInfo.port,
        path: requestInfo.path,
        isSuspicious: self.isSuspiciousNetwork(requestInfo.host),
      }, pluginName);

      return original.call(https, urlOrOptions, optionsOrCallback, callback);
    };
  }

  private monitorNetConnect() {
    const self = this;
    this.originalNetConnect = net.connect;
    const original = this.originalNetConnect;

    net.connect = function(...args: any[]) {
      const pluginName = self.detectPluginFromStack();
      const connectionInfo = self.parseNetConnectionInfo(args);

      self.addLog('nodejs', 'net.connect', {
        protocol: 'tcp',
        host: connectionInfo.host,
        port: connectionInfo.port,
        isSuspicious: self.isSuspiciousNetwork(connectionInfo.host),
      }, pluginName);

      return original.apply(net, args);
    };
  }

  private monitorNetCreateConnection() {
    const self = this;
    this.originalNetCreateConnection = net.createConnection;
    const original = this.originalNetCreateConnection;

    net.createConnection = function(...args: any[]) {
      const pluginName = self.detectPluginFromStack();
      const connectionInfo = self.parseNetConnectionInfo(args);

      self.addLog('nodejs', 'net.createConnection', {
        protocol: 'tcp',
        host: connectionInfo.host,
        port: connectionInfo.port,
        isSuspicious: self.isSuspiciousNetwork(connectionInfo.host),
      }, pluginName);

      return original.apply(net, args);
    };
  }

  private monitorDgramCreateSocket() {
    const self = this;
    this.originalDgramCreateSocket = dgram.createSocket;
    const original = this.originalDgramCreateSocket;

    dgram.createSocket = function(type: any, callback?: any) {
      const pluginName = self.detectPluginFromStack();
      const socketType = typeof type === 'string' ? type : type?.type;

      self.addLog('nodejs', 'dgram.createSocket', {
        protocol: 'udp',
        socketType,
        isSuspicious: true, // UDP sockets são sempre suspeitos para plugins
      }, pluginName);

      const socket = original.call(dgram, type, callback);

      // Monitor send operations on the socket
      const originalSend = socket.send.bind(socket);
      (socket as any).send = function(
        msg: string | Uint8Array | readonly any[],
        offsetOrPort?: number,
        lengthOrAddress?: number | string,
        portOrCallback?: number | ((error: Error | null, bytes: number) => void),
        addressOrCallback?: string | ((error: Error | null, bytes: number) => void),
        callback?: (error: Error | null, bytes: number) => void,
      ) {
        let port: number | undefined;
        let address: string | undefined;

        // Parse the overloaded arguments
        if (typeof offsetOrPort === 'number' && typeof lengthOrAddress === 'number') {
          // send(msg, offset, length, port, address?, callback?)
          port = portOrCallback as number;
          address = addressOrCallback as string;
        } else if (typeof offsetOrPort === 'number' && typeof lengthOrAddress === 'string') {
          // send(msg, port, address, callback?)
          port = offsetOrPort;
          address = lengthOrAddress;
        }

        self.addLog('nodejs', 'dgram.send', {
          protocol: 'udp',
          socketType,
          port,
          address,
          messageSize: typeof msg === 'string' ? msg.length : (msg as Uint8Array).length,
          isSuspicious: self.isSuspiciousNetwork(address),
        }, pluginName);

        return originalSend(msg, offsetOrPort as any, lengthOrAddress as any, portOrCallback as any, addressOrCallback as any, callback as any);
      };

      return socket;
    };
  }

  private parseRequestInfo(
    urlOrOptions: any,
    optionsOrCallback?: any,
  ): { method: string; host: string; port: number | string; path: string } {
    let method = 'GET';
    let host = 'unknown';
    let port: number | string = 80;
    let path = '/';

    if (typeof urlOrOptions === 'string') {
      try {
        const url = new URL(urlOrOptions);
        host = url.hostname;
        port = url.port || (url.protocol === 'https:' ? 443 : 80);
        path = url.pathname + url.search;
      } catch {
        host = urlOrOptions;
      }
    } else if (urlOrOptions instanceof URL) {
      host = urlOrOptions.hostname;
      port = urlOrOptions.port || (urlOrOptions.protocol === 'https:' ? 443 : 80);
      path = urlOrOptions.pathname + urlOrOptions.search;
    } else if (typeof urlOrOptions === 'object') {
      method = urlOrOptions.method || 'GET';
      host = urlOrOptions.hostname || urlOrOptions.host || 'unknown';
      port = urlOrOptions.port || 80;
      path = urlOrOptions.path || '/';
    }

    // Check if second argument is options object
    if (optionsOrCallback && typeof optionsOrCallback === 'object' && !('on' in optionsOrCallback)) {
      method = optionsOrCallback.method || method;
      host = optionsOrCallback.hostname || optionsOrCallback.host || host;
      port = optionsOrCallback.port || port;
      path = optionsOrCallback.path || path;
    }

    return { method, host: String(host), port, path };
  }

  private parseNetConnectionInfo(args: any[]): { host: string; port: number | undefined } {
    let host = 'unknown';
    let port: number | undefined;

    if (args.length > 0) {
      const firstArg = args[0];
      if (typeof firstArg === 'number') {
        // net.connect(port, host?)
        port = firstArg;
        host = typeof args[1] === 'string' ? args[1] : 'localhost';
      } else if (typeof firstArg === 'object') {
        // net.connect(options)
        port = firstArg.port;
        host = firstArg.host || firstArg.path || 'localhost';
      } else if (typeof firstArg === 'string') {
        // net.connect(path) - Unix socket
        host = firstArg;
      }
    }

    return { host, port };
  }

  private isSuspiciousNetwork(host: string | undefined): boolean {
    if (!host) return false;

    const suspiciousPatterns = [
      'webhook.site',
      'requestbin',
      'ngrok',
      'pipedream',
      'hookbin',
      'requestcatcher',
      'beeceptor',
      'mockbin',
      'httpbin',
      'postb.in',
      'webhook.fun',
      'smee.io',
      'burpcollaborator',
      'oastify.com',
      'interact.sh',
      'canarytokens',
      'dnslog',
      'ceye.io',
    ];

    const lowerHost = host.toLowerCase();
    return suspiciousPatterns.some(pattern => lowerHost.includes(pattern));
  }

  override restore() {
    if (this.originalHttpRequest) {
      http.request = this.originalHttpRequest;
    }
    if (this.originalHttpGet) {
      http.get = this.originalHttpGet;
    }
    if (this.originalHttpsRequest) {
      https.request = this.originalHttpsRequest;
    }
    if (this.originalHttpsGet) {
      https.get = this.originalHttpsGet;
    }
    if (this.originalNetConnect) {
      net.connect = this.originalNetConnect;
    }
    if (this.originalNetCreateConnection) {
      net.createConnection = this.originalNetCreateConnection;
    }
    if (this.originalDgramCreateSocket) {
      dgram.createSocket = this.originalDgramCreateSocket;
    }
  }
}
