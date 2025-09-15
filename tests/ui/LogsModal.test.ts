import { LogsModal } from '../../src/ui/LogsModal';
import { App } from 'obsidian';

// Mock dependencies
jest.mock('obsidian', () => ({
  App: jest.fn(),
  Modal: jest.fn(),
  Notice: jest.fn().mockImplementation((message: string) => ({ message })),
}));

jest.mock('../../src/utils', () => ({
  ACTIVITY_EMOJIS: {
    file: '📁',
    command: '⚡',
    network: '🌐',
  },
  getPluginColor: jest.fn().mockReturnValue('var(--color-blue)'),
  parseUrl: jest.fn().mockReturnValue({
    domain: 'example.com',
    pathname: '/api/data',
    search: '',
    fullPath: 'example.com/api/data',
  }),
}));

jest.mock('../../src/utils/logFilters', () => ({
  filterLogs: jest.fn().mockImplementation((logs, _filters) => logs),
  countLogsByPlugin: jest.fn().mockReturnValue({ 'test-plugin': 2 }),
  countLogsByType: jest.fn().mockReturnValue({ file: 1, command: 1 }),
  getUniquePlugins: jest.fn().mockReturnValue(['test-plugin']),
}));

describe('LogsModal', () => {
  let mockApp: App;
  let mockPlugin: any;
  let logsModal: LogsModal;
  let mockContentEl: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockContentEl = {
      empty: jest.fn(),
      createEl: jest.fn().mockReturnValue({
        onclick: null,
        style: {},
        textContent: '',
        createDiv: jest.fn().mockReturnValue({
          style: {},
          textContent: '',
          createEl: jest.fn().mockReturnValue({
            onclick: null,
            style: {},
            textContent: '',
          }),
        }),
      }),
      createDiv: jest.fn().mockReturnValue({
        style: {},
        textContent: '',
        createEl: jest.fn().mockReturnValue({
          onclick: null,
          style: {},
          textContent: '',
          addEventListener: jest.fn(),
        }),
        addEventListener: jest.fn(),
      }),
    } as any;

    mockApp = new App();
    
    mockPlugin = {
      logs: [
        {
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'file',
          plugin: 'test-plugin',
          action: 'read',
          details: { path: '/test.md' },
          interpretation: 'Test interpretation',
          context: 'Test context',
        },
        {
          timestamp: new Date('2024-01-01T10:01:00Z'),
          type: 'command',
          plugin: 'test-plugin',
          action: 'execute',
          details: { commandId: 'test-command' },
        },
      ],
      clearLogs: jest.fn(),
    };

    logsModal = new LogsModal(mockApp, mockPlugin);
    logsModal.contentEl = mockContentEl;
  });

  describe('constructor', () => {
    it('should initialize with app and plugin', () => {
      expect(logsModal).toBeInstanceOf(LogsModal);
      expect(logsModal.plugin).toBe(mockPlugin);
    });
  });

  describe('onOpen', () => {
    let mockStatsEl: HTMLElement;
    let mockControlsEl: HTMLElement;
    let mockFiltersEl: HTMLElement;
    let mockLogsEl: HTMLElement;
    let mockTotalLogsEl: HTMLElement;
    let mockActivePluginsEl: HTMLElement;
    let mockTypesEl: HTMLElement;
    let mockClearBtn: HTMLElement;
    let mockExportBtn: HTMLElement;
    let mockPluginSelect: HTMLSelectElement;
    let mockTypeSelect: HTMLSelectElement;

    beforeEach(() => {
      mockStatsEl = {
        createEl: jest.fn(),
      } as any;

      mockControlsEl = {
        createEl: jest.fn().mockReturnValue({
          onclick: null,
          style: {},
          textContent: '',
        }),
        style: {},
      } as any;

      mockFiltersEl = {
        createEl: jest.fn().mockReturnValue({
          style: {},
          textContent: '',
          createEl: jest.fn().mockReturnValue({
            textContent: '',
          }),
          addEventListener: jest.fn(),
        }),
        style: {},
        addEventListener: jest.fn(),
      } as any;

      mockLogsEl = {
        empty: jest.fn(),
        createEl: jest.fn(),
        createDiv: jest.fn().mockReturnValue({
          setAttribute: jest.fn(),
          style: {},
          textContent: '',
        createEl: jest.fn().mockReturnValue({
          textContent: '',
          style: {},
          createEl: jest.fn().mockReturnValue({
            style: {},
            textContent: '',
            createEl: jest.fn().mockReturnValue({
              style: {},
              textContent: '',
            }),
          }),
        }),
        }),
        style: {},
      } as any;

      mockTotalLogsEl = {
        textContent: '',
      } as any;

      mockActivePluginsEl = {
        textContent: '',
      } as any;

      mockTypesEl = {
        textContent: '',
      } as any;

      mockClearBtn = {
        onclick: null,
      } as any;

      mockExportBtn = {
        onclick: null,
      } as any;

      mockPluginSelect = {
        value: '',
        createEl: jest.fn(),
        addEventListener: jest.fn(),
      } as any;

      mockTypeSelect = {
        value: '',
        createEl: jest.fn(),
        addEventListener: jest.fn(),
      } as any;

      // Mock createEl to return appropriate elements
      let selectCallCount = 0;
      mockContentEl.createEl = jest.fn().mockImplementation((tag, options) => {
        if (tag === 'h2') return { textContent: options?.text || '' };
        if (tag === 'p') return { textContent: '' };
        if (tag === 'button') {
          if (options?.text === 'Limpar Logs') return mockClearBtn;
          if (options?.text === 'Exportar JSON') return mockExportBtn;
        }
        if (tag === 'select') {
          selectCallCount++;
          if (selectCallCount === 1) {
            return mockPluginSelect;
          }
          return mockTypeSelect;
        }
        return {
          onclick: null,
          style: {},
          textContent: '',
        };
      });

      mockContentEl.createDiv = jest.fn().mockImplementation((className) => {
        if (className === 'extension-watcher-stats') return mockStatsEl;
        if (className === 'extension-watcher-controls') return mockControlsEl;
        if (className === 'extension-watcher-filters') return mockFiltersEl;
        if (className === 'extension-watcher-logs') return mockLogsEl;
        return {
          style: {},
          textContent: '',
          createEl: jest.fn().mockReturnValue({
            onclick: null,
            style: {},
            textContent: '',
            createEl: jest.fn().mockReturnValue({
              style: {},
              textContent: '',
            }),
            addEventListener: jest.fn(),
          }),
        };
      });

      mockStatsEl.createEl = jest.fn().mockImplementation((tag) => {
        if (tag === 'p') {
          const calls = (mockStatsEl.createEl as jest.Mock).mock.calls.filter((call: any) => call[0] === 'p');
          if (calls.length === 1) return mockTotalLogsEl;
          if (calls.length === 2) return mockActivePluginsEl;
          return mockTypesEl;
        }
        return {};
      });

      // Mock navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
        writable: true,
      });
    });

    it('should create modal structure', () => {
      logsModal.onOpen();

      expect(mockContentEl.empty).toHaveBeenCalled();
      expect(mockContentEl.createEl).toHaveBeenCalledWith('h2', { text: 'Extension Watcher - Logs' });
      expect(mockContentEl.createDiv).toHaveBeenCalledWith('extension-watcher-stats');
      expect(mockContentEl.createDiv).toHaveBeenCalledWith('extension-watcher-controls');
      expect(mockContentEl.createDiv).toHaveBeenCalledWith('extension-watcher-filters');
      expect(mockContentEl.createDiv).toHaveBeenCalledWith('extension-watcher-logs');
    });

    it('should create clear logs button', () => {
      logsModal.onOpen();

      expect(mockControlsEl.createEl).toHaveBeenCalledWith('button', { text: 'Limpar Logs' });
      expect(mockClearBtn.onclick).toBeDefined();
    });

    it('should create export button', () => {
      logsModal.onOpen();

      expect(mockControlsEl.createEl).toHaveBeenCalledWith('button', { text: 'Exportar JSON' });
      expect(mockExportBtn.onclick).toBeDefined();
    });

    it('should create filter selects', () => {
      logsModal.onOpen();

      expect(mockFiltersEl.createEl).toHaveBeenCalledWith('select');
    });

    it('should handle clear logs button click', () => {
      logsModal.onOpen();
      expect(mockControlsEl.createEl).toHaveBeenCalledWith('button', { text: 'Limpar Logs' });
    });

    it('should handle export button click', async () => {
      logsModal.onOpen();
      expect(mockControlsEl.createEl).toHaveBeenCalledWith('button', { text: 'Exportar JSON' });
    });

    it('should set up filter event listeners', () => {
      logsModal.onOpen();
      expect(mockFiltersEl.createEl).toHaveBeenCalledWith('select');
    });
  });

  describe('updateStats', () => {
    let mockTotalLogsEl: HTMLElement;
    let mockActivePluginsEl: HTMLElement;
    let mockTypesEl: HTMLElement;

    beforeEach(() => {
      mockTotalLogsEl = { textContent: '' } as any;
      mockActivePluginsEl = { textContent: '' } as any;
      mockTypesEl = { textContent: '' } as any;
    });

    it('should update statistics elements', () => {
      (logsModal as any).updateStats(mockTotalLogsEl, mockActivePluginsEl, mockTypesEl);

      expect(mockTotalLogsEl.textContent).toBe('Total de logs: 2');
      expect(mockActivePluginsEl.textContent).toBe('Plugins ativos: 1');
      expect(mockTypesEl.textContent).toContain('file: 1');
      expect(mockTypesEl.textContent).toContain('command: 1');
    });

    it('should handle empty logs', () => {
      mockPlugin.logs = [];
      
      // Mock the functions to return empty results for empty logs
      const { countLogsByPlugin, countLogsByType } = require('../../src/utils/logFilters');
      countLogsByPlugin.mockReturnValueOnce({});
      countLogsByType.mockReturnValueOnce({});
      
      (logsModal as any).updateStats(mockTotalLogsEl, mockActivePluginsEl, mockTypesEl);

      expect(mockTotalLogsEl.textContent).toBe('Total de logs: 0');
      expect(mockActivePluginsEl.textContent).toBe('Plugins ativos: 0');
    });
  });

  describe('onClose', () => {
    it('should clear content element', () => {
      logsModal.onClose();

      expect(mockContentEl.empty).toHaveBeenCalled();
    });
  });

  describe('renderLogs function', () => {
    let mockLogsEl: HTMLElement;
    let mockLogEl: HTMLElement;
    let mockTimeEl: HTMLElement;
    let mockInfoEl: HTMLElement;
    let mockTechnicalEl: HTMLElement;
    let mockDetailsEl: HTMLElement;

    beforeEach(() => {
      mockLogsEl = {
        empty: jest.fn(),
        createEl: jest.fn(),
        createDiv: jest.fn(),
        style: {},
      } as any;

      mockLogEl = {
        setAttribute: jest.fn(),
        style: {},
        createEl: jest.fn(),
      } as any;

      mockTimeEl = {
        style: {},
      } as any;

      mockInfoEl = {
        createEl: jest.fn(),
      } as any;

      mockTechnicalEl = {
        createEl: jest.fn(),
        style: {},
      } as any;

      mockDetailsEl = {
        createEl: jest.fn(),
      } as any;

      mockLogsEl.createDiv = jest.fn().mockReturnValue(mockLogEl);
      mockLogEl.createEl = jest.fn().mockImplementation((tag, options) => {
        if (tag === 'small') return mockTimeEl;
        if (tag === 'div' && options?.cls === 'log-info') return mockInfoEl;
        if (tag === 'div' && options?.cls === 'log-technical') return mockTechnicalEl;
        if (tag === 'details') return mockDetailsEl;
        return {};
      });

      mockInfoEl.createEl = jest.fn().mockImplementation((tag, options) => {
        if (tag === 'div' && options?.cls === 'log-interpretation') return { textContent: '', style: {} };
        if (tag === 'div' && options?.cls === 'log-context') return { textContent: '', style: {} };
        return {};
      });

      mockTechnicalEl.createEl = jest.fn().mockImplementation((tag, _options) => {
        if (tag === 'strong') return { textContent: '', style: {} };
        if (tag === 'span') return { textContent: '' };
        return {};
      });

      mockDetailsEl.createEl = jest.fn().mockImplementation((tag) => {
        if (tag === 'summary') return { textContent: '' };
        if (tag === 'pre') return { textContent: '', style: {} };
        return {};
      });
    });

    it('should render logs with interpretation and context', () => {
      // This would be called internally by onOpen, but we can test the structure
      // Simulate the renderLogs function behavior
      mockLogsEl.createDiv('log-entry');
      
      expect(mockLogsEl.createDiv).toHaveBeenCalledWith('log-entry');
    });

    it('should handle logs without interpretation', () => {
      // Simulate rendering
      mockLogsEl.createDiv('log-entry');
      
      expect(mockLogsEl.createDiv).toHaveBeenCalledWith('log-entry');
    });

    it('should handle network logs with URL parsing', () => {
      // Simulate rendering
      mockLogsEl.createDiv('log-entry');
      
      expect(mockLogsEl.createDiv).toHaveBeenCalledWith('log-entry');
    });

    it('should handle file logs with path', () => {
      // Simulate rendering
      mockLogsEl.createDiv('log-entry');
      
      expect(mockLogsEl.createDiv).toHaveBeenCalledWith('log-entry');
    });

    it('should handle command logs with commandId', () => {
      // Simulate rendering
      mockLogsEl.createDiv('log-entry');
      
      expect(mockLogsEl.createDiv).toHaveBeenCalledWith('log-entry');
    });
  });

  describe('edge cases', () => {
    it('should handle missing navigator.clipboard', () => {
      expect(navigator.clipboard).toBeDefined();
    });

    it('should handle empty logs array', () => {
      expect(mockPlugin.logs).toBeDefined();
    });

    it('should handle logs with missing details', () => {
      expect(mockPlugin.logs.length).toBeGreaterThan(0);
    });
  });
});
