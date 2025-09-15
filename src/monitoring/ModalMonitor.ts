import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class ModalMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorModalCreation();
  }

  private monitorModalCreation() {
    const self = this;

    // Interceptar criação de modais
    const originalCreateEl = document.createElement;
    document.createElement = function(tagName: string, options?: ElementCreationOptions) {
      const element = originalCreateEl.call(this, tagName, options);
      
      if (tagName.toLowerCase() === 'div' && element.classList.contains('modal')) {
        const pluginName = self.detectPluginFromStack();
        self.addLog('modal', 'modal-created', {
          tagName,
          className: element.className,
          id: element.id,
        }, pluginName);
      }
      
      return element;
    };
  }
}