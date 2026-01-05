import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class MetadataMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorMetadataCacheEvents();
  }

  private monitorMetadataCacheEvents() {
    const metadataCache = this.app?.metadataCache;
    if (!metadataCache) return;

    // Monitorar eventos do metadata cache usando eventos que existem
    this.registerEvent(metadataCache.on('changed', (file) => {
      const pluginName = this.detectPluginFromStack();
      this.addLog('metadata', 'cache-changed', {
        filePath: file.path,
        fileName: file.name,
        timestamp: Date.now(),
      }, pluginName);
    }));

    this.registerEvent(metadataCache.on('resolved', () => {
      const pluginName = this.detectPluginFromStack();
      this.addLog('metadata', 'cache-resolved', {
        timestamp: Date.now(),
      }, pluginName);
    }));
  }
}