import { Plugin, Notice } from 'obsidian';
import { ExtensionWatcherSettings, LogEntry, DEFAULT_SETTINGS } from './types';
import { MonitorManager } from './monitoring/MonitorManager';
import { ActivityInterpreter, PluginDetector } from './interpretation';
import { CommandManager } from './CommandManager';

export class ExtensionWatcherPlugin extends Plugin {
  settings!: ExtensionWatcherSettings;
  logs: LogEntry[] = [];
	
  // Managers
  private monitorManager!: MonitorManager;
  private commandManager!: CommandManager;
	
  // Interpretadores
  private activityInterpreter!: ActivityInterpreter;
  private pluginDetector!: PluginDetector;

  override async onload() {
    await this.loadSettings();

    // Inicializar componentes
    this.initializeComponents();

    // Registrar comandos e UI
    this.commandManager.registerCommands();
    this.commandManager.addRibbonIcon();
    this.commandManager.addSettingsTab();

    // Inicializar monitoramento
    this.monitorManager.initializeMonitoring();

    console.log('Extension Watcher Plugin carregado');
  }

  override onunload() {
    // Restaurar funcionalidades originais
    if (this.monitorManager) {
      this.monitorManager.restore();
    }
    
    console.log('Extension Watcher Plugin descarregado');
  }

  private initializeComponents() {
    // Inicializar managers
    this.monitorManager = new MonitorManager(this, this.app);
    this.commandManager = new CommandManager(this, this.app);

    // Inicializar interpretadores
    this.activityInterpreter = new ActivityInterpreter();
    this.pluginDetector = new PluginDetector(this.settings);
  }

  async loadSettings() {
    const loadedData = await this.loadData() as Partial<ExtensionWatcherSettings>;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  enableAggressiveDebug() {
    this.monitorManager.enableAggressiveDebug();
  }

  // Método público para detectar plugin (usado pelos monitores)
  detectPluginFromStack(stack?: string): string {
    return this.pluginDetector.detectPluginFromStack(stack);
  }

  // Método público para interpretar atividade (usado pelos monitores)
  interpretActivity(
    type: string,
    plugin: string,
    action: string,
    details: Record<string, unknown>,
  ) {
    return this.activityInterpreter.interpretActivity(type, plugin, action, details);
  }

  addLog(entry: Omit<LogEntry, 'timestamp'>) {
    // Filtrar logs do próprio plugin se a configuração estiver ativa
    if (this.shouldExcludeLog(entry)) {
      return;
    }

    // Re-processar a detecção do plugin se necessário
    const processedEntry = this.processPluginDetection(entry);

    // Adicionar interpretação e contexto
    const logEntry = this.createLogEntry(processedEntry);

    this.addLogToStorage(logEntry);
    this.handleLogOutput(logEntry);
  }

  private shouldExcludeLog(entry: Omit<LogEntry, 'timestamp'>): boolean {
    return this.settings.excludeSelfLogs && entry.plugin === 'obsidian-extension-watcher';
  }

  private processPluginDetection(entry: Omit<LogEntry, 'timestamp'>): Omit<LogEntry, 'timestamp'> {
    if (entry.plugin === 'unknown' && Array.isArray(entry.details['stack'])) {
      const betterPluginName = this.detectPluginFromStack(entry.details['stack'].join('\n'));
      if (betterPluginName !== 'unknown') {
        return { ...entry, plugin: betterPluginName };
      }
    }
    return entry;
  }

  private createLogEntry(entry: Omit<LogEntry, 'timestamp'>): LogEntry {
    const interpretation = this.interpretActivity(
      entry.type,
      entry.plugin,
      entry.action,
      entry.details,
    );
		
    return {
      ...entry,
      timestamp: new Date(),
      interpretation: interpretation.interpretation,
      context: interpretation.context,
    };
  }

  private addLogToStorage(logEntry: LogEntry): void {
    this.logs.push(logEntry);

    // Limitar número de logs de forma mais eficiente
    if (this.logs.length > this.settings.maxLogEntries) {
      const excess = this.logs.length - this.settings.maxLogEntries;
      this.logs.splice(0, excess); // Remove do início em vez de recriar array
    }
  }

  private handleLogOutput(logEntry: LogEntry): void {
    // Log no console se habilitado
    if (this.settings.logToConsole) {
      console.log('[Extension Watcher]', logEntry);
    }

    // Mostrar notificação se habilitado
    if (this.settings.showNotifications) {
      new Notice(`${logEntry.plugin}: ${logEntry.action} ${logEntry.type}`);
    }
  }

  getLogsForPlugin(pluginName: string): LogEntry[] {
    return this.logs.filter(log => log.plugin === pluginName);
  }

  getLogsForType(type: LogEntry['type']): LogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  clearLogs() {
    this.logs = [];
  }
}
