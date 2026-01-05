import { ExtensionWatcherPlugin } from '../src/ExtensionWatcherPlugin';
import { App } from 'obsidian';
import { DEFAULT_SETTINGS, LogEntry } from '../src/types';

// Mock dependencies
jest.mock('../src/monitoring/MonitorManager');
jest.mock('../src/interpretation');
jest.mock('../src/CommandManager');

describe('ExtensionWatcherPlugin', () => {
  let mockApp: App;
  let plugin: ExtensionWatcherPlugin;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockApp = new App();
    const mockManifest = { 
      id: 'test-plugin', 
      name: 'Test Plugin',
      author: 'Test Author',
      version: '1.0.0',
      minAppVersion: '0.15.0',
      description: 'Test plugin description'
    };
    plugin = new ExtensionWatcherPlugin(mockApp, mockManifest);
  });

  describe('constructor', () => {
    it('should initialize with empty logs array', () => {
      expect(plugin.logs).toEqual([]);
    });

    it('should have undefined settings initially', () => {
      expect(plugin.settings).toBeUndefined();
    });
  });

  describe('loadSettings', () => {
    it('should load default settings when no data exists', async () => {
      plugin.loadData = jest.fn().mockResolvedValue({});
      
      await plugin.loadSettings();
      
      expect(plugin.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should merge loaded data with default settings', async () => {
      const loadedData = {
        monitorFileAccess: false,
        maxLogEntries: 500,
      };
      
      plugin.loadData = jest.fn().mockResolvedValue(loadedData);
      
      await plugin.loadSettings();
      
      expect(plugin.settings).toEqual({
        ...DEFAULT_SETTINGS,
        ...loadedData,
      });
    });
  });

  describe('saveSettings', () => {
    it('should call saveData with current settings', async () => {
      plugin.settings = DEFAULT_SETTINGS;
      plugin.saveData = jest.fn().mockResolvedValue(undefined);
      
      await plugin.saveSettings();
      
      expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
    });
  });

  describe('detectPluginFromStack', () => {
    it('should call pluginDetector with provided stack', () => {
      const mockStack = 'Error stack trace';
      const mockPluginDetector = {
        detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      };
      
      // Mock the private property access
      (plugin as any).pluginDetector = mockPluginDetector;
      
      const result = plugin.detectPluginFromStack(mockStack);
      
      expect(mockPluginDetector.detectPluginFromStack).toHaveBeenCalledWith(mockStack);
      expect(result).toBe('test-plugin');
    });
  });

  describe('interpretActivity', () => {
    it('should call activityInterpreter with provided parameters', () => {
      const mockInterpretation = {
        interpretation: 'Test interpretation',
        context: 'Test context',
      };
      
      const mockActivityInterpreter = {
        interpretActivity: jest.fn().mockReturnValue(mockInterpretation),
      };
      
      // Mock the private property access
      (plugin as any).activityInterpreter = mockActivityInterpreter;
      
      const result = plugin.interpretActivity('file', 'test-plugin', 'read', { path: '/test' });
      
      expect(mockActivityInterpreter.interpretActivity).toHaveBeenCalledWith(
        'file',
        'test-plugin',
        'read',
        { path: '/test' },
      );
      expect(result).toEqual(mockInterpretation);
    });
  });

  describe('addLog', () => {
    beforeEach(() => {
      plugin.settings = DEFAULT_SETTINGS;
    });

    it('should add log entry when not excluding self logs', () => {
      const entry = {
        type: 'file' as const,
        plugin: 'test-plugin',
        action: 'read',
        details: { path: '/test.md' },
      };
      
      plugin.detectPluginFromStack = jest.fn().mockReturnValue('test-plugin');
      plugin.interpretActivity = jest.fn().mockReturnValue({
        interpretation: 'Test interpretation',
        context: 'Test context',
      });
      
      plugin.addLog(entry);
      
      expect(plugin.logs).toHaveLength(1);
      expect(plugin.logs[0]).toMatchObject({
        ...entry,
        timestamp: expect.any(Date),
        interpretation: 'Test interpretation',
        context: 'Test context',
      });
    });

    it('should exclude self logs when excludeSelfLogs is true', () => {
      plugin.settings.excludeSelfLogs = true;
      
      const entry = {
        type: 'file' as const,
        plugin: 'obsidian-extension-watcher',
        action: 'read',
        details: { path: '/test.md' },
      };
      
      plugin.addLog(entry);
      
      expect(plugin.logs).toHaveLength(0);
    });

    it('should limit logs to maxLogEntries', () => {
      plugin.settings.maxLogEntries = 2;
      
      const entry = {
        type: 'file' as const,
        plugin: 'test-plugin',
        action: 'read',
        details: { path: '/test.md' },
      };
      
      plugin.detectPluginFromStack = jest.fn().mockReturnValue('test-plugin');
      plugin.interpretActivity = jest.fn().mockReturnValue({
        interpretation: 'Test interpretation',
        context: 'Test context',
      });
      
      // Add 3 logs
      plugin.addLog(entry);
      plugin.addLog(entry);
      plugin.addLog(entry);
      
      expect(plugin.logs).toHaveLength(2);
    });

    it('should log to console when logToConsole is true', () => {
      plugin.settings.logToConsole = true;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const entry = {
        type: 'file' as const,
        plugin: 'test-plugin',
        action: 'read',
        details: { path: '/test.md' },
      };
      
      plugin.detectPluginFromStack = jest.fn().mockReturnValue('test-plugin');
      plugin.interpretActivity = jest.fn().mockReturnValue({
        interpretation: 'Test interpretation',
        context: 'Test context',
      });
      
      plugin.addLog(entry);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Extension Watcher]', expect.any(Object));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getLogsForPlugin', () => {
    beforeEach(() => {
      plugin.logs = [
        {
          timestamp: new Date(),
          type: 'file',
          plugin: 'plugin1',
          action: 'read',
          details: {},
        },
        {
          timestamp: new Date(),
          type: 'command',
          plugin: 'plugin2',
          action: 'execute',
          details: {},
        },
        {
          timestamp: new Date(),
          type: 'file',
          plugin: 'plugin1',
          action: 'write',
          details: {},
        },
      ] as LogEntry[];
    });

    it('should return logs for specific plugin', () => {
      const result = plugin.getLogsForPlugin('plugin1');
      
      expect(result).toHaveLength(2);
      expect(result.every(log => log.plugin === 'plugin1')).toBe(true);
    });

    it('should return empty array for non-existent plugin', () => {
      const result = plugin.getLogsForPlugin('non-existent');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getLogsForType', () => {
    beforeEach(() => {
      plugin.logs = [
        {
          timestamp: new Date(),
          type: 'file',
          plugin: 'plugin1',
          action: 'read',
          details: {},
        },
        {
          timestamp: new Date(),
          type: 'command',
          plugin: 'plugin2',
          action: 'execute',
          details: {},
        },
        {
          timestamp: new Date(),
          type: 'file',
          plugin: 'plugin1',
          action: 'write',
          details: {},
        },
      ] as LogEntry[];
    });

    it('should return logs for specific type', () => {
      const result = plugin.getLogsForType('file');
      
      expect(result).toHaveLength(2);
      expect(result.every(log => log.type === 'file')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const result = plugin.getLogsForType('network');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      plugin.logs = [
        {
          timestamp: new Date(),
          type: 'file',
          plugin: 'plugin1',
          action: 'read',
          details: {},
        },
      ] as LogEntry[];
      
      plugin.clearLogs();
      
      expect(plugin.logs).toHaveLength(0);
    });
  });

  describe('enableAggressiveDebug', () => {
    it('should call monitorManager.enableAggressiveDebug', () => {
      const mockMonitorManager = {
        enableAggressiveDebug: jest.fn(),
      };
      
      // Mock the private property access
      (plugin as any).monitorManager = mockMonitorManager;
      
      plugin.enableAggressiveDebug();
      
      expect(mockMonitorManager.enableAggressiveDebug).toHaveBeenCalled();
    });
  });
});
