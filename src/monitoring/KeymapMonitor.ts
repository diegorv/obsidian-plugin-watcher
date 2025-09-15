import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class KeymapMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorKeyboardEvents();
  }

  private monitorKeyboardEvents() {
    const self = this;

    // Interceptar eventos de teclado globalmente
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = function(type: string, listener: any, options?: any) {
      if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
        const wrappedListener = (event: Event) => {
          const pluginName = self.detectPluginFromStack();
          
          // Só logar se for de um plugin (não core)
          if (pluginName !== 'core' && pluginName !== 'unknown') {
            const keyEvent = event as KeyboardEvent;
            self.addLog('keymap', 'keyboard-event', {
              type: event.type,
              key: keyEvent.key,
              code: keyEvent.code,
              ctrlKey: keyEvent.ctrlKey,
              altKey: keyEvent.altKey,
              shiftKey: keyEvent.shiftKey,
              metaKey: keyEvent.metaKey,
              target: event.target?.constructor?.name,
            }, pluginName);
          }
          
          return listener.call(this, event);
        };
        
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}