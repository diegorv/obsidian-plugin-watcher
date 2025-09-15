import { CommandManager } from '../src/CommandManager';
import { App } from 'obsidian';

// Mock das classes do Obsidian
jest.mock('obsidian', () => ({
  App: jest.fn(),
  Notice: jest.fn().mockImplementation((message: string) => ({ message })),
}));

// Mock dos componentes UI
jest.mock('../src/ui/LogsModal', () => ({
  LogsModal: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
  })),
}));

jest.mock('../src/ui/SettingsTab', () => ({
  ExtensionWatcherSettingTab: jest.fn().mockImplementation(() => ({})),
}));

describe('CommandManager', () => {
  let mockPlugin: any;
  let mockApp: App;
  let commandManager: CommandManager;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock plugin
    mockPlugin = {
      addCommand: jest.fn(),
      addRibbonIcon: jest.fn(),
      addSettingTab: jest.fn(),
      settings: {
        debugMode: false,
      },
      saveSettings: jest.fn(),
      enableAggressiveDebug: jest.fn(),
    };

    // Mock app
    mockApp = new App();

    // Instantiate CommandManager
    commandManager = new CommandManager(mockPlugin, mockApp);
  });

  describe('constructor', () => {
    it('should initialize correctly with plugin and app', () => {
      expect(commandManager).toBeInstanceOf(CommandManager);
    });
  });

  describe('registerCommands', () => {
    it('should register command to open logs', () => {
      commandManager.registerCommands();

      expect(mockPlugin.addCommand).toHaveBeenCalledWith({
        id: 'open-extension-watcher-logs',
        name: 'Abrir Logs do Extension Watcher',
        callback: expect.any(Function),
      });
    });

    it('should register command to toggle debug mode', () => {
      commandManager.registerCommands();

      expect(mockPlugin.addCommand).toHaveBeenCalledWith({
        id: 'toggle-debug-mode',
        name: 'Toggle Modo Debug (Smart Composer)',
        callback: expect.any(Function),
      });
    });

    it('should call addCommand twice', () => {
      commandManager.registerCommands();

      expect(mockPlugin.addCommand).toHaveBeenCalledTimes(2);
    });
  });

  describe('addRibbonIcon', () => {
    it('should add ribbon icon', () => {
      commandManager.addRibbonIcon();

      expect(mockPlugin.addRibbonIcon).toHaveBeenCalledWith(
        'eye',
        'Extension Watcher',
        expect.any(Function),
      );
    });

    it('should open LogsModal when icon is clicked', () => {
      const { LogsModal } = require('../src/ui/LogsModal');
      
      commandManager.addRibbonIcon();

      // Simulate icon click
      const callback = mockPlugin.addRibbonIcon.mock.calls[0][2];
      callback(new MouseEvent('click'));

      expect(LogsModal).toHaveBeenCalledWith(mockApp, mockPlugin);
    });
  });

  describe('addSettingsTab', () => {
    it('should add settings tab', () => {
      commandManager.addSettingsTab();

      expect(mockPlugin.addSettingTab).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });

  describe('toggleDebugMode', () => {
    it('should enable debug mode when disabled', () => {
      mockPlugin.settings.debugMode = false;

      // Register commands first
      commandManager.registerCommands();

      // Access private method through command callback
      const commands = mockPlugin.addCommand.mock.calls;
      const toggleCommand = commands.find((call: any) => call[0].id === 'toggle-debug-mode');
      
      if (toggleCommand && toggleCommand[0] && toggleCommand[0].callback) {
        const toggleCallback = toggleCommand[0].callback;
        toggleCallback();
      }

      expect(mockPlugin.settings.debugMode).toBe(true);
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
      expect(mockPlugin.enableAggressiveDebug).toHaveBeenCalled();
    });

    it('should disable debug mode when enabled', () => {
      mockPlugin.settings.debugMode = true;

      // Register commands first
      commandManager.registerCommands();

      // Access private method through command callback
      const commands = mockPlugin.addCommand.mock.calls;
      const toggleCommand = commands.find((call: any) => call[0].id === 'toggle-debug-mode');
      
      if (toggleCommand && toggleCommand[0] && toggleCommand[0].callback) {
        const toggleCallback = toggleCommand[0].callback;
        toggleCallback();
      }

      expect(mockPlugin.settings.debugMode).toBe(false);
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should register all commands and UI when initialized', () => {
      commandManager.registerCommands();
      commandManager.addRibbonIcon();
      commandManager.addSettingsTab();

      expect(mockPlugin.addCommand).toHaveBeenCalledTimes(2);
      expect(mockPlugin.addRibbonIcon).toHaveBeenCalledTimes(1);
      expect(mockPlugin.addSettingTab).toHaveBeenCalledTimes(1);
    });
  });
});
