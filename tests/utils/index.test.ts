import * as utils from '../../src/utils';

describe('utils index exports', () => {
  it('should export constants', () => {
    expect(utils.ACTIVITY_EMOJIS).toBeDefined();
    expect(utils.PLUGIN_COLORS).toBeDefined();
    expect(utils.ACTIVITY_TYPES).toBeDefined();
    expect(utils.FILE_ACTIONS).toBeDefined();
    expect(utils.FILE_EXTENSIONS).toBeDefined();
  });

  it('should export format utilities', () => {
    expect(utils.formatTimestamp).toBeDefined();
    expect(utils.formatFileContext).toBeDefined();
    expect(utils.getActionText).toBeDefined();
    expect(utils.getActivityEmoji).toBeDefined();
    expect(utils.getPluginColor).toBeDefined();
    expect(utils.getFileTypeFromExtension).toBeDefined();
    expect(utils.formatGroupedRequest).toBeDefined();
    expect(utils.getFileTypeEmoji).toBeDefined();
  });

  it('should export URL utilities', () => {
    expect(utils.parseUrl).toBeDefined();
    expect(utils.formatUrlForDisplay).toBeDefined();
    expect(utils.formatNetworkContext).toBeDefined();
  });

  it('should export log filter utilities', () => {
    expect(utils.filterLogs).toBeDefined();
    expect(utils.getUniquePlugins).toBeDefined();
    expect(utils.countLogsByPlugin).toBeDefined();
    expect(utils.countLogsByType).toBeDefined();
  });

  it('should export all functions as callable', () => {
    expect(typeof utils.formatTimestamp).toBe('function');
    expect(typeof utils.formatFileContext).toBe('function');
    expect(typeof utils.getActionText).toBe('function');
    expect(typeof utils.getActivityEmoji).toBe('function');
    expect(typeof utils.getPluginColor).toBe('function');
    expect(typeof utils.getFileTypeFromExtension).toBe('function');
    expect(typeof utils.formatGroupedRequest).toBe('function');
    expect(typeof utils.getFileTypeEmoji).toBe('function');
    expect(typeof utils.parseUrl).toBe('function');
    expect(typeof utils.formatUrlForDisplay).toBe('function');
    expect(typeof utils.formatNetworkContext).toBe('function');
    expect(typeof utils.filterLogs).toBe('function');
    expect(typeof utils.getUniquePlugins).toBe('function');
    expect(typeof utils.countLogsByPlugin).toBe('function');
    expect(typeof utils.countLogsByType).toBe('function');
  });
});
