import { App, Modal, Notice } from 'obsidian';
import { ACTIVITY_EMOJIS, getPluginColor, parseUrl } from '../utils';
import { filterLogs, countLogsByPlugin, countLogsByType, getUniquePlugins } from '../utils/logFilters';

export class LogsModal extends Modal {
  plugin: any;
  private lastFilterState: { plugin?: string; type?: string } = {};
  private lastLogCount = 0;

  constructor(app: App, plugin: any) {
    super(app);
    this.plugin = plugin;
  }

  override onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Extension Watcher - Logs' });

    // Estatísticas
    const statsEl = contentEl.createDiv('extension-watcher-stats');
    const totalLogsEl = statsEl.createEl('p', { text: `Total de logs: ${this.plugin.logs.length}` });
    const activePluginsEl = statsEl.createEl('p');
    const typesEl = statsEl.createEl('p');

    // Contadores por plugin
    const pluginCounts = countLogsByPlugin(this.plugin.logs);
    const typeCounts = countLogsByType(this.plugin.logs);

    activePluginsEl.textContent = `Plugins ativos: ${Object.keys(pluginCounts).length}`;
    typesEl.textContent = `Tipos: ${Object.entries(typeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}`;

    // Botões de controle
    const controlsEl = contentEl.createDiv('extension-watcher-controls');
		
    const clearBtn = controlsEl.createEl('button', { text: 'Limpar Logs' });
    clearBtn.onclick = () => {
      this.plugin.clearLogs();
      this.updateStats(totalLogsEl, activePluginsEl, typesEl);
      this.lastLogCount = 0; // Forçar re-render
      renderLogs();
    };

    const exportBtn = controlsEl.createEl('button', { text: 'Exportar JSON' });
    exportBtn.onclick = () => {
      const dataStr = JSON.stringify(this.plugin.logs, null, 2);
      navigator.clipboard.writeText(dataStr);
      new Notice('Logs copiados para o clipboard');
    };

    // Filtros
    const filtersEl = contentEl.createDiv('extension-watcher-filters');
    filtersEl.style.marginBottom = '10px';
    filtersEl.style.display = 'flex';
    filtersEl.style.gap = '10px';
    filtersEl.style.flexWrap = 'wrap';

    // Filtro por plugin
    const pluginSelect = filtersEl.createEl('select');
    pluginSelect.style.padding = '5px';
    pluginSelect.createEl('option', { text: 'Todos os plugins', value: '' });
		
    const uniquePlugins = getUniquePlugins(this.plugin.logs);
    uniquePlugins.forEach(plugin => {
      pluginSelect.createEl('option', { text: plugin, value: plugin });
    });

    // Filtro por tipo
    const typeSelect = filtersEl.createEl('select');
    typeSelect.style.padding = '5px';
    typeSelect.createEl('option', { text: 'Todos os tipos', value: '' });
    ['file', 'command', 'network'].forEach(type => {
      typeSelect.createEl('option', { text: type, value: type });
    });

    // Lista de logs
    const logsEl = contentEl.createDiv('extension-watcher-logs');
    logsEl.style.maxHeight = '400px';
    logsEl.style.overflowY = 'auto';
    logsEl.style.border = '1px solid var(--background-modifier-border)';
    logsEl.style.padding = '10px';
    logsEl.style.marginTop = '10px';

