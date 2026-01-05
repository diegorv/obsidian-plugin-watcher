import { BaseMonitor } from './BaseMonitor';

export class AdvancedAPIMonitor extends BaseMonitor {
  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorWebWorkers();
    this.monitorEventSource();
    this.monitorWebSocket();
  }

  private monitorWebWorkers() {
    // Interceptar Worker para Web Workers
    if (typeof Worker !== 'undefined') {
      const originalWorker = window.Worker;
      const self = this;
      window.Worker = class extends originalWorker {
        constructor(scriptURL: string | URL, options?: WorkerOptions) {
          const pluginName = self.detectPluginFromStack();
					
          self.addLog('command', 'web-worker', {
            scriptURL: scriptURL.toString(),
            options,
          }, pluginName);

          super(scriptURL, options);
        }
      };
    }
  }

  private monitorEventSource() {
    // Interceptar EventSource para Server-Sent Events
    if (typeof EventSource !== 'undefined') {
      const originalEventSource = window.EventSource;
      const self = this;
      window.EventSource = class extends originalEventSource {
        constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
          const pluginName = self.detectPluginFromStack();
					
          self.addLog('network', 'event-source', {
            url: url.toString(),
            withCredentials: eventSourceInitDict?.withCredentials,
          }, pluginName);

          super(url, eventSourceInitDict);
        }
      };
    }
  }

  private monitorWebSocket() {
    // Interceptar WebSocket para conexões em tempo real
    if (typeof WebSocket !== 'undefined') {
      const originalWebSocket = window.WebSocket;
      const self = this;
      window.WebSocket = class extends originalWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          const pluginName = self.detectPluginFromStack();
					
          self.addLog('network', 'websocket', {
            url: url.toString(),
            protocols,
          }, pluginName);

          super(url, protocols);
        }
      };
    }
  }
}
