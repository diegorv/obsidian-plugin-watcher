import { App } from 'obsidian';
import { NetworkMonitor } from './NetworkMonitor';
import { FileMonitor } from './FileMonitor';
import { CommandMonitor } from './CommandMonitor';
import { AdvancedAPIMonitor } from './AdvancedAPIMonitor';
import { DebugMonitor } from './DebugMonitor';
import { WorkspaceMonitor } from './WorkspaceMonitor';
import { MetadataMonitor } from './MetadataMonitor';
import { KeymapMonitor } from './KeymapMonitor';
import { ModalMonitor } from './ModalMonitor';
import { EditorMonitor } from './EditorMonitor';
import { CanvasMonitor } from './CanvasMonitor';
import { SettingsMonitor } from './SettingsMonitor';

export class MonitorManager {
  private plugin: any;
  private app: App;
	
  // Monitores
  private networkMonitor!: NetworkMonitor;
  private fileMonitor!: FileMonitor;
  private commandMonitor!: CommandMonitor;
  private advancedAPIMonitor!: AdvancedAPIMonitor;
  private debugMonitor!: DebugMonitor;
  private workspaceMonitor!: WorkspaceMonitor;
  private metadataMonitor!: MetadataMonitor;
  private keymapMonitor!: KeymapMonitor;
  private modalMonitor!: ModalMonitor;
  private editorMonitor!: EditorMonitor;
  private canvasMonitor!: CanvasMonitor;
  private settingsMonitor!: SettingsMonitor;

  constructor(plugin: any, app: App) {
    this.plugin = plugin;
    this.app = app;
    this.initializeMonitors();
  }

  private initializeMonitors() {
    // Inicializar todos os monitores
    this.networkMonitor = new NetworkMonitor(this.plugin);
    this.fileMonitor = new FileMonitor(this.app, this.plugin);
    this.commandMonitor = new CommandMonitor(this.app, this.plugin);
    this.advancedAPIMonitor = new AdvancedAPIMonitor(this.plugin);
    this.debugMonitor = new DebugMonitor(this.plugin);
    this.workspaceMonitor = new WorkspaceMonitor(this.app, this.plugin);
    this.metadataMonitor = new MetadataMonitor(this.app, this.plugin);
    this.keymapMonitor = new KeymapMonitor(this.app, this.plugin);
    this.modalMonitor = new ModalMonitor(this.app, this.plugin);
    this.editorMonitor = new EditorMonitor(this.app, this.plugin);
    this.canvasMonitor = new CanvasMonitor(this.app, this.plugin);
    this.settingsMonitor = new SettingsMonitor(this.app, this.plugin);
  }

  /**
	 * Inicializa o monitoramento baseado nas configurações
	 */
  initializeMonitoring() {
    const settings = this.plugin.settings;

    if (settings.monitorNetworkCalls) {
      this.networkMonitor.initialize();
    }
		
    if (settings.monitorFileAccess) {
      this.fileMonitor.initialize();
    }

    if (settings.monitorCommands) {
      this.commandMonitor.initialize();
    }

    // Monitoramento adicional para APIs modernas (sempre ativo)
    this.advancedAPIMonitor.initialize();

    // Novos monitores (sempre ativos para cobertura completa)
    this.workspaceMonitor.initialize();
    this.metadataMonitor.initialize();
    this.keymapMonitor.initialize();
    this.modalMonitor.initialize();
    this.editorMonitor.initialize();
    this.canvasMonitor.initialize();
    this.settingsMonitor.initialize();

    // Modo debug agressivo se habilitado
    if (settings.debugMode) {
      this.enableAggressiveDebug();
    }
  }

  /**
	 * Habilita modo debug agressivo
	 */
  enableAggressiveDebug() {
    this.debugMonitor.enableAggressiveDebug();
  }

  /**
	 * Restaura funcionalidades originais de todos os monitores
	 */
  restore() {
    this.networkMonitor?.restore();
    this.fileMonitor?.restore();
    this.commandMonitor?.restore();
    this.advancedAPIMonitor?.restore();
    this.debugMonitor?.restore();
    this.workspaceMonitor?.restore();
    this.metadataMonitor?.restore();
    this.keymapMonitor?.restore();
    this.modalMonitor?.restore();
    this.editorMonitor?.restore();
    this.canvasMonitor?.restore();
    this.settingsMonitor?.restore();
  }
}
