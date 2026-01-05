import { MonitorManager } from '../../src/monitoring/MonitorManager';
import { App } from 'obsidian';

// Mock all monitor classes
jest.mock('../../src/monitoring/NetworkMonitor');
jest.mock('../../src/monitoring/FileMonitor');
jest.mock('../../src/monitoring/CommandMonitor');
jest.mock('../../src/monitoring/AdvancedAPIMonitor');
jest.mock('../../src/monitoring/DebugMonitor');
jest.mock('../../src/monitoring/WorkspaceMonitor');
jest.mock('../../src/monitoring/MetadataMonitor');
jest.mock('../../src/monitoring/KeymapMonitor');
jest.mock('../../src/monitoring/ModalMonitor');
jest.mock('../../src/monitoring/EditorMonitor');
jest.mock('../../src/monitoring/CanvasMonitor');
jest.mock('../../src/monitoring/SettingsMonitor');

// Mock the App class
jest.mock('obsidian', () => ({
  App: jest.fn(),
}));

describe('MonitorManager', () => {
  let mockPlugin: any;
  let mockApp: App;
  let monitorManager: MonitorManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPlugin = {
      settings: {
        monitorNetworkCalls: true,
        monitorFileAccess: true,
        monitorCommands: true,
        debugMode: false,
      },
    };
    
    mockApp = new App();
    
    monitorManager = new MonitorManager(mockPlugin, mockApp);
  });

  describe('constructor', () => {
    it('should initialize with plugin and app', () => {
      expect(monitorManager).toBeInstanceOf(MonitorManager);
    });

    it('should initialize all monitors', () => {
      const { NetworkMonitor } = require('../../src/monitoring/NetworkMonitor');
      const { FileMonitor } = require('../../src/monitoring/FileMonitor');
      const { CommandMonitor } = require('../../src/monitoring/CommandMonitor');
      const { AdvancedAPIMonitor } = require('../../src/monitoring/AdvancedAPIMonitor');
      const { DebugMonitor } = require('../../src/monitoring/DebugMonitor');
      const { WorkspaceMonitor } = require('../../src/monitoring/WorkspaceMonitor');
      const { MetadataMonitor } = require('../../src/monitoring/MetadataMonitor');
      const { KeymapMonitor } = require('../../src/monitoring/KeymapMonitor');
      const { ModalMonitor } = require('../../src/monitoring/ModalMonitor');
      const { EditorMonitor } = require('../../src/monitoring/EditorMonitor');
      const { CanvasMonitor } = require('../../src/monitoring/CanvasMonitor');
      const { SettingsMonitor } = require('../../src/monitoring/SettingsMonitor');

      expect(NetworkMonitor).toHaveBeenCalledWith(mockPlugin);
      expect(FileMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(CommandMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(AdvancedAPIMonitor).toHaveBeenCalledWith(mockPlugin);
      expect(DebugMonitor).toHaveBeenCalledWith(mockPlugin);
      expect(WorkspaceMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(MetadataMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(KeymapMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(ModalMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(EditorMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(CanvasMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
      expect(SettingsMonitor).toHaveBeenCalledWith(mockApp, mockPlugin);
    });
  });

  describe('initializeMonitoring', () => {
    let mockMonitors: any;

    beforeEach(() => {
      mockMonitors = {
        networkMonitor: { initialize: jest.fn() },
        fileMonitor: { initialize: jest.fn() },
        commandMonitor: { initialize: jest.fn() },
        advancedAPIMonitor: { initialize: jest.fn() },
        debugMonitor: { enableAggressiveDebug: jest.fn() },
        workspaceMonitor: { initialize: jest.fn() },
        metadataMonitor: { initialize: jest.fn() },
        keymapMonitor: { initialize: jest.fn() },
        modalMonitor: { initialize: jest.fn() },
        editorMonitor: { initialize: jest.fn() },
        canvasMonitor: { initialize: jest.fn() },
        settingsMonitor: { initialize: jest.fn() },
      };

      // Replace the monitor instances with mocks
      Object.assign(monitorManager, mockMonitors);
    });

    it('should initialize network monitoring when enabled', () => {
      monitorManager.initializeMonitoring();

      expect(mockMonitors.networkMonitor.initialize).toHaveBeenCalled();
    });

    it('should initialize file monitoring when enabled', () => {
      monitorManager.initializeMonitoring();

      expect(mockMonitors.fileMonitor.initialize).toHaveBeenCalled();
    });

    it('should initialize command monitoring when enabled', () => {
      monitorManager.initializeMonitoring();

      expect(mockMonitors.commandMonitor.initialize).toHaveBeenCalled();
    });

    it('should always initialize advanced API monitoring', () => {
      monitorManager.initializeMonitoring();

      expect(mockMonitors.advancedAPIMonitor.initialize).toHaveBeenCalled();
    });

    it('should always initialize additional monitors', () => {
      monitorManager.initializeMonitoring();

      expect(mockMonitors.workspaceMonitor.initialize).toHaveBeenCalled();
      expect(mockMonitors.metadataMonitor.initialize).toHaveBeenCalled();
      expect(mockMonitors.keymapMonitor.initialize).toHaveBeenCalled();
      expect(mockMonitors.modalMonitor.initialize).toHaveBeenCalled();
      expect(mockMonitors.editorMonitor.initialize).toHaveBeenCalled();
      expect(mockMonitors.canvasMonitor.initialize).toHaveBeenCalled();
      expect(mockMonitors.settingsMonitor.initialize).toHaveBeenCalled();
    });

    it('should enable aggressive debug when debug mode is on', () => {
      mockPlugin.settings.debugMode = true;

      monitorManager.initializeMonitoring();

      expect(mockMonitors.debugMonitor.enableAggressiveDebug).toHaveBeenCalled();
    });

    it('should not enable aggressive debug when debug mode is off', () => {
      mockPlugin.settings.debugMode = false;

      monitorManager.initializeMonitoring();

      expect(mockMonitors.debugMonitor.enableAggressiveDebug).not.toHaveBeenCalled();
    });

    it('should not initialize network monitoring when disabled', () => {
      mockPlugin.settings.monitorNetworkCalls = false;

      monitorManager.initializeMonitoring();

      expect(mockMonitors.networkMonitor.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize file monitoring when disabled', () => {
      mockPlugin.settings.monitorFileAccess = false;

      monitorManager.initializeMonitoring();

      expect(mockMonitors.fileMonitor.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize command monitoring when disabled', () => {
      mockPlugin.settings.monitorCommands = false;

      monitorManager.initializeMonitoring();

      expect(mockMonitors.commandMonitor.initialize).not.toHaveBeenCalled();
    });
  });

  describe('enableAggressiveDebug', () => {
    let mockDebugMonitor: any;

    beforeEach(() => {
      mockDebugMonitor = { enableAggressiveDebug: jest.fn() };
      (monitorManager as any).debugMonitor = mockDebugMonitor;
    });

    it('should call debugMonitor.enableAggressiveDebug', () => {
      monitorManager.enableAggressiveDebug();

      expect(mockDebugMonitor.enableAggressiveDebug).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    let mockMonitors: any;

    beforeEach(() => {
      mockMonitors = {
        networkMonitor: { restore: jest.fn() },
        fileMonitor: { restore: jest.fn() },
        commandMonitor: { restore: jest.fn() },
        advancedAPIMonitor: { restore: jest.fn() },
        debugMonitor: { restore: jest.fn() },
        workspaceMonitor: { restore: jest.fn() },
        metadataMonitor: { restore: jest.fn() },
        keymapMonitor: { restore: jest.fn() },
        modalMonitor: { restore: jest.fn() },
        editorMonitor: { restore: jest.fn() },
        canvasMonitor: { restore: jest.fn() },
        settingsMonitor: { restore: jest.fn() },
      };

      // Replace the monitor instances with mocks
      Object.assign(monitorManager, mockMonitors);
    });

    it('should restore all monitors', () => {
      monitorManager.restore();

      expect(mockMonitors.networkMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.fileMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.commandMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.advancedAPIMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.debugMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.workspaceMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.metadataMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.keymapMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.modalMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.editorMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.canvasMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.settingsMonitor.restore).toHaveBeenCalled();
    });

    it('should handle missing monitors gracefully', () => {
      // Remove some monitors
      delete (monitorManager as any).networkMonitor;
      delete (monitorManager as any).fileMonitor;

      expect(() => {
        monitorManager.restore();
      }).not.toThrow();

      // Should still call restore on existing monitors
      expect(mockMonitors.commandMonitor.restore).toHaveBeenCalled();
      expect(mockMonitors.advancedAPIMonitor.restore).toHaveBeenCalled();
    });

    it('should handle monitors with no restore method', () => {
      // Replace some monitors with objects that don't have restore method
      (monitorManager as any).networkMonitor = null;
      (monitorManager as any).fileMonitor = null;

      expect(() => {
        monitorManager.restore();
      }).not.toThrow();

      // Should still call restore on monitors that have the method
      expect(mockMonitors.commandMonitor.restore).toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should handle full lifecycle', () => {
      const mockMonitors = {
        networkMonitor: { initialize: jest.fn(), restore: jest.fn() },
        fileMonitor: { initialize: jest.fn(), restore: jest.fn() },
        commandMonitor: { initialize: jest.fn(), restore: jest.fn() },
        advancedAPIMonitor: { initialize: jest.fn(), restore: jest.fn() },
        debugMonitor: { enableAggressiveDebug: jest.fn(), restore: jest.fn() },
        workspaceMonitor: { initialize: jest.fn(), restore: jest.fn() },
        metadataMonitor: { initialize: jest.fn(), restore: jest.fn() },
        keymapMonitor: { initialize: jest.fn(), restore: jest.fn() },
        modalMonitor: { initialize: jest.fn(), restore: jest.fn() },
        editorMonitor: { initialize: jest.fn(), restore: jest.fn() },
        canvasMonitor: { initialize: jest.fn(), restore: jest.fn() },
        settingsMonitor: { initialize: jest.fn(), restore: jest.fn() },
      };

      Object.assign(monitorManager, mockMonitors);

      // Initialize monitoring
      monitorManager.initializeMonitoring();

      // Enable aggressive debug
      monitorManager.enableAggressiveDebug();

      // Restore everything
      monitorManager.restore();

      // Verify all methods were called
      Object.values(mockMonitors).forEach((monitor: any) => {
        if (monitor.initialize) {
          expect(monitor.initialize).toHaveBeenCalled();
        }
        if (monitor.enableAggressiveDebug) {
          expect(monitor.enableAggressiveDebug).toHaveBeenCalled();
        }
        expect(monitor.restore).toHaveBeenCalled();
      });
    });
  });
});