    const renderLogs = () => {
      const pluginFilter = pluginSelect.value;
      const typeFilter = typeSelect.value;
      const currentFilterState = { plugin: pluginFilter, type: typeFilter };
      
      // Verificar se os filtros ou o número de logs mudaram
      const filtersChanged = JSON.stringify(currentFilterState) !== JSON.stringify(this.lastFilterState);
      const logCountChanged = this.plugin.logs.length !== this.lastLogCount;
      
      if (!filtersChanged && !logCountChanged) {
        return; // Não há necessidade de re-renderizar
      }
      
      this.lastFilterState = currentFilterState;
      this.lastLogCount = this.plugin.logs.length;
      
      logsEl.empty();
			
      const filters: { plugin?: string; type?: string } = {};
      if (pluginFilter) filters.plugin = pluginFilter;
      if (typeFilter) filters.type = typeFilter;
      
      const filteredLogs = filterLogs(this.plugin.logs, filters);

      filteredLogs.slice(-50).reverse().forEach(log => {
        const logEl = logsEl.createDiv('log-entry');
        logEl.setAttribute('data-type', log.type);
        logEl.style.borderBottom = '1px solid var(--background-modifier-border)';
        logEl.style.paddingBottom = '5px';
        logEl.style.marginBottom = '5px';
        logEl.style.paddingLeft = '8px';

        const timeEl = logEl.createEl('small', { 
          text: log.timestamp.toLocaleTimeString(),
          cls: 'log-time',
        });
        timeEl.style.color = 'var(--text-muted)';

        const infoEl = logEl.createEl('div', { cls: 'log-info' });
				
        // Mostrar interpretação principal se disponível
        if (log.interpretation) {
          const interpretationEl = infoEl.createEl('div', { cls: 'log-interpretation' });
          interpretationEl.textContent = log.interpretation;
          interpretationEl.style.fontWeight = 'bold';
          interpretationEl.style.marginBottom = '4px';
        }
				
        // Mostrar contexto se disponível
        if (log.context) {
          const contextEl = infoEl.createEl('div', { cls: 'log-context' });
          contextEl.textContent = log.context;
          contextEl.style.fontSize = '12px';
          contextEl.style.color = 'var(--text-muted)';
          contextEl.style.marginBottom = '4px';
        }
				
        // Linha de detalhes técnicos
        const technicalEl = infoEl.createEl('div', { cls: 'log-technical' });
        technicalEl.style.fontSize = '11px';
        technicalEl.style.color = 'var(--text-faint)';
				
        // Emoji para diferentes tipos
        const typeEmoji = ACTIVITY_EMOJIS[log.type as keyof typeof ACTIVITY_EMOJIS] || '📄';
				
        const pluginEl = technicalEl.createEl('strong', { text: `${typeEmoji} ${log.plugin}` });
				
        // Cores diferentes para cada plugin
        pluginEl.style.color = getPluginColor(log.plugin);
				
        technicalEl.createEl('span', { text: ` - ${log.action}` });

        // Mostrar informações técnicas relevantes
        if (log.type === 'network' && log.details['url']) {
          const parsedUrl = parseUrl(log.details['url'] as string);
          if (parsedUrl) {
            technicalEl.createEl('span', { 
              text: ` | ${String(log.details['method'] ?? 'GET')} ${parsedUrl.fullPath}`,
            });
          } else {
            technicalEl.createEl('span', { text: ` | ${String(log.details['url'])}` });
          }
        } else if (log.type === 'file' && log.details['path']) {
          technicalEl.createEl('span', { text: ` | ${String(log.details['path'])}` });
          if (log.details['dataLength']) {
            technicalEl.createEl('span', { text: ` (${String(log.details['dataLength'])} chars)` });
          }
        } else if (log.type === 'command' && log.details['commandId']) {
          technicalEl.createEl('span', { text: ` | ${String(log.details['commandId'])}` });
        }

        if (log.details) {
          const detailsEl = logEl.createEl('details');
          detailsEl.createEl('summary', { text: 'Detalhes' });
          const preEl = detailsEl.createEl('pre');
          preEl.style.fontSize = '12px';
          preEl.style.overflow = 'auto';
          preEl.textContent = JSON.stringify(log.details, null, 2);
        }
      });

      if (filteredLogs.length === 0) {
        logsEl.createEl('p', { text: 'Nenhum log encontrado com os filtros selecionados.' });
      }
    };

    // Event listeners para filtros
    pluginSelect.addEventListener('change', renderLogs);
    typeSelect.addEventListener('change', renderLogs);

    // Renderizar logs inicial
    renderLogs();
  }

  private updateStats(totalLogsEl: HTMLElement, activePluginsEl: HTMLElement, typesEl: HTMLElement): void {
    totalLogsEl.textContent = `Total de logs: ${this.plugin.logs.length}`;
    
    const pluginCounts = countLogsByPlugin(this.plugin.logs);
    const typeCounts = countLogsByType(this.plugin.logs);
    
    activePluginsEl.textContent = `Plugins ativos: ${Object.keys(pluginCounts).length}`;
    typesEl.textContent = `Tipos: ${Object.entries(typeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}`;
  }

  override onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
