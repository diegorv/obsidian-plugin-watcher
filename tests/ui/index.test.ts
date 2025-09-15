import * as ui from '../../src/ui';

describe('ui index exports', () => {
  it('should export LogsModal', () => {
    expect(ui.LogsModal).toBeDefined();
    expect(typeof ui.LogsModal).toBe('function');
  });

  it('should export ExtensionWatcherSettingTab', () => {
    expect(ui.ExtensionWatcherSettingTab).toBeDefined();
    expect(typeof ui.ExtensionWatcherSettingTab).toBe('function');
  });

  it('should have all expected exports', () => {
    const exports = Object.keys(ui);
    expect(exports).toContain('LogsModal');
    expect(exports).toContain('ExtensionWatcherSettingTab');
    expect(exports).toHaveLength(2);
  });

  it('should allow instantiation of UI components', () => {
    const mockApp = { vault: {}, workspace: {} } as any;
    const mockPlugin = { logs: [], settings: {} };

    // Test that classes can be instantiated
    expect(() => {
      new ui.LogsModal(mockApp, mockPlugin);
    }).not.toThrow();

    expect(() => {
      new ui.ExtensionWatcherSettingTab(mockApp, mockPlugin);
    }).not.toThrow();
  });
});
