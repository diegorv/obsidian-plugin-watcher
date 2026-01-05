import { App } from 'obsidian';
import { LogEntry } from '../types';

export abstract class BaseMonitor {
  protected plugin: any; // Plugin principal
  protected app: App | undefined;

  constructor(plugin: any, app?: App) {
    this.plugin = plugin;
    this.app = app;
  }

  /**
   * Detecta o plugin responsável pela ação atual através do stack trace
   */
  protected detectPluginFromStack(): string {
    try {
      const stack = new Error().stack;
      if (!stack) return 'unknown';
      const result = this.plugin.detectPluginFromStack(stack);
      return result || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Adiciona um log de forma simples
   */
  protected addLog(type: LogEntry['type'], action: string, details: Record<string, unknown>, pluginName?: string): void {
    try {
      const finalPluginName = pluginName ?? this.detectPluginFromStack();
      
      this.plugin.addLog({
        type,
        plugin: finalPluginName,
        action,
        details: details || {},
        timestamp: new Date(),
      });
    } catch (error) {
      console.warn('[Extension Watcher] Erro ao adicionar log:', error);
    }
  }

  /**
   * Intercepta um método de forma simples
   */
  protected interceptMethod(target: any, methodName: string, interceptor: Function): boolean {
    try {
      if (!target[methodName] || typeof target[methodName] !== 'function') {
        return false;
      }
      
      const originalMethod = target[methodName];
      target[methodName] = function(...args: any[]) {
        try {
          return interceptor(originalMethod, ...args);
        } catch (error) {
          console.warn(`[Extension Watcher] Erro no interceptor para ${methodName}:`, error);
          return originalMethod.apply(this, args);
        }
      };
      
      return true;
    } catch (error) {
      console.warn(`[Extension Watcher] Erro ao interceptar método ${methodName}:`, error);
      return false;
    }
  }

  /**
   * Registra um evento usando o plugin
   */
  protected registerEvent(eventRef: any): void {
    try {
      if (this.plugin && typeof this.plugin.registerEvent === 'function') {
        this.plugin.registerEvent(eventRef);
      }
    } catch (error) {
      console.warn('[Extension Watcher] Erro ao registrar evento:', error);
    }
  }

  /**
   * Método abstrato que deve ser implementado por cada monitor
   */
  abstract initialize(): void;

  /**
   * Método opcional para limpeza/restauração
   */
  restore(): void {
    // Implementação padrão vazia - pode ser sobrescrita pelos monitores específicos
  }
}
