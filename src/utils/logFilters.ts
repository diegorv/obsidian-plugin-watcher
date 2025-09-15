import { LogEntry } from '../types';

/**
 * Utilitários para filtragem de logs
 */

export interface LogFilters {
	plugin?: string;
	type?: string;
}

/**
 * Filtra logs baseado nos critérios fornecidos
 */
export function filterLogs(logs: LogEntry[], filters: LogFilters): LogEntry[] {
  return logs.filter(log => {
    const pluginMatch = !filters.plugin || log.plugin === filters.plugin;
    const typeMatch = !filters.type || log.type === filters.type;
    return pluginMatch && typeMatch;
  });
}

/**
 * Obtém lista única de plugins dos logs
 */
export function getUniquePlugins(logs: LogEntry[]): string[] {
  return [...new Set(logs.map(log => log.plugin))].sort();
}

/**
 * Conta logs por plugin
 */
export function countLogsByPlugin(logs: LogEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  logs.forEach(log => {
    counts[log.plugin] = (counts[log.plugin] ?? 0) + 1;
  });
  return counts;
}

/**
 * Conta logs por tipo
 */
export function countLogsByType(logs: LogEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  logs.forEach(log => {
    counts[log.type] = (counts[log.type] ?? 0) + 1;
  });
  return counts;
}
