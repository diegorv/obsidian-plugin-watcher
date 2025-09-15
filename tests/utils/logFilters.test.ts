import { filterLogs, getUniquePlugins, countLogsByPlugin, countLogsByType, LogFilters } from '../../src/utils/logFilters';
import { LogEntry } from '../../src/types';

describe('logFilters', () => {
  const mockLogs: LogEntry[] = [
    {
      timestamp: new Date('2024-01-01T10:00:00Z'),
      type: 'file',
      plugin: 'plugin-a',
      action: 'read',
      details: { path: '/file1.md' },
    },
    {
      timestamp: new Date('2024-01-01T10:01:00Z'),
      type: 'command',
      plugin: 'plugin-b',
      action: 'execute',
      details: { commandId: 'test-command' },
    },
    {
      timestamp: new Date('2024-01-01T10:02:00Z'),
      type: 'file',
      plugin: 'plugin-a',
      action: 'write',
      details: { path: '/file2.md' },
    },
    {
      timestamp: new Date('2024-01-01T10:03:00Z'),
      type: 'network',
      plugin: 'plugin-c',
      action: 'request',
      details: { url: 'https://api.example.com' },
    },
    {
      timestamp: new Date('2024-01-01T10:04:00Z'),
      type: 'command',
      plugin: 'plugin-b',
      action: 'execute',
      details: { commandId: 'another-command' },
    },
  ];

  describe('filterLogs', () => {
    it('should return all logs when no filters provided', () => {
      const filters: LogFilters = {};
      const result = filterLogs(mockLogs, filters);
      
      expect(result).toHaveLength(5);
      expect(result).toEqual(mockLogs);
    });

    it('should filter by plugin', () => {
      const filters: LogFilters = { plugin: 'plugin-a' };
      const result = filterLogs(mockLogs, filters);
      
      expect(result).toHaveLength(2);
      expect(result.every(log => log.plugin === 'plugin-a')).toBe(true);
    });

    it('should filter by type', () => {
      const filters: LogFilters = { type: 'file' };
      const result = filterLogs(mockLogs, filters);
      
      expect(result).toHaveLength(2);
      expect(result.every(log => log.type === 'file')).toBe(true);
    });

    it('should filter by both plugin and type', () => {
      const filters: LogFilters = { plugin: 'plugin-b', type: 'command' };
      const result = filterLogs(mockLogs, filters);
      
      expect(result).toHaveLength(2);
      expect(result.every(log => log.plugin === 'plugin-b' && log.type === 'command')).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const filters: LogFilters = { plugin: 'non-existent' };
      const result = filterLogs(mockLogs, filters);
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty logs array', () => {
      const filters: LogFilters = { plugin: 'plugin-a' };
      const result = filterLogs([], filters);
      
      expect(result).toHaveLength(0);
    });

    it('should handle undefined filters', () => {
      const result = filterLogs(mockLogs, {} as LogFilters);
      
      expect(result).toHaveLength(5);
    });
  });

  describe('getUniquePlugins', () => {
    it('should return unique plugin names sorted alphabetically', () => {
      const result = getUniquePlugins(mockLogs);
      
      expect(result).toEqual(['plugin-a', 'plugin-b', 'plugin-c']);
    });

    it('should handle empty logs array', () => {
      const result = getUniquePlugins([]);
      
      expect(result).toEqual([]);
    });

    it('should handle logs with duplicate plugins', () => {
      const logsWithDuplicates = [
        ...mockLogs,
        {
          timestamp: new Date(),
          type: 'file' as const,
          plugin: 'plugin-a',
          action: 'read',
          details: {},
        },
      ];
      
      const result = getUniquePlugins(logsWithDuplicates);
      
      expect(result).toEqual(['plugin-a', 'plugin-b', 'plugin-c']);
    });

    it('should handle single log entry', () => {
      const singleLog = [mockLogs[0]!];
      const result = getUniquePlugins(singleLog);
      
      expect(result).toEqual(['plugin-a']);
    });
  });

  describe('countLogsByPlugin', () => {
    it('should count logs by plugin', () => {
      const result = countLogsByPlugin(mockLogs);
      
      expect(result).toEqual({
        'plugin-a': 2,
        'plugin-b': 2,
        'plugin-c': 1,
      });
    });

    it('should handle empty logs array', () => {
      const result = countLogsByPlugin([]);
      
      expect(result).toEqual({});
    });

    it('should handle single log entry', () => {
      const singleLog = [mockLogs[0]!];
      const result = countLogsByPlugin(singleLog);
      
      expect(result).toEqual({
        'plugin-a': 1,
      });
    });

    it('should handle logs with same plugin multiple times', () => {
      const logsWithDuplicates = [
        ...mockLogs,
        {
          timestamp: new Date(),
          type: 'file' as const,
          plugin: 'plugin-a',
          action: 'read',
          details: {},
        },
      ];
      
      const result = countLogsByPlugin(logsWithDuplicates);
      
      expect(result).toEqual({
        'plugin-a': 3,
        'plugin-b': 2,
        'plugin-c': 1,
      });
    });
  });

  describe('countLogsByType', () => {
    it('should count logs by type', () => {
      const result = countLogsByType(mockLogs);
      
      expect(result).toEqual({
        'file': 2,
        'command': 2,
        'network': 1,
      });
    });

    it('should handle empty logs array', () => {
      const result = countLogsByType([]);
      
      expect(result).toEqual({});
    });

    it('should handle single log entry', () => {
      const singleLog = [mockLogs[0]!];
      const result = countLogsByType(singleLog);
      
      expect(result).toEqual({
        'file': 1,
      });
    });

    it('should handle logs with same type multiple times', () => {
      const logsWithDuplicates = [
        ...mockLogs,
        {
          timestamp: new Date(),
          type: 'file' as const,
          plugin: 'plugin-d',
          action: 'read',
          details: {},
        },
      ];
      
      const result = countLogsByType(logsWithDuplicates);
      
      expect(result).toEqual({
        'file': 3,
        'command': 2,
        'network': 1,
      });
    });
  });

  describe('LogFilters interface', () => {
    it('should allow optional plugin filter', () => {
      const filters: LogFilters = { plugin: 'test-plugin' };
      
      expect(filters.plugin).toBe('test-plugin');
    });

    it('should allow optional type filter', () => {
      const filters: LogFilters = { type: 'file' };
      
      expect(filters.type).toBe('file');
    });

    it('should allow both filters', () => {
      const filters: LogFilters = { plugin: 'test-plugin', type: 'file' };
      
      expect(filters.plugin).toBe('test-plugin');
      expect(filters.type).toBe('file');
    });

    it('should allow empty filters', () => {
      const filters: LogFilters = {};
      
      expect(filters.plugin).toBeUndefined();
      expect(filters.type).toBeUndefined();
    });
  });
});
