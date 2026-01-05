import { ExtensionWatcherSettings, LogEntry, ActivityInterpretation, DEFAULT_SETTINGS } from '../../src/types';

describe('types', () => {
  describe('ExtensionWatcherSettings', () => {
    it('should have all required properties', () => {
      const settings: ExtensionWatcherSettings = {
        monitorFileAccess: true,
        monitorCommands: true,
        monitorNetworkCalls: true,
        showNotifications: false,
        logToConsole: true,
        maxLogEntries: 1000,
        excludeSelfLogs: true,
        debugMode: false,
      };

      expect(settings.monitorFileAccess).toBe(true);
      expect(settings.monitorCommands).toBe(true);
      expect(settings.monitorNetworkCalls).toBe(true);
      expect(settings.showNotifications).toBe(false);
      expect(settings.logToConsole).toBe(true);
      expect(settings.maxLogEntries).toBe(1000);
      expect(settings.excludeSelfLogs).toBe(true);
      expect(settings.debugMode).toBe(false);
    });

    it('should allow boolean values for all boolean properties', () => {
      const settings: ExtensionWatcherSettings = {
        monitorFileAccess: false,
        monitorCommands: false,
        monitorNetworkCalls: false,
        showNotifications: true,
        logToConsole: false,
        maxLogEntries: 500,
        excludeSelfLogs: false,
        debugMode: true,
      };

      expect(typeof settings.monitorFileAccess).toBe('boolean');
      expect(typeof settings.monitorCommands).toBe('boolean');
      expect(typeof settings.monitorNetworkCalls).toBe('boolean');
      expect(typeof settings.showNotifications).toBe('boolean');
      expect(typeof settings.logToConsole).toBe('boolean');
      expect(typeof settings.excludeSelfLogs).toBe('boolean');
      expect(typeof settings.debugMode).toBe('boolean');
    });

    it('should allow number for maxLogEntries', () => {
      const settings: ExtensionWatcherSettings = {
        monitorFileAccess: true,
        monitorCommands: true,
        monitorNetworkCalls: true,
        showNotifications: false,
        logToConsole: true,
        maxLogEntries: 2000,
        excludeSelfLogs: true,
        debugMode: false,
      };

      expect(typeof settings.maxLogEntries).toBe('number');
      expect(settings.maxLogEntries).toBe(2000);
    });
  });

  describe('LogEntry', () => {
    it('should have all required properties', () => {
      const logEntry: LogEntry = {
        timestamp: new Date('2024-01-01T10:00:00Z'),
        type: 'file',
        plugin: 'test-plugin',
        action: 'read',
        details: { path: '/test.md' },
        interpretation: 'Test interpretation',
        context: 'Test context',
      };

      expect(logEntry.timestamp).toBeInstanceOf(Date);
      expect(logEntry.type).toBe('file');
      expect(logEntry.plugin).toBe('test-plugin');
      expect(logEntry.action).toBe('read');
      expect(logEntry.details).toEqual({ path: '/test.md' });
      expect(logEntry.interpretation).toBe('Test interpretation');
      expect(logEntry.context).toBe('Test context');
    });

    it('should allow all valid log types', () => {
      const validTypes: LogEntry['type'][] = [
        'file', 'command', 'network', 'workspace', 'metadata', 
        'keymap', 'modal', 'editor', 'canvas', 'settings', 'performance',
      ];

      validTypes.forEach(type => {
        const logEntry: LogEntry = {
          timestamp: new Date(),
          type,
          plugin: 'test-plugin',
          action: 'test-action',
          details: {},
        };

        expect(logEntry.type).toBe(type);
      });
    });

    it('should allow optional interpretation and context', () => {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        type: 'file',
        plugin: 'test-plugin',
        action: 'read',
        details: {},
      };

      expect(logEntry.interpretation).toBeUndefined();
      expect(logEntry.context).toBeUndefined();
    });

    it('should allow any object for details', () => {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        type: 'network',
        plugin: 'test-plugin',
        action: 'request',
        details: {
          url: 'https://api.example.com',
          method: 'GET',
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          nested: { value: 123 },
        },
      };

      expect(logEntry.details['url']).toBe('https://api.example.com');
      expect(logEntry.details['method']).toBe('GET');
      expect(logEntry.details['status']).toBe(200);
      expect(logEntry.details['headers']).toEqual({ 'Content-Type': 'application/json' });
      expect(logEntry.details['nested']).toEqual({ value: 123 });
    });
  });

  describe('ActivityInterpretation', () => {
    it('should have interpretation and context properties', () => {
      const interpretation: ActivityInterpretation = {
        interpretation: 'Plugin is reading a markdown file',
        context: 'File: /notes/daily.md',
      };

      expect(interpretation.interpretation).toBe('Plugin is reading a markdown file');
      expect(interpretation.context).toBe('File: /notes/daily.md');
    });

    it('should allow string values for both properties', () => {
      const interpretation: ActivityInterpretation = {
        interpretation: 'Test interpretation',
        context: 'Test context',
      };

      expect(typeof interpretation.interpretation).toBe('string');
      expect(typeof interpretation.context).toBe('string');
    });

    it('should allow empty strings', () => {
      const interpretation: ActivityInterpretation = {
        interpretation: '',
        context: '',
      };

      expect(interpretation.interpretation).toBe('');
      expect(interpretation.context).toBe('');
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should match ExtensionWatcherSettings interface', () => {
      const settings: ExtensionWatcherSettings = DEFAULT_SETTINGS;

      expect(settings.monitorFileAccess).toBe(true);
      expect(settings.monitorCommands).toBe(true);
      expect(settings.monitorNetworkCalls).toBe(true);
      expect(settings.showNotifications).toBe(false);
      expect(settings.logToConsole).toBe(true);
      expect(settings.maxLogEntries).toBe(1000);
      expect(settings.excludeSelfLogs).toBe(true);
      expect(settings.debugMode).toBe(false);
    });

    it('should have all required properties', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('monitorFileAccess');
      expect(DEFAULT_SETTINGS).toHaveProperty('monitorCommands');
      expect(DEFAULT_SETTINGS).toHaveProperty('monitorNetworkCalls');
      expect(DEFAULT_SETTINGS).toHaveProperty('showNotifications');
      expect(DEFAULT_SETTINGS).toHaveProperty('logToConsole');
      expect(DEFAULT_SETTINGS).toHaveProperty('maxLogEntries');
      expect(DEFAULT_SETTINGS).toHaveProperty('excludeSelfLogs');
      expect(DEFAULT_SETTINGS).toHaveProperty('debugMode');
    });

    it('should have correct types for all properties', () => {
      expect(typeof DEFAULT_SETTINGS.monitorFileAccess).toBe('boolean');
      expect(typeof DEFAULT_SETTINGS.monitorCommands).toBe('boolean');
      expect(typeof DEFAULT_SETTINGS.monitorNetworkCalls).toBe('boolean');
      expect(typeof DEFAULT_SETTINGS.showNotifications).toBe('boolean');
      expect(typeof DEFAULT_SETTINGS.logToConsole).toBe('boolean');
      expect(typeof DEFAULT_SETTINGS.maxLogEntries).toBe('number');
      expect(typeof DEFAULT_SETTINGS.excludeSelfLogs).toBe('boolean');
      expect(typeof DEFAULT_SETTINGS.debugMode).toBe('boolean');
    });

    it('should be a constant object', () => {
      // In TypeScript, the readonly modifier is a compile-time check only
      // At runtime, we can only verify that it's a normal object
      expect(typeof DEFAULT_SETTINGS).toBe('object');
      expect(DEFAULT_SETTINGS).toBeDefined();
    });
  });

  describe('type compatibility', () => {
    it('should allow LogEntry to be assigned to variables with specific types', () => {
      const fileLog: LogEntry = {
        timestamp: new Date(),
        type: 'file',
        plugin: 'test-plugin',
        action: 'read',
        details: { path: '/test.md' },
      };

      const commandLog: LogEntry = {
        timestamp: new Date(),
        type: 'command',
        plugin: 'test-plugin',
        action: 'execute',
        details: { commandId: 'test-command' },
      };

      const networkLog: LogEntry = {
        timestamp: new Date(),
        type: 'network',
        plugin: 'test-plugin',
        action: 'request',
        details: { url: 'https://api.example.com' },
      };

      expect(fileLog.type).toBe('file');
      expect(commandLog.type).toBe('command');
      expect(networkLog.type).toBe('network');
    });

    it('should allow partial settings to be merged with defaults', () => {
      const partialSettings: Partial<ExtensionWatcherSettings> = {
        maxLogEntries: 500,
        debugMode: true,
      };

      const mergedSettings: ExtensionWatcherSettings = {
        ...DEFAULT_SETTINGS,
        ...partialSettings,
      };

      expect(mergedSettings.maxLogEntries).toBe(500);
      expect(mergedSettings.debugMode).toBe(true);
      expect(mergedSettings.monitorFileAccess).toBe(DEFAULT_SETTINGS.monitorFileAccess);
    });
  });
});
