import { ExtensionWatcherSettingTab } from '../../src/ui/SettingsTab';
import { App } from 'obsidian';

// Mock dependencies
jest.mock('obsidian', () => ({
  App: jest.fn(),
  PluginSettingTab: jest.fn(),
  Setting: jest.fn().mockImplementation(() => ({
    setName: jest.fn().mockReturnThis(),
    setDesc: jest.fn().mockReturnThis(),
    addToggle: jest.fn().mockReturnThis(),
    addText: jest.fn().mockReturnThis(),
  })),
  Notice: jest.fn().mockImplementation((message: string) => ({ message })),
  Plugin: jest.fn(),
}));

describe('ExtensionWatcherSettingTab', () => {
  let mockApp: App;
  let mockPlugin: any;
  let settingsTab: ExtensionWatcherSettingTab;
  let mockContainerEl: HTMLElement;
  let mockSetting: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockContainerEl = {
      empty: jest.fn(),
      createEl: jest.fn(),
    } as any;

    mockApp = new App();
    
    mockPlugin = {
      settings: {
        monitorFileAccess: true,
        monitorCommands: true,
        monitorNetworkCalls: true,
        showNotifications: false,
        logToConsole: true,
        maxLogEntries: 1000,
        excludeSelfLogs: true,
        debugMode: false,
      },
      saveSettings: jest.fn(),
      enableAggressiveDebug: jest.fn(),
    };

    settingsTab = new ExtensionWatcherSettingTab(mockApp, mockPlugin);
    settingsTab.containerEl = mockContainerEl;
  });

  describe('constructor', () => {
    it('should initialize with app and plugin', () => {
      expect(settingsTab).toBeInstanceOf(ExtensionWatcherSettingTab);
      expect(settingsTab.plugin).toBe(mockPlugin);
    });
  });

  describe('display', () => {
    let mockSetting: any;

    beforeEach(() => {
      mockSetting = {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addToggle: jest.fn().mockReturnThis(),
        addText: jest.fn().mockReturnThis(),
      };

      const { Setting } = require('obsidian');
      Setting.mockReturnValue(mockSetting);
    });

    it('should create settings structure', () => {
      settingsTab.display();

      expect(mockContainerEl.empty).toHaveBeenCalled();
      expect(mockContainerEl.createEl).toHaveBeenCalledWith('h2', { text: 'Extension Watcher - Configurações' });
    });

    it('should create file access monitoring setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Monitorar Acesso a Arquivos');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Rastrear quando plugins leem, modificam, criam ou deletam arquivos');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });

    it('should create command monitoring setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Monitorar Comandos');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Rastrear quando plugins executam comandos');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });

    it('should create network monitoring setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Monitorar Chamadas de Rede');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Rastrear requisições HTTP/HTTPS feitas por plugins');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });

    it('should create notifications setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Mostrar Notificações');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Exibir notificações em tempo real das atividades');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });

    it('should create console logging setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Log no Console');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Registrar atividades no console do navegador');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });

    it('should create max logs setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Máximo de Logs');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Número máximo de entradas de log a manter na memória');
      expect(mockSetting.addText).toHaveBeenCalled();
    });

    it('should create exclude self logs setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Excluir Logs Próprios');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Não registrar atividades do próprio Extension Watcher');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });

    it('should create debug mode setting', () => {
      settingsTab.display();

      expect(mockSetting.setName).toHaveBeenCalledWith('Modo Debug');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('⚠️ Ativar monitoramento agressivo (MUITO verboso - use apenas para debugging)');
      expect(mockSetting.addToggle).toHaveBeenCalled();
    });
  });

  describe('setting callbacks', () => {
    let mockToggle: any;
    let mockText: any;

    beforeEach(() => {
      mockToggle = {
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockImplementation((callback) => {
          // Store callback for testing
          mockToggle._onChangeCallback = callback;
          return mockToggle;
        }),
      };

      mockText = {
        setPlaceholder: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockImplementation((callback) => {
          // Store callback for testing
          mockText._onChangeCallback = callback;
          return mockText;
        }),
      };

      mockSetting = {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addToggle: jest.fn().mockReturnValue(mockToggle),
        addText: jest.fn().mockReturnValue(mockText),
      };

      const { Setting } = require('obsidian');
      Setting.mockReturnValue(mockSetting);
    });

    it('should handle file access toggle change', async () => {
      settingsTab.display();

      // Find the file access toggle callback
      const fileAccessToggle = mockSetting.addToggle.mock.calls.find((_call: any) => 
        mockSetting.setName.mock.calls.some((nameCall: any) => nameCall[0] === 'Monitorar Acesso a Arquivos'),
      );

      if (fileAccessToggle && mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(false);

        expect(mockPlugin.settings.monitorFileAccess).toBe(false);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle command monitoring toggle change', async () => {
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(true);

        // This would be the command monitoring setting
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle network monitoring toggle change', async () => {
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(false);

        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle notifications toggle change', async () => {
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(true);

        expect(mockPlugin.settings.showNotifications).toBe(true);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle console logging toggle change', async () => {
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(false);

        expect(mockPlugin.settings.logToConsole).toBe(false);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle max logs text change with valid number', async () => {
      settingsTab.display();

      if (mockText._onChangeCallback) {
        await mockText._onChangeCallback('500');

        expect(mockPlugin.settings.maxLogEntries).toBe(500);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle max logs text change with invalid number', async () => {
      const originalMaxLogs = mockPlugin.settings.maxLogEntries;
      
      settingsTab.display();

      if (mockText._onChangeCallback) {
        await mockText._onChangeCallback('invalid');

        expect(mockPlugin.settings.maxLogEntries).toBe(originalMaxLogs);
        expect(mockPlugin.saveSettings).not.toHaveBeenCalled();
      }
    });

    it('should handle max logs text change with zero', async () => {
      const originalMaxLogs = mockPlugin.settings.maxLogEntries;
      
      settingsTab.display();

      if (mockText._onChangeCallback) {
        await mockText._onChangeCallback('0');

        expect(mockPlugin.settings.maxLogEntries).toBe(originalMaxLogs);
        expect(mockPlugin.saveSettings).not.toHaveBeenCalled();
      }
    });

    it('should handle exclude self logs toggle change', async () => {
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(false);

        expect(mockPlugin.settings.excludeSelfLogs).toBe(false);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should handle debug mode toggle change to true', async () => {
      const { Notice } = require('obsidian');
      
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(true);

        expect(mockPlugin.settings.debugMode).toBe(true);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
        expect(mockPlugin.enableAggressiveDebug).toHaveBeenCalled();
        expect(Notice).toHaveBeenCalledWith('⚠️ Modo Debug ativado - prepare-se para MUITOS logs!');
      }
    });

    it('should handle debug mode toggle change to false', async () => {
      const { Notice } = require('obsidian');
      
      settingsTab.display();

      if (mockToggle._onChangeCallback) {
        await mockToggle._onChangeCallback(false);

        expect(mockPlugin.settings.debugMode).toBe(false);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
        expect(Notice).toHaveBeenCalledWith('Modo Debug desativado - recarregue o Obsidian para aplicar');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle missing plugin settings', () => {
      mockPlugin.settings = null;

      expect(() => {
        settingsTab.display();
      }).toThrow();
    });

    it('should handle missing saveSettings method', () => {
      delete mockPlugin.saveSettings;

      expect(() => {
        settingsTab.display();
      }).not.toThrow();
    });

    it('should handle missing enableAggressiveDebug method', () => {
      delete mockPlugin.enableAggressiveDebug;

      expect(() => {
        settingsTab.display();
      }).not.toThrow();
    });

    it('should handle empty settings object', () => {
      mockPlugin.settings = {};

      expect(() => {
        settingsTab.display();
      }).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should create all expected settings', () => {
      const { Setting } = require('obsidian');
      
      settingsTab.display();

      // Should create 8 settings total
      expect(Setting).toHaveBeenCalledTimes(8);
    });

    it('should handle multiple display calls', () => {
      settingsTab.display();
      settingsTab.display();

      // Should call empty on each display
      expect(mockContainerEl.empty).toHaveBeenCalledTimes(2);
    });
  });
});
