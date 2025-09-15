import { CommandMonitor } from '../../src/monitoring/CommandMonitor';
import { App } from 'obsidian';

// Mock the App class
jest.mock('obsidian', () => ({
  App: jest.fn(),
}));

describe('CommandMonitor', () => {
  let mockPlugin: any;
  let mockApp: App;
  let mockWorkspace: any;
  let commandMonitor: CommandMonitor;
  let mockActiveFile: any;
  let mockActiveLeaf: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockActiveFile = {
      path: '/test.md',
    };

    mockActiveLeaf = {
      view: {
        getViewType: jest.fn().mockReturnValue('markdown'),
      },
    };

    mockWorkspace = {
      executeCommandById: jest.fn().mockReturnValue(undefined),
      getActiveFile: jest.fn().mockReturnValue(mockActiveFile),
      activeLeaf: mockActiveLeaf,
    };

    mockApp = {
      workspace: mockWorkspace,
    } as any;

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    commandMonitor = new CommandMonitor(mockApp, mockPlugin);
  });

  describe('constructor', () => {
    it('should initialize with app and plugin', () => {
      expect(commandMonitor).toBeInstanceOf(CommandMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorCommandExecutionSpy = jest.spyOn(commandMonitor as any, 'monitorCommandExecution');
      const monitorWindowOpenSpy = jest.spyOn(commandMonitor as any, 'monitorWindowOpen');

      commandMonitor.initialize();

      expect(monitorCommandExecutionSpy).toHaveBeenCalled();
      expect(monitorWindowOpenSpy).toHaveBeenCalled();
    });
  });

  describe('monitorCommandExecution', () => {
    beforeEach(() => {
      commandMonitor.initialize();
    });

    it('should intercept executeCommandById and log command execution', () => {
      const commandId = 'test-command';
      
      mockWorkspace.executeCommandById(commandId);

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'command',
        plugin: 'test-plugin',
        action: 'execute',
        details: {
          commandId,
          executionTime: expect.any(Number),
          activeFile: '/test.md',
          activeViewType: 'markdown',
          hasActiveFile: true,
          isMarkdownView: true,
          commandCategory: 'unknown',
          isCoreCommand: false,
          isPluginCommand: true,
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle core commands correctly', () => {
      const coreCommandId = 'app:open-file';
      
      mockWorkspace.executeCommandById(coreCommandId);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            commandId: coreCommandId,
            commandCategory: 'core',
            isCoreCommand: true,
            isPluginCommand: false,
          }),
        }),
      );
    });

    it('should handle plugin commands with category', () => {
      const pluginCommandId = 'my-plugin:do-something';
      
      mockWorkspace.executeCommandById(pluginCommandId);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            commandId: pluginCommandId,
            commandCategory: 'my-plugin',
            isCoreCommand: false,
            isPluginCommand: true,
          }),
        }),
      );
    });

    it('should handle missing active file', () => {
      mockWorkspace.getActiveFile.mockReturnValue(null);
      
      mockWorkspace.executeCommandById('test-command');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            activeFile: null,
            hasActiveFile: false,
          }),
        }),
      );
    });

    it('should handle missing active leaf', () => {
      mockWorkspace.activeLeaf = null;
      
      mockWorkspace.executeCommandById('test-command');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            activeViewType: undefined,
            isMarkdownView: false,
          }),
        }),
      );
    });

    it('should handle non-markdown view', () => {
      mockActiveLeaf.view.getViewType.mockReturnValue('canvas');
      
      mockWorkspace.executeCommandById('test-command');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            activeViewType: 'canvas',
            isMarkdownView: false,
          }),
        }),
      );
    });

    it('should handle missing executeCommandById method', () => {
      const appWithoutExecuteCommand = {
        workspace: {
          getActiveFile: jest.fn(),
          activeLeaf: mockActiveLeaf,
        },
      } as any;

      const monitorWithoutExecuteCommand = new CommandMonitor(appWithoutExecuteCommand, mockPlugin);
      
      expect(() => {
        monitorWithoutExecuteCommand.initialize();
      }).not.toThrow();
    });

    it('should handle missing workspace', () => {
      const appWithoutWorkspace = {} as any;
      const monitorWithoutWorkspace = new CommandMonitor(appWithoutWorkspace, mockPlugin);
      
      expect(() => {
        monitorWithoutWorkspace.initialize();
      }).not.toThrow();
    });
  });

  describe('getCommandCategory', () => {
    it('should return core for app: commands', () => {
      const result = (commandMonitor as any).getCommandCategory('app:open-file');
      expect(result).toBe('core');
    });

    it('should return plugin name for plugin: commands', () => {
      const result = (commandMonitor as any).getCommandCategory('my-plugin:do-something');
      expect(result).toBe('my-plugin');
    });

    it('should return unknown for commands without colon', () => {
      const result = (commandMonitor as any).getCommandCategory('simple-command');
      expect(result).toBe('unknown');
    });

    it('should return unknown for empty command', () => {
      const result = (commandMonitor as any).getCommandCategory('');
      expect(result).toBe('unknown');
    });

    it('should handle commands with multiple colons', () => {
      const result = (commandMonitor as any).getCommandCategory('plugin:sub:command');
      expect(result).toBe('plugin');
    });
  });

  describe('monitorCommandPalette', () => {
    beforeEach(() => {
      commandMonitor.initialize();
    });

    it('should log when Ctrl+P is pressed', () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: true,
        metaKey: false,
      });

      document.dispatchEvent(keydownEvent);

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'command',
        plugin: 'test-plugin',
        action: 'palette-open',
        details: {
          timestamp: expect.any(Number),
          key: 'p',
          ctrlKey: true,
          metaKey: false,
        },
        timestamp: expect.any(Date),
      });
    });

    it('should log when Cmd+P is pressed on Mac', () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: false,
        metaKey: true,
      });

      document.dispatchEvent(keydownEvent);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            ctrlKey: false,
            metaKey: true,
          }),
        }),
      );
    });

    it('should not log for other key combinations', () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        metaKey: false,
      });

      document.dispatchEvent(keydownEvent);

      expect(mockPlugin.addLog).not.toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'palette-open',
        }),
      );
    });

    it('should not log for P without modifier keys', () => {
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'p',
        ctrlKey: false,
        metaKey: false,
      });

      document.dispatchEvent(keydownEvent);

      expect(mockPlugin.addLog).not.toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'palette-open',
        }),
      );
    });
  });

  describe('monitorWindowOpen', () => {
    let originalWindowOpen: typeof window.open;

    beforeEach(() => {
      originalWindowOpen = window.open;
      commandMonitor.initialize();
    });

    afterEach(() => {
      window.open = originalWindowOpen;
    });

    it('should intercept window.open and log URL opening', () => {
      // Call window.open directly to test the intercepted version
      window.open('https://example.com', '_blank');

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'command',
        plugin: 'test-plugin',
        action: 'window.open',
        details: {
          url: 'https://example.com',
          target: '_blank',
          features: undefined,
        },
        timestamp: expect.any(Date),
      });

      // The intercepted window.open should have been called
    });

    it('should handle window.open with all parameters', () => {
      // Call window.open directly to test the intercepted version
      window.open('https://example.com', '_blank', 'width=800,height=600');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            url: 'https://example.com',
            target: '_blank',
            features: 'width=800,height=600',
          }),
        }),
      );
    });

    it('should handle window.open with no parameters', () => {
      // Call window.open directly to test the intercepted version
      window.open();

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            url: undefined,
            target: undefined,
            features: undefined,
          }),
        }),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle missing app', () => {
      const monitorWithoutApp = new CommandMonitor(null as any, mockPlugin);
      
      expect(() => {
        monitorWithoutApp.initialize();
      }).not.toThrow();
    });

    it('should handle missing workspace in monitorCommandPalette', () => {
      const appWithoutWorkspace = {} as any;
      const monitorWithoutWorkspace = new CommandMonitor(appWithoutWorkspace, mockPlugin);
      
      expect(() => {
        monitorWithoutWorkspace.initialize();
      }).not.toThrow();
    });
  });
});
