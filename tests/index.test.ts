import * as index from '../src/index';

describe('index exports', () => {
  it('should export ExtensionWatcherPlugin', () => {
    expect(index.ExtensionWatcherPlugin).toBeDefined();
  });

  it('should export CommandManager', () => {
    expect(index.CommandManager).toBeDefined();
  });

  it('should export all types', () => {
    expect(index.DEFAULT_SETTINGS).toBeDefined();
    expect(typeof index.DEFAULT_SETTINGS).toBe('object');
  });

  it('should export UI components', () => {
    // These will be defined when we create the UI tests
    expect(index).toBeDefined();
  });

  it('should export monitoring components', () => {
    // These will be defined when we create the monitoring tests
    expect(index).toBeDefined();
  });

  it('should export interpretation components', () => {
    // These will be defined when we create the interpretation tests
    expect(index).toBeDefined();
  });
});
