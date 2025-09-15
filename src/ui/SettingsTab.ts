import { App, PluginSettingTab, Setting, Notice, Plugin } from 'obsidian';

export class ExtensionWatcherSettingTab extends PluginSettingTab {
  plugin: any;

  constructor(app: App, plugin: any) {
    super(app, plugin as Plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    if (!this.plugin.settings) {
      throw new Error('Plugin settings not found');
    }

    containerEl.createEl('h2', { text: 'Extension Watcher - Configurações' });

    new Setting(containerEl)
      .setName('Monitorar Acesso a Arquivos')
      .setDesc('Rastrear quando plugins leem, modificam, criam ou deletam arquivos')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.monitorFileAccess)
        .onChange(async (value) => {
          this.plugin.settings.monitorFileAccess = value;
          this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Monitorar Comandos')
      .setDesc('Rastrear quando plugins executam comandos')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.monitorCommands)
        .onChange(async (value) => {
          this.plugin.settings.monitorCommands = value;
          this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Monitorar Chamadas de Rede')
      .setDesc('Rastrear requisições HTTP/HTTPS feitas por plugins')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.monitorNetworkCalls)
        .onChange(async (value) => {
          this.plugin.settings.monitorNetworkCalls = value;
          this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Mostrar Notificações')
      .setDesc('Exibir notificações em tempo real das atividades')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showNotifications)
        .onChange(async (value) => {
          this.plugin.settings.showNotifications = value;
          this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Log no Console')
      .setDesc('Registrar atividades no console do navegador')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.logToConsole)
        .onChange(async (value) => {
          this.plugin.settings.logToConsole = value;
          this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Máximo de Logs')
      .setDesc('Número máximo de entradas de log a manter na memória')
      .addText(text => text
        .setPlaceholder('1000')
        .setValue(this.plugin.settings.maxLogEntries.toString())
        .onChange(async (value) => {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) {
            this.plugin.settings.maxLogEntries = num;
            this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Excluir Logs Próprios')
      .setDesc('Não registrar atividades do próprio Extension Watcher')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.excludeSelfLogs)
        .onChange(async (value) => {
          this.plugin.settings.excludeSelfLogs = value;
          this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Modo Debug')
      .setDesc('⚠️ Ativar monitoramento agressivo (MUITO verboso - use apenas para debugging)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          this.plugin.saveSettings();
					
          if (value) {
            new Notice('⚠️ Modo Debug ativado - prepare-se para MUITOS logs!');
            this.plugin.enableAggressiveDebug();
          } else {
            new Notice('Modo Debug desativado - recarregue o Obsidian para aplicar');
          }
        }));
  }
}
