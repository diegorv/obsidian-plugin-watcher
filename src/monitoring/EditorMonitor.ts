import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class EditorMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorEditorEvents();
  }

  private monitorEditorEvents() {
    const workspace = this.app?.workspace;
    if (!workspace) return;

    // Monitorar eventos do editor usando eventos que existem
    this.registerEvent(workspace.on('editor-change', (editor: any) => {
      const pluginName = this.detectPluginFromStack();
      const cursor = editor.getCursor();
      const selection = editor.getSelection();
      const lineCount = editor.lineCount();
      const content = editor.getValue();
      
      this.addLog('editor', 'editor-change', {
        lineCount,
        hasSelection: editor.somethingSelected(),
        selectionLength: selection.length,
        cursorLine: cursor.line,
        cursorCh: cursor.ch,
        contentLength: content.length,
        wordCount: content.split(/\s+/).filter((word: string) => word.length > 0).length,
        hasMarkdown: content.includes('#') || content.includes('*') || content.includes('`'),
        hasLinks: content.includes('[[') || content.includes(']('),
        hasTags: content.includes('#'),
        hasFrontmatter: content.startsWith('---'),
        isEmpty: content.trim().length === 0,
        lastModified: Date.now(),
      }, pluginName);
    }));

    // Nota: cursor-change e selection-change não são eventos suportados pela API do Obsidian
    // Mantemos apenas o editor-change que já captura mudanças de cursor e seleção

    // Monitorar modificações de texto
    this.registerEvent(workspace.on('editor-change', (editor: any, info: any) => {
      const pluginName = this.detectPluginFromStack();
      
      if (info && info.origin) {
        this.addLog('editor', 'text-modification', {
          origin: info.origin,
          from: info.from,
          to: info.to,
          text: info.text,
          removed: info.removed,
          lineCount: editor.lineCount(),
          contentLength: editor.getValue().length,
        }, pluginName);
      }
    }));
  }
}