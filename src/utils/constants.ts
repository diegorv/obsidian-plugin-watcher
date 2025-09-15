/**
 * Constantes compartilhadas para o Extension Watcher
 */

/**
 * Emojis para diferentes tipos de atividade
 */
export const ACTIVITY_EMOJIS = Object.freeze({
  file: '📁',
  command: '⚡',
  network: '🌐',
  note: '📝',
  config: '⚙️',
  style: '🎨',
  code: '💻',
  image: '🖼️',
  pdf: '📄',
  template: '📄',
  core: '🔧',
  webWorker: '🔧',
  eventSource: '📡',
  websocket: '🔌',
  timeout: '⏰',
  domInjection: '🎨',
  asyncOps: '🔄',
});

/**
 * Cores para diferentes plugins (baseado em hash do nome)
 */
export const PLUGIN_COLORS = Object.freeze([
  'var(--color-accent)',
  'var(--color-blue)', 
  'var(--color-green)',
  'var(--color-orange)',
  'var(--color-purple)',
]);

/**
 * Tipos de atividade suportados
 */
export const ACTIVITY_TYPES = Object.freeze(['file', 'command', 'network']);

/**
 * Ações de arquivo suportadas
 */
export const FILE_ACTIONS = Object.freeze({
  read: 'lendo',
  modify: 'editando', 
  create: 'criando',
  delete: 'excluindo',
});

/**
 * Extensões de arquivo e seus tipos
 */
export const FILE_EXTENSIONS = Object.freeze({
  md: 'nota',
  json: 'configurações',
  css: 'estilos',
  js: 'código',
  ts: 'código',
  png: 'imagem',
  jpg: 'imagem',
  jpeg: 'imagem',
  gif: 'imagem',
  svg: 'imagem',
  pdf: 'PDF',
});
