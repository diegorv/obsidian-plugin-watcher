import { ActivityInterpreter } from '../../src/interpretation/ActivityInterpreter';

// Mock the utils module
jest.mock('../../src/utils', () => ({
  parseUrl: jest.fn(),
  formatNetworkContext: jest.fn(),
  getActionText: jest.fn(),
  getFileTypeFromExtension: jest.fn(),
  formatGroupedRequest: jest.fn(),
  getFileTypeEmoji: jest.fn(),
  formatFileContext: jest.fn(),
  ACTIVITY_EMOJIS: {
    network: '🌐',
    config: '⚙️',
    template: '📄',
    note: '📝',
    style: '🎨',
    code: '💻',
    image: '🖼️',
    pdf: '📄',
    file: '📁',
  },
}));

describe('ActivityInterpreter', () => {
  let interpreter: ActivityInterpreter;
  let mockUtils: any;

  beforeEach(() => {
    jest.clearAllMocks();
    interpreter = new ActivityInterpreter();
    mockUtils = require('../../src/utils');
  });

  describe('interpretActivity', () => {
    it('should interpret network activity', () => {
      mockUtils.parseUrl.mockReturnValue({
        domain: 'api.example.com',
        pathname: '/users',
        search: '?page=1',
        fullPath: 'api.example.com/users?page=1',
      });
      mockUtils.formatNetworkContext.mockReturnValue('🌐 api.example.com/users?page=1');

      const result = interpreter.interpretActivity(
        'network',
        'test-plugin',
        'request',
        { url: 'https://api.example.com/users?page=1', method: 'GET' },
      );

      expect(result.interpretation).toContain('🌐 test-plugin - GET');
      expect(result.interpretation).toContain('api.example.com/users?page=1');
      expect(result.context).toBe('🌐 api.example.com/users?page=1');
    });

    it('should interpret network activity with grouped requests', () => {
      mockUtils.parseUrl.mockReturnValue({
        domain: 'api.example.com',
        pathname: '/data',
        search: '',
        fullPath: 'api.example.com/data',
      });
      mockUtils.formatNetworkContext.mockReturnValue('🌐 api.example.com/data');
      mockUtils.formatGroupedRequest.mockReturnValue(' (3x em 2s)');

      const result = interpreter.interpretActivity(
        'network',
        'test-plugin',
        'request',
        {
          url: 'https://api.example.com/data',
          method: 'POST',
          grouped: true,
          repeatCount: 3,
          timeSpan: 2000,
        },
      );

      expect(result.interpretation).toContain('🌐 test-plugin - POST');
      expect(result.interpretation).toContain('api.example.com/data');
      expect(result.interpretation).toContain(' (3x em 2s)');
    });

    it('should interpret file activity for markdown files', () => {
      mockUtils.getActionText.mockReturnValue('lendo');
      mockUtils.getFileTypeFromExtension.mockReturnValue('nota');
      mockUtils.getFileTypeEmoji.mockReturnValue('📝');
      mockUtils.formatFileContext.mockReturnValue('📁 notes');

      const result = interpreter.interpretActivity(
        'file',
        'test-plugin',
        'read',
        { path: '/notes/daily.md' },
      );

      expect(result.interpretation).toBe('📝 test-plugin está lendo nota');
      expect(result.context).toBe('📁 notes');
    });

    it('should interpret file activity for configuration files', () => {
      mockUtils.getActionText.mockReturnValue('editando');
      mockUtils.formatFileContext.mockReturnValue('📁 .obsidian');

      const result = interpreter.interpretActivity(
        'file',
        'test-plugin',
        'modify',
        { path: '.obsidian/config.json' },
      );

      expect(result.interpretation).toBe('⚙️ test-plugin está editando configurações do Obsidian');
      expect(result.context).toBe('📁 .obsidian');
    });

    it('should interpret file activity for template files', () => {
      mockUtils.getActionText.mockReturnValue('criando');

      const result = interpreter.interpretActivity(
        'file',
        'test-plugin',
        'create',
        { path: '/templates/daily-template.md' },
      );

      expect(result.interpretation).toBe('📄 test-plugin está criando um template');
    });

    it('should interpret command activity with command ID', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'execute',
        { commandId: 'test-command' },
      );

      expect(result.interpretation).toBe('⚡ test-plugin executou comando: test-command');
      expect(result.context).toBe('Comando: test-command');
    });

    it('should interpret command activity with URL', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'open-url',
        { url: 'https://example.com' },
      );

      expect(result.interpretation).toBe('🔗 test-plugin abrindo URL externa: https://example.com');
      expect(result.context).toBe('Comando: https://example.com');
    });

    it('should interpret web worker command', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'web-worker',
        {},
      );

      expect(result.interpretation).toBe('🔧 test-plugin criando Web Worker');
    });

    it('should interpret event source command', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'event-source',
        {},
      );

      expect(result.interpretation).toBe('📡 test-plugin estabelecendo Server-Sent Events');
    });

    it('should interpret websocket command', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'websocket',
        {},
      );

      expect(result.interpretation).toBe('🔌 test-plugin conectando via WebSocket');
    });

    it('should interpret timeout command', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'set-timeout',
        {},
      );

      expect(result.interpretation).toBe('⏰ test-plugin agendando tarefa');
    });

    it('should interpret DOM injection command', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'append-element',
        {},
      );

      expect(result.interpretation).toBe('🎨 test-plugin injetando elemento DOM');
    });

    it('should interpret promise all command', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'promise-all',
        {},
      );

      expect(result.interpretation).toBe('🔄 test-plugin executando operações assíncronas');
    });

    it('should interpret unknown command action', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'unknown-action',
        {},
      );

      expect(result.interpretation).toBe('⚡ test-plugin executou ação: unknown-action');
    });

    it('should interpret generic activity', () => {
      const result = interpreter.interpretActivity(
        'workspace',
        'test-plugin',
        'custom-action',
        { custom: 'data' },
      );

      expect(result.interpretation).toBe('test-plugin executou custom-action');
      expect(result.context).toBe('Atividade genérica');
    });
  });

  describe('private methods', () => {
    it('should handle network activity with invalid URL', () => {
      mockUtils.parseUrl.mockReturnValue(null);
      mockUtils.formatNetworkContext.mockReturnValue('🌐 invalid-url');

      const result = interpreter.interpretActivity(
        'network',
        'test-plugin',
        'request',
        { url: 'invalid-url' },
      );

      expect(result.interpretation).toContain('🌐 test-plugin - GET');
      expect(result.interpretation).toContain('invalid-url');
    });

    it('should handle file activity with unknown file type', () => {
      mockUtils.getActionText.mockReturnValue('lendo');
      mockUtils.getFileTypeFromExtension.mockReturnValue('arquivo');
      mockUtils.getFileTypeEmoji.mockReturnValue('📁');

      const result = interpreter.interpretActivity(
        'file',
        'test-plugin',
        'read',
        { path: '/unknown/file.xyz' },
      );

      expect(result.interpretation).toBe('📁 test-plugin está lendo arquivo');
    });

    it('should handle empty details object', () => {
      const result = interpreter.interpretActivity(
        'command',
        'test-plugin',
        'execute',
        {},
      );

      expect(result.interpretation).toBe('⚡ test-plugin executou ação: execute');
    });
  });
});
