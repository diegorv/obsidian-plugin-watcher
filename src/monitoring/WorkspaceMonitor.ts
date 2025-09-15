import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class WorkspaceMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorWorkspaceEvents();
  }

  private monitorWorkspaceEvents() {
    const workspace = this.app?.workspace;
    if (!workspace) return;

    // Monitorar eventos do workspace usando eventos que existem
    this.registerEvent(workspace.on('layout-change', () => {
      const pluginName = this.detectPluginFromStack();
      const activeLeaf = workspace.activeLeaf;
      
      this.addLog('workspace', 'layout-change', {
        timestamp: Date.now(),
        activeViewType: activeLeaf?.view?.getViewType(),
        hasLeftSplit: !!workspace.leftSplit,
        hasRightSplit: !!workspace.rightSplit,
        activeFile: activeLeaf?.view?.getState()?.['file'],
      }, pluginName);
    }));

    this.registerEvent(workspace.on('active-leaf-change', (leaf) => {
      const pluginName = this.detectPluginFromStack();
      const view = leaf?.view;
      const state = view?.getState();
      
      this.addLog('workspace', 'active-leaf-change', {
        viewType: view?.getViewType(),
        file: state?.['file'],
        filePath: (state?.['file'] as any)?.path,
        fileName: (state?.['file'] as any)?.name,
        hasSelection: state?.['selection'],
        cursorPosition: state?.['cursor'],
        isMarkdownView: view?.getViewType() === 'markdown',
        isCanvasView: view?.getViewType() === 'canvas',
        isGraphView: view?.getViewType() === 'graph',
        isSearchView: view?.getViewType() === 'search',
        isFileExplorerView: view?.getViewType() === 'file-explorer',
      }, pluginName);
    }));

    this.registerEvent(workspace.on('file-open', (file) => {
      const pluginName = this.detectPluginFromStack();
      const activeLeaf = workspace.activeLeaf;
      const view = activeLeaf?.view;
      
      this.addLog('workspace', 'file-open', {
        filePath: file?.path,
        fileName: file?.name,
        extension: file?.extension,
        size: file?.stat?.size,
        mtime: file?.stat?.mtime,
        viewType: view?.getViewType(),
        isNewFile: !file?.stat?.size,
        isBinary: file?.extension && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'pdf', 'zip', 'mp3', 'mp4'].includes(file.extension.toLowerCase()),
        hasFrontmatter: false, // Será preenchido se for markdown
      }, pluginName);
    }));

    // Adicionar monitoramento de eventos adicionais
    this.registerEvent(workspace.on('resize', () => {
      const pluginName = this.detectPluginFromStack();
      this.addLog('workspace', 'resize', {
        timestamp: Date.now(),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }, pluginName);
    }));

    this.registerEvent(workspace.on('css-change', () => {
      const pluginName = this.detectPluginFromStack();
      this.addLog('workspace', 'css-change', {
        timestamp: Date.now(),
      }, pluginName);
    }));
  }
}