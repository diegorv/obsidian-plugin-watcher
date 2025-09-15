import { BaseMonitor } from './BaseMonitor';

export class NetworkMonitor extends BaseMonitor {
  private originalFetch!: typeof fetch;
  private recentRequests: Map<string, { count: number; lastTimestamp: number; firstTimestamp: number }> = new Map();
  private cleanupInterval?: number;
  private readonly DEDUP_WINDOW = 5000; // 5 segundos
  private readonly MAX_REPEAT_COUNT = 3; // Máximo de repetições antes de agrupar
  private readonly CLEANUP_INTERVAL = 10000; // 10 segundos

  constructor(plugin: any) {
    super(plugin);
  }

  initialize() {
    this.monitorFetch();
    this.monitorXMLHttpRequest();
    this.monitorSendBeacon();
    this.monitorRequestUrl();
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupOldRequests();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanupOldRequests() {
    const now = Date.now();
    const cutoffTime = now - (this.DEDUP_WINDOW * 2);
    
    // Usar for...of para melhor performance com Map
    for (const [key, data] of this.recentRequests.entries()) {
      if (data.lastTimestamp < cutoffTime) {
        this.recentRequests.delete(key);
      }
    }
  }


  private shouldLogRequest(pluginName: string, url: string, method: string): boolean {
    const now = Date.now();
    const requestKey = `${pluginName}:${method}:${url}`;
    const existing = this.recentRequests.get(requestKey);
		
    if (!existing) {
      return this.createNewRequestEntry(requestKey, now);
    }
		
    if (this.isOutsideTimeWindow(now, existing.firstTimestamp)) {
      return this.resetRequestEntry(requestKey, now);
    }
		
    return this.updateExistingRequest(existing, now);
  }

  private createNewRequestEntry(requestKey: string, now: number): boolean {
    this.recentRequests.set(requestKey, {
      count: 1,
      lastTimestamp: now,
      firstTimestamp: now,
    });
    return true;
  }

  private isOutsideTimeWindow(now: number, firstTimestamp: number): boolean {
    return now - firstTimestamp > this.DEDUP_WINDOW;
  }

  private resetRequestEntry(requestKey: string, now: number): boolean {
    this.recentRequests.set(requestKey, {
      count: 1,
      lastTimestamp: now,
      firstTimestamp: now,
    });
    return true;
  }

  private updateExistingRequest(existing: { count: number; lastTimestamp: number; firstTimestamp: number }, now: number): boolean {
    existing.count++;
    existing.lastTimestamp = now;
		
    // Logar apenas as primeiras N requisições, depois agrupar
    if (existing.count <= this.MAX_REPEAT_COUNT) {
      return true;
    }
		
    // Se for exatamente MAX_REPEAT_COUNT + 1, logar uma mensagem de agrupamento
    if (existing.count === this.MAX_REPEAT_COUNT + 1) {
      return true; // Vai logar como "agrupado"
    }
		
    // Depois disso, não logar mais até sair da janela
    return false;
  }

  private getLogDetails(
    pluginName: string, 
    url: string, 
    method: string, 
    isGrouped: boolean = false, 
    additionalProps?: any,
  ): any {
    const requestKey = `${pluginName}:${method}:${url}`;
    const existing = this.recentRequests.get(requestKey);
		
    const details: any = {
      url: url,
      method: method,
      ...additionalProps,
    };
		
    if (isGrouped && existing && existing.count > this.MAX_REPEAT_COUNT) {
      details.grouped = true;
      details.repeatCount = existing.count;
      details.timeSpan = existing.lastTimestamp - existing.firstTimestamp;
    }
		
    return details;
  }

  private logNetworkRequest(
    pluginName: string, 
    url: string, 
    method: string, 
    action: string, 
    additionalProps?: any,
  ) {
    // Verificar se deve logar esta requisição
    const shouldLog = this.shouldLogRequest(pluginName, url, method);
		
    if (!shouldLog) return;
		
    // Verificar se é uma requisição agrupada
    const requestKey = `${pluginName}:${method}:${url}`;
    const existing = this.recentRequests.get(requestKey);
    const isGrouped = existing && existing.count > this.MAX_REPEAT_COUNT;
		
    // Log usando método da classe base
    const details = this.getLogDetails(pluginName, url, method, isGrouped, additionalProps);
    const finalAction = isGrouped ? `${action}-grouped` : action;
		
    this.addLog('network', finalAction, details, pluginName);
  }

  private monitorFetch() {
    // Interceptar fetch
    this.originalFetch = window.fetch;
    const originalFetch = this.originalFetch;
    const self = this;
		
    window.fetch = function(...args: Parameters<typeof fetch>) {
      const url = args[0];
      const options = args[1] || {};
      const method = options.method ?? 'GET';
      const pluginName = self.detectPluginFromStack();
      const startTime = performance.now();
			
      // Capturar detalhes da requisição
      const requestDetails = {
        headers: options.headers,
        body: options.body ? (typeof options.body === 'string' ? options.body.length : 'binary') : undefined,
        mode: options.mode,
        credentials: options.credentials,
        cache: options.cache,
        redirect: options.redirect,
        referrer: options.referrer,
        referrerPolicy: options.referrerPolicy,
        hasBody: !!options.body,
        bodyType: options.body ? typeof options.body : undefined,
      };

      // Chamar o fetch original e capturar a resposta
      const fetchPromise = originalFetch.apply(this, args);
      
      fetchPromise
        .then(response => {
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);
          
          self.logNetworkRequest(pluginName, String(url), method, 'fetch-response', {
            ...requestDetails,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            responseTime,
            responseHeaders: self.headersToObject(response.headers),
            responseType: response.type,
            responseUrl: response.url,
            redirected: response.redirected,
          });
        })
        .catch(error => {
          const endTime = performance.now();
          const responseTime = Math.round(endTime - startTime);
          
          self.logNetworkRequest(pluginName, String(url), method, 'fetch-error', {
            ...requestDetails,
            error: error.message,
            responseTime,
          });
        });

      return fetchPromise;
    };
  }

  private monitorXMLHttpRequest() {
    const self = this;

    // Interceptar XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open.bind(XMLHttpRequest.prototype);
    XMLHttpRequest.prototype.open = function(
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      user?: string | null,
      password?: string | null,
    ) {
      const pluginName = self.detectPluginFromStack();
      self.logNetworkRequest(
        pluginName, 
        url.toString(), 
        method, 
        'xhr',
      );

      return originalXHROpen.call(this, method, url, async ?? true, user, password);
    };

    // Interceptar também XMLHttpRequest.send para capturar dados POST
    const originalXHRSend = XMLHttpRequest.prototype.send.bind(XMLHttpRequest.prototype);
    XMLHttpRequest.prototype.send = function(data?: Document | XMLHttpRequestBodyInit | null) {
      // Só logar se tiver dados sendo enviados (POST/PUT)
      if (data && this.readyState === XMLHttpRequest.OPENED) {
        const url = this.responseURL || 'pending';
        const method = 'POST/PUT';
        const pluginName = self.detectPluginFromStack();
				
        self.logNetworkRequest(pluginName, url, method, 'xhr-send', {
          hasData: true,
          dataType: typeof data,
        });
      }

      return originalXHRSend.call(this, data);
    };
  }

  private monitorSendBeacon() {
    const self = this;

    // Interceptar também navigator.sendBeacon se usado
    if (navigator.sendBeacon !== null && navigator.sendBeacon !== undefined) {
      const originalSendBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = function(url: string | URL, data?: BodyInit | null) {
        const pluginName = self.detectPluginFromStack();
        const method = 'POST';
				
        self.logNetworkRequest(pluginName, url.toString(), method, 'beacon', {
          hasData: !!data,
        });

        return originalSendBeacon.call(navigator, url, data);
      };
    }
  }

  private monitorRequestUrl() {
    // Tentar interceptar requestUrl em diferentes locais possíveis
    this.interceptRequestUrlAt('window.requestUrl', (window as any).requestUrl);
    this.interceptRequestUrlAt('window.obsidian.requestUrl', (window as any).obsidian?.requestUrl);
    this.interceptRequestUrlAt('window.app.plugins.requestUrl', (window as any).app?.plugins?.requestUrl);
    
    // Tentar interceptar através de monkey-patching de módulos
    this.interceptRequestUrlModules();
  }

  private interceptRequestUrlAt(path: string, originalFunction: any) {
    if (typeof originalFunction === 'function') {
      const self = this;
      const pathParts = path.split('.');
      const lastPart = pathParts.pop()!;
      const parent = pathParts.reduce((obj, part) => obj?.[part], window as any);
      
      if (parent) {
        parent[lastPart] = function(request: any) {
          const pluginName = self.detectPluginFromStack();
          const url = request.url || 'unknown';
          const method = request.method || 'GET';
          
          self.logNetworkRequest(pluginName, url, method, 'requestUrl', {
            hasBody: !!request.body,
            contentType: request.headers?.['Content-Type'] || request.headers?.['content-type'],
            userAgent: request.headers?.['User-Agent'] || request.headers?.['user-agent'],
            interceptedAt: path,
          });

          return originalFunction.call(this, request);
        };
      }
    }
  }

  private interceptRequestUrlModules() {
    const self = this;
    
    // Tentar interceptar através de require/import cache se disponível
    if (typeof (window as any).require !== 'undefined') {
      try {
        const obsidianModule = (window as any).require('obsidian');
        if (obsidianModule && typeof obsidianModule.requestUrl === 'function') {
          const originalRequestUrl = obsidianModule.requestUrl;
          
          obsidianModule.requestUrl = function(request: any) {
            const pluginName = self.detectPluginFromStack();
            const url = request.url || 'unknown';
            const method = request.method || 'GET';
            
            self.logNetworkRequest(pluginName, url, method, 'requestUrl', {
              hasBody: !!request.body,
              contentType: request.headers?.['Content-Type'] || request.headers?.['content-type'],
              userAgent: request.headers?.['User-Agent'] || request.headers?.['user-agent'],
              interceptedAt: 'obsidian-module',
            });

            return originalRequestUrl.call(this, request);
          };
        }
      } catch (e) {
        // Ignorar erros de require
      }
    }
  }

  private headersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  override restore() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }
		
    // Limpar interval de cleanup
    if (this.cleanupInterval) {
      if (typeof window !== 'undefined' && window.clearInterval) {
        window.clearInterval(this.cleanupInterval);
      } else if (typeof clearInterval !== 'undefined') {
        clearInterval(this.cleanupInterval);
      }
      this.cleanupInterval = undefined as any;
    }
		
    // Limpar cache de requisições
    this.recentRequests.clear();
  }
}
