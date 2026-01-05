import { TFile, App } from 'obsidian';
import { BaseMonitor } from './BaseMonitor';

export class FileMonitor extends BaseMonitor {
  constructor(app: App, plugin: any) {
    super(plugin, app);
  }

  initialize() {
    this.monitorVaultRead();
    this.monitorVaultModify();
    this.monitorVaultCreate();
    this.monitorVaultDelete();
  }

  private monitorVaultRead() {
    const self = this;

    // Interceptar Vault.read
    const vault = this.app?.vault;
    if (!vault?.read) return;

    const originalRead = vault.read.bind(vault);
    
    vault.read = async (file: TFile) => {
      const pluginName = self.detectPluginFromStack();
      const startTime = performance.now();

      const result = await originalRead(file);
      const endTime = performance.now();

      self.addLog('file', 'read', {
        path: file.path,
        name: file.name,
        extension: file.extension,
        size: file.stat.size,
        mtime: file.stat.mtime,
        ctime: file.stat.ctime,
        contentLength: result.length,
        readTime: Math.round(endTime - startTime),
        isBinary: file.extension && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'pdf', 'zip', 'mp3', 'mp4'].includes(file.extension.toLowerCase()),
      }, pluginName);

      return result;
    };
  }

  private monitorVaultModify() {
    const self = this;

    // Interceptar Vault.modify
    const vault = this.app?.vault;
    if (!vault?.modify) return;

    const originalModify = vault.modify.bind(vault);
    
    vault.modify = async (file: TFile, data: string) => {
      const pluginName = self.detectPluginFromStack();
      const startTime = performance.now();

      // Capturar conteúdo anterior para comparação
      let previousContent = '';
      try {
        previousContent = await vault.read(file);
      } catch (e) {
        // Arquivo pode não existir ainda
      }

      const result = await originalModify(file, data);
      const endTime = performance.now();

      // Calcular diferenças
      const contentDiff = data.length - previousContent.length;
      const lineCount = data.split('\n').length;
      const wordCount = data.split(/\s+/).filter(word => word.length > 0).length;

      self.addLog('file', 'modify', {
        path: file.path,
        name: file.name,
        extension: file.extension,
        size: file.stat.size,
        dataLength: data.length,
        previousLength: previousContent.length,
        contentDiff,
        lineCount,
        wordCount,
        modifyTime: Math.round(endTime - startTime),
        hasMarkdown: file.extension === 'md',
        hasFrontmatter: data.startsWith('---'),
      }, pluginName);

      return result;
    };
  }

  private monitorVaultCreate() {
    const self = this;

    // Interceptar Vault.create
    const vault = this.app?.vault;
    if (!vault?.create) return;

    const originalCreate = vault.create.bind(vault);
    
    vault.create = async (path: string, data: string) => {
      const pluginName = self.detectPluginFromStack();
      const startTime = performance.now();

      const result = await originalCreate(path, data);
      const endTime = performance.now();

      // Extrair informações do caminho
      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const extension = fileName && fileName.includes('.') ? fileName.split('.').pop() || '' : '';
      const directory = pathParts.slice(0, -1).join('/');

      const lineCount = data.split('\n').length;
      const wordCount = data.split(/\s+/).filter(word => word.length > 0).length;

      self.addLog('file', 'create', {
        path,
        fileName,
        extension,
        directory,
        dataLength: data.length,
        lineCount,
        wordCount,
        createTime: Math.round(endTime - startTime),
        hasMarkdown: extension === 'md',
        hasFrontmatter: data.startsWith('---'),
        isTemplate: data.includes('{{') && data.includes('}}'),
      }, pluginName);

      return result;
    };
  }

  private monitorVaultDelete() {
    const self = this;

    // Interceptar Vault.delete
    const vault = this.app?.vault;
    if (!vault?.delete) return;

    const originalDelete = vault.delete.bind(vault);
    
    vault.delete = async (file: TFile) => {
      const pluginName = self.detectPluginFromStack();
      const startTime = performance.now();

      // Capturar informações antes de deletar
      const fileInfo = {
        path: file.path,
        name: file.name,
        extension: file.extension,
        size: file.stat.size,
        mtime: file.stat.mtime,
        ctime: file.stat.ctime,
        isBinary: file.extension && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'pdf', 'zip', 'mp3', 'mp4'].includes(file.extension.toLowerCase()),
      };

      const result = await originalDelete(file);
      const endTime = performance.now();

      self.addLog('file', 'delete', {
        ...fileInfo,
        deleteTime: Math.round(endTime - startTime),
      }, pluginName);

      return result;
    };
  }
}
