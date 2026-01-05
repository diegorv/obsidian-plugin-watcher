import * as monitoring from '../../src/monitoring';

describe('monitoring index exports', () => {
  it('should export BaseMonitor', () => {
    expect(monitoring.BaseMonitor).toBeDefined();
    expect(typeof monitoring.BaseMonitor).toBe('function');
  });

  it('should export NetworkMonitor', () => {
    expect(monitoring.NetworkMonitor).toBeDefined();
    expect(typeof monitoring.NetworkMonitor).toBe('function');
  });

  it('should export FileMonitor', () => {
    expect(monitoring.FileMonitor).toBeDefined();
    expect(typeof monitoring.FileMonitor).toBe('function');
  });

  it('should export CommandMonitor', () => {
    expect(monitoring.CommandMonitor).toBeDefined();
    expect(typeof monitoring.CommandMonitor).toBe('function');
  });

  it('should export MonitorManager', () => {
    expect(monitoring.MonitorManager).toBeDefined();
    expect(typeof monitoring.MonitorManager).toBe('function');
  });

  it('should export AdvancedAPIMonitor', () => {
    expect(monitoring.AdvancedAPIMonitor).toBeDefined();
    expect(typeof monitoring.AdvancedAPIMonitor).toBe('function');
  });

  it('should export DebugMonitor', () => {
    expect(monitoring.DebugMonitor).toBeDefined();
    expect(typeof monitoring.DebugMonitor).toBe('function');
  });

  it('should export WorkspaceMonitor', () => {
    expect(monitoring.WorkspaceMonitor).toBeDefined();
    expect(typeof monitoring.WorkspaceMonitor).toBe('function');
  });

  it('should export MetadataMonitor', () => {
    expect(monitoring.MetadataMonitor).toBeDefined();
    expect(typeof monitoring.MetadataMonitor).toBe('function');
  });

  it('should export KeymapMonitor', () => {
    expect(monitoring.KeymapMonitor).toBeDefined();
    expect(typeof monitoring.KeymapMonitor).toBe('function');
  });

  it('should export ModalMonitor', () => {
    expect(monitoring.ModalMonitor).toBeDefined();
    expect(typeof monitoring.ModalMonitor).toBe('function');
  });

  it('should export EditorMonitor', () => {
    expect(monitoring.EditorMonitor).toBeDefined();
    expect(typeof monitoring.EditorMonitor).toBe('function');
  });

  it('should export CanvasMonitor', () => {
    expect(monitoring.CanvasMonitor).toBeDefined();
    expect(typeof monitoring.CanvasMonitor).toBe('function');
  });

  it('should export SettingsMonitor', () => {
    expect(monitoring.SettingsMonitor).toBeDefined();
    expect(typeof monitoring.SettingsMonitor).toBe('function');
  });

  it('should export NodeFsMonitor', () => {
    expect(monitoring.NodeFsMonitor).toBeDefined();
    expect(typeof monitoring.NodeFsMonitor).toBe('function');
  });

  it('should export NodeNetworkMonitor', () => {
    expect(monitoring.NodeNetworkMonitor).toBeDefined();
    expect(typeof monitoring.NodeNetworkMonitor).toBe('function');
  });

  it('should export ChildProcessMonitor', () => {
    expect(monitoring.ChildProcessMonitor).toBeDefined();
    expect(typeof monitoring.ChildProcessMonitor).toBe('function');
  });

  it('should export WebSocketMonitor', () => {
    expect(monitoring.WebSocketMonitor).toBeDefined();
    expect(typeof monitoring.WebSocketMonitor).toBe('function');
  });

  it('should export OsMonitor', () => {
    expect(monitoring.OsMonitor).toBeDefined();
    expect(typeof monitoring.OsMonitor).toBe('function');
  });

  it('should have all expected exports', () => {
    const exports = Object.keys(monitoring);
    const expectedExports = [
      'BaseMonitor',
      'NetworkMonitor',
      'FileMonitor',
      'CommandMonitor',
      'MonitorManager',
      'AdvancedAPIMonitor',
      'DebugMonitor',
      'WorkspaceMonitor',
      'MetadataMonitor',
      'KeymapMonitor',
      'ModalMonitor',
      'EditorMonitor',
      'CanvasMonitor',
      'SettingsMonitor',
      'NodeFsMonitor',
      'NodeNetworkMonitor',
      'ChildProcessMonitor',
      'WebSocketMonitor',
      'OsMonitor',
    ];

    expectedExports.forEach(exportName => {
      expect(exports).toContain(exportName);
    });

    expect(exports).toHaveLength(expectedExports.length);
  });

  it('should allow instantiation of monitor classes', () => {
    const mockPlugin = { detectPluginFromStack: jest.fn(), addLog: jest.fn() };
    const mockApp = { vault: {}, workspace: {} } as any;

    expect(() => {
      new (class extends monitoring.BaseMonitor {
        initialize(): void {}
      })(mockPlugin);
    }).not.toThrow();

    expect(() => new monitoring.NetworkMonitor(mockPlugin)).not.toThrow();
    expect(() => new monitoring.FileMonitor(mockApp, mockPlugin)).not.toThrow();
    expect(() => new monitoring.CommandMonitor(mockApp, mockPlugin)).not.toThrow();
    expect(() => new monitoring.MonitorManager(mockPlugin, mockApp)).not.toThrow();
    expect(() => new monitoring.NodeFsMonitor(mockPlugin)).not.toThrow();
    expect(() => new monitoring.NodeNetworkMonitor(mockPlugin)).not.toThrow();
    expect(() => new monitoring.ChildProcessMonitor(mockPlugin)).not.toThrow();
    expect(() => new monitoring.WebSocketMonitor(mockPlugin)).not.toThrow();
    expect(() => new monitoring.OsMonitor(mockPlugin)).not.toThrow();
  });
});
