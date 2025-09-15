import { ACTIVITY_EMOJIS, FILE_ACTIONS, FILE_EXTENSIONS, PLUGIN_COLORS } from './constants';

/**
 * Utilitários para formatação de dados
 */

/**
 * Formata timestamp para exibição
 */
export function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleTimeString();
}

/**
 * Formata contexto de arquivo
 */
export function formatFileContext(path: string): string {
  if (!path) return 'arquivo';
  
  const parts = path.split('/');
  const folder = parts.length > 1 ? parts[parts.length - 2] : '';
	
  return folder ? `📁 ${folder}` : 'arquivo';
}

/**
 * Obtém texto de ação em português
 */
export function getActionText(action: string): string {
  return FILE_ACTIONS[action as keyof typeof FILE_ACTIONS] || action;
}

/**
 * Obtém emoji para tipo de atividade
 */
export function getActivityEmoji(type: string): string {
  return ACTIVITY_EMOJIS[type as keyof typeof ACTIVITY_EMOJIS] || '📄';
}

/**
 * Obtém cor para plugin baseada no nome
 */
export function getPluginColor(pluginName: string): string {
  if (!pluginName || typeof pluginName !== 'string') {
    return PLUGIN_COLORS[0] as string;
  }
  
  // Calcular índice baseado no hash do nome do plugin
  const colorIndex = pluginName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % PLUGIN_COLORS.length;
  
  return (PLUGIN_COLORS[colorIndex] ?? PLUGIN_COLORS[0]) as string;
}

/**
 * Detecta tipo de arquivo baseado na extensão
 */
export function getFileTypeFromExtension(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  return FILE_EXTENSIONS[extension as keyof typeof FILE_EXTENSIONS] || 'arquivo';
}

/**
 * Formata informações de agrupamento de requisições
 */
export function formatGroupedRequest(repeatCount: number, timeSpan: number): string {
  const timeSpanSeconds = Math.round(timeSpan / 1000);
  return ` (${repeatCount}x em ${timeSpanSeconds}s)`;
}

/**
 * Obtém emoji para tipo de arquivo baseado na extensão
 */
export function getFileTypeEmoji(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
	
  switch (extension) {
  case 'md':
    return ACTIVITY_EMOJIS.note;
  case 'json':
    return ACTIVITY_EMOJIS.config;
  case 'css':
    return ACTIVITY_EMOJIS.style;
  case 'js':
  case 'ts':
    return ACTIVITY_EMOJIS.code;
  case 'png':
  case 'jpg':
  case 'jpeg':
  case 'gif':
  case 'svg':
    return ACTIVITY_EMOJIS.image;
  case 'pdf':
    return ACTIVITY_EMOJIS.pdf;
  default:
    return ACTIVITY_EMOJIS.file;
  }
}
