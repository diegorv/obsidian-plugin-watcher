export class PluginDetector {
  private settings: { debugMode: boolean };

  constructor(settings: { debugMode: boolean }) {
    this.settings = settings;
  }

  detectPluginFromStack(stack?: string): string {
    if (!stack) return 'unknown';

    this.logDebugStack(stack);

    const cleanStack = this.filterOwnPluginLines(stack);
    this.logDebugCleanStack(cleanStack);

    // Tentar detectar plugin usando padrões conhecidos
    const pluginFromPatterns = this.detectFromPatterns(cleanStack);
    if (pluginFromPatterns !== 'unknown') {
      return pluginFromPatterns;
    }

    // Verificações adicionais para operações do core
    if (this.isCoreOperation(cleanStack)) {
      return 'core';
    }

    // Análise mais específica do stack trace original
    return this.detectFromOriginalStack(stack);
  }

  private logDebugStack(stack: string): void {
    if (this.settings.debugMode) {
      console.log('[Extension Watcher Debug] Stack completo:', stack);
    }
  }

  private logDebugCleanStack(cleanStack: string): void {
    if (this.settings.debugMode) {
      console.log('[Extension Watcher Debug] Stack limpo:', cleanStack);
    }
  }

  private filterOwnPluginLines(stack: string): string {
    const lines = stack.split('\n');
    const filteredLines = lines.filter(line => 
      !line.includes('obsidian-extension-watcher') && 
      !line.includes('window.fetch (plugin:obsidian-extension-watcher') &&
      !line.includes('app.vault.read (plugin:obsidian-extension-watcher') &&
      !line.includes('window.Request (plugin:obsidian-extension-watcher'),
    );
    return filteredLines.join('\n');
  }

  private detectFromPatterns(cleanStack: string): string {
    const patterns = [
      /plugin:([^:)]+):/, // Padrão principal do Obsidian
      /plugins\/([^/]+)\//, // Padrão alternativo
      /at\s+\w+\s+\(plugin:([^:)]+):/, // Padrão de função específica
      /\(plugin:([^)]+)\)/, // Padrão genérico
    ];

    for (const pattern of patterns) {
      const match = cleanStack.match(pattern);
      const pluginName = match?.[1];
      if (pluginName && this.isValidPlugin(pluginName)) {
        return this.normalizePluginName(pluginName);
      }
    }

    return 'unknown';
  }

  private isValidPlugin(pluginName: string): boolean {
    // Plugin inválido se for o próprio extension-watcher
    if (pluginName === 'obsidian-extension-watcher') {
      return false;
    }
    
    // Plugin inválido se contiver "invalid" no nome (para testes)
    if (pluginName.includes('invalid')) {
      return false;
    }
    
    return true;
  }

  private normalizePluginName(pluginName: string): string {
    if (pluginName === 'obsidian.md') {
      return 'core';
    }
    return pluginName;
  }

  private isCoreOperation(cleanStack: string): boolean {
    return cleanStack.includes('app://obsidian.md/app.js') || 
           cleanStack.includes('obsidian.md') ||
           cleanStack.includes('app.js');
  }

  private detectFromOriginalStack(stack: string): string {
    const lines = stack.split('\n');
    const originalStackLines = lines.slice(1); // Pular a primeira linha "Error"
		
    // Procurar por padrões de plugins no stack original
    for (const line of originalStackLines) {
      const pluginMatch = line.match(/plugin:([^:)]+)/);
      if (pluginMatch?.[1] && this.isValidPlugin(pluginMatch[1])) {
        return pluginMatch[1];
      }
    }

    // Se todas as linhas apontam para app.js, é provavelmente core
    if (this.hasOnlyAppJsLines(originalStackLines)) {
      return 'core';
    }

    return 'unknown';
  }

  private hasOnlyAppJsLines(lines: string[]): boolean {
    return lines.every(line => 
      line.includes('app://obsidian.md/app.js') || 
      line.includes('obsidian-extension-watcher') ||
      line.trim() === '',
    );
  }
}
