import { App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class CanvasMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorCanvasFileOperations();
  }

  private monitorCanvasFileOperations() {
    const vault = this.app?.vault;
    if (!vault) return;

    // Interceptar criação de arquivos de canvas
    const originalCreate = vault.create;
    vault.create = async (path: string, data: string) => {
      if (path.endsWith('.canvas')) {
        const pluginName = this.detectPluginFromStack();
        this.addLog('canvas', 'canvas-file-created', {
          filePath: path,
          dataLength: data.length,
        }, pluginName);
      }
      
      return await originalCreate.call(vault, path, data);
    };

    // Interceptar leitura de arquivos de canvas
    const originalRead = vault.read;
    vault.read = async (file: any) => {
      if (file.extension === 'canvas') {
        const pluginName = this.detectPluginFromStack();
        this.addLog('canvas', 'canvas-file-read', {
          filePath: file.path,
          fileName: file.name,
        }, pluginName);
      }
      
      return await originalRead.call(vault, file);
    };
  }
}