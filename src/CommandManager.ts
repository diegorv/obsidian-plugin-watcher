import { App, Notice } from 'obsidian';
import { LogsModal } from './ui/LogsModal';
import { ExtensionWatcherSettingTab } from './ui/SettingsTab';

export class CommandManager {
  private plugin: any;
  private app: App;

  constructor(plugin: any, app: App) {
    this.plugin = plugin;
    this.app = app;
  }

  /**
	 * Registra todos os comandos do plugin
	 */
  registerCommands() {
    // Comando para abrir modal de logs
    this.plugin.addCommand({
      id: 'open-extension-watcher-logs',
      name: 'Abrir Logs do Extension Watcher',
      callback: () => {
        new LogsModal(this.app, this.plugin).open();
      },
    });

    // Comando para debug mode temporário
    this.plugin.addCommand({
      id: 'toggle-debug-mode',
      name: 'Toggle Modo Debug (Smart Composer)',
      callback: () => {
        this.toggleDebugMode();
      },
    });
  }

  /**
	 * Adiciona o ícone da ribbon
	 */
  addRibbonIcon() {
    this.plugin.addRibbonIcon('eye', 'Extension Watcher', (_evt: MouseEvent) => {
      new LogsModal(this.app, this.plugin).open();
    });
  }

  /**
	 * Adiciona a aba de configurações
	 */
  addSettingsTab() {
    this.plugin.addSettingTab(new ExtensionWatcherSettingTab(this.app, this.plugin));
  }

  /**
	 * Alterna o modo debug
	 */
  private toggleDebugMode() {
    this.plugin.settings.debugMode = !this.plugin.settings.debugMode;
    this.plugin.saveSettings();
		
    if (this.plugin.settings.debugMode) {
      new Notice('🔍 Modo Debug ATIVADO - use Smart Composer agora!');
      this.plugin.enableAggressiveDebug();
      console.log('[Extension Watcher] 🔍 MODO DEBUG ATIVADO - monitorando TUDO!');
    } else {
      new Notice('Modo Debug desativado');
      console.log('[Extension Watcher] Modo debug desativado');
    }
  }
}
