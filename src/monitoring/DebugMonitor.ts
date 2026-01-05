import { BaseMonitor } from './BaseMonitor';

export class DebugMonitor extends BaseMonitor {
  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    // DebugMonitor não precisa de inicialização automática
    // Usa enableAggressiveDebug() quando necessário
  }

  enableAggressiveDebug() {
    this.monitorRequestResponse();
    this.monitorPromiseAll();
    this.monitorSetTimeout();
    this.monitorAppendChild();

    console.log('[Extension Watcher] Modo debug agressivo ativado - monitorando TODAS as operações');
  }

  private monitorRequestResponse() {
    const self = this;
		
    // Interceptar TODAS as operações de rede de forma mais agressiva
    const originalRequest = window.Request;
    window.Request = class extends originalRequest {
      constructor(input: RequestInfo | URL, init?: RequestInit) {
        const pluginName = self.detectPluginFromStack();
				
        self.addLog('network', 'request-constructor', {
          url: String(input),
          method: init?.method ?? 'GET',
          headers: init?.headers,
          mode: init?.mode,
        }, pluginName);

        super(input, init);
      }
    };

    // Interceptar Response
    const originalResponse = window.Response;
    window.Response = class extends originalResponse {
      constructor(body?: BodyInit | null, init?: ResponseInit) {
        const pluginName = self.detectPluginFromStack();
				
        if (self.plugin.settings.debugMode) {
          self.addLog('network', 'response-constructor', {
            status: init?.status,
            statusText: init?.statusText,
            headers: init?.headers,
          }, pluginName);
        }

        super(body, init);
      }
    };
  }

  private monitorPromiseAll() {
    const self = this;

    // Interceptar métodos de Promise para capturar async/await
    const originalPromiseAll = Promise.all.bind(Promise);
    Promise.all = function<T>(values: Iterable<T | PromiseLike<T>>) {
      const stack = new Error().stack;
      const pluginName = self.detectPluginFromStack();
			
      if (self.plugin.settings.debugMode && stack?.includes('smart-composer')) {
        self.addLog('command', 'promise-all', {
          valuesCount: Array.from(values).length,
        }, pluginName);
      }

      return originalPromiseAll(Array.from(values));
    };
  }

  private monitorSetTimeout() {
    const self = this;

    // Monitorar todas as chamadas setTimeout/setInterval que podem ser de plugins
    const originalSetTimeout = window.setTimeout;
    
    // Interceptar setTimeout de forma simples
    window.setTimeout = function(
      handler: TimerHandler,
      timeout?: number,
      ...args: unknown[]
    ) {
      const pluginName = self.detectPluginFromStack();
			
      // Só logar se for de um plugin (não core) e em debug mode
      if (self.plugin.settings.debugMode && pluginName !== 'core' && pluginName !== 'unknown') {
        self.addLog('command', 'set-timeout', {
          timeout,
        }, pluginName);
      }

      return originalSetTimeout(handler, timeout, ...args);
    } as any;
  }

  private monitorAppendChild() {
    const self = this;

    // Interceptar appendChild para detectar injeção de scripts/iframes
    const originalAppendChild = Element.prototype.appendChild.bind(Element.prototype);
    Element.prototype.appendChild = function<T extends Node>(newChild: T): T {
      const pluginName = self.detectPluginFromStack();
			
      if (self.plugin.settings.debugMode && 
          (newChild.nodeName === 'SCRIPT' || newChild.nodeName === 'IFRAME') &&
          pluginName !== 'core') {
        self.addLog('command', 'append-element', {
          elementType: newChild.nodeName,
          src: (newChild as unknown as HTMLScriptElement | HTMLIFrameElement).src,
        }, pluginName);
      }

      return originalAppendChild.call(this, newChild) as any;
    };
  }
}
