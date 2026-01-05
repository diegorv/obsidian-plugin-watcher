import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class SettingsMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    // Monitoramento básico de configurações
    this.monitorBasicSettings();
  }

  private monitorBasicSettings() {
    // Monitoramento básico sem usar eventos que podem não existir
    const self = this;
    
    // Interceptar mudanças em localStorage que podem indicar mudanças de configurações
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      if (key.includes('obsidian') || key.includes('plugin')) {
        const pluginName = self.detectPluginFromStack();
        self.addLog('settings', 'localStorage-set', {
          key: key,
          valueLength: value.length,
        }, pluginName);
      }
      
      return originalSetItem.call(this, key, value);
    };
  }
}