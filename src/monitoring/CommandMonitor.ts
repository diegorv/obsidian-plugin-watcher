import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class CommandMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorCommandExecution();
    this.monitorWindowOpen();
  }

  private monitorCommandExecution() {
    const self = this;

    // Interceptar execução de comandos através do workspace
    const workspace = this.app?.workspace;
    if (!workspace) return;

    // Acessar método executeCommandById se disponível
    if ('executeCommandById' in workspace && typeof workspace.executeCommandById === 'function') {
      const originalExecuteCommandById = workspace.executeCommandById.bind(workspace);
      
      (workspace as any).executeCommandById = (commandId: string) => {
        const pluginName = self.detectPluginFromStack();
        const startTime = performance.now();
        const activeFile = workspace.getActiveFile();
        const activeLeaf = workspace.activeLeaf;

        const result = originalExecuteCommandById(commandId);
        const endTime = performance.now();

        self.addLog('command', 'execute', {
          commandId,
          executionTime: Math.round(endTime - startTime),
          activeFile: activeFile?.path || null,
          activeViewType: activeLeaf?.view?.getViewType(),
          hasActiveFile: !!activeFile,
          isMarkdownView: activeLeaf?.view?.getViewType() === 'markdown',
          commandCategory: self.getCommandCategory(commandId),
          isCoreCommand: commandId.startsWith('app:'),
          isPluginCommand: !commandId.startsWith('app:'),
        }, pluginName);

        return result;
      };
    }

    // Interceptar também através do command palette se disponível
    this.monitorCommandPalette();
  }

  private getCommandCategory(commandId: string): string {
    if (commandId.startsWith('app:')) return 'core';
    if (commandId.includes(':')) return commandId.split(':')[0] || 'unknown';
    return 'unknown';
  }

  private monitorCommandPalette() {
    const self = this;

    // Tentar interceptar o command palette
    const workspace = this.app?.workspace;
    if (!workspace) return;

    // Interceptar através de eventos de teclado para detectar Ctrl+P
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        const pluginName = self.detectPluginFromStack();
        self.addLog('command', 'palette-open', {
          timestamp: Date.now(),
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
        }, pluginName);
      }
    });
  }

  private monitorWindowOpen() {
    const self = this;

    // Também interceptar através do objeto global window
    const originalOpen = window.open;
    window.open = function(...args: Parameters<typeof window.open>) {
      const pluginName = self.detectPluginFromStack();

      self.addLog('command', 'window.open', {
        url: args[0],
        target: args[1],
        features: args[2],
      }, pluginName);

      return originalOpen.apply(this, args);
    };
  }
}
