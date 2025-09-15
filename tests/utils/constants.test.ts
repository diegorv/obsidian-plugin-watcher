import { ACTIVITY_EMOJIS, PLUGIN_COLORS, ACTIVITY_TYPES, FILE_ACTIONS, FILE_EXTENSIONS } from '../../src/utils/constants';

describe('constants', () => {
  describe('ACTIVITY_EMOJIS', () => {
    it('should contain all expected emoji mappings', () => {
      expect(ACTIVITY_EMOJIS.file).toBe('📁');
      expect(ACTIVITY_EMOJIS.command).toBe('⚡');
      expect(ACTIVITY_EMOJIS.network).toBe('🌐');
      expect(ACTIVITY_EMOJIS.note).toBe('📝');
      expect(ACTIVITY_EMOJIS.config).toBe('⚙️');
      expect(ACTIVITY_EMOJIS.style).toBe('🎨');
      expect(ACTIVITY_EMOJIS.code).toBe('💻');
      expect(ACTIVITY_EMOJIS.image).toBe('🖼️');
      expect(ACTIVITY_EMOJIS.pdf).toBe('📄');
      expect(ACTIVITY_EMOJIS.template).toBe('📄');
      expect(ACTIVITY_EMOJIS.core).toBe('🔧');
      expect(ACTIVITY_EMOJIS.webWorker).toBe('🔧');
      expect(ACTIVITY_EMOJIS.eventSource).toBe('📡');
      expect(ACTIVITY_EMOJIS.websocket).toBe('🔌');
      expect(ACTIVITY_EMOJIS.timeout).toBe('⏰');
      expect(ACTIVITY_EMOJIS.domInjection).toBe('🎨');
      expect(ACTIVITY_EMOJIS.asyncOps).toBe('🔄');
    });

    it('should be readonly', () => {
      expect(() => {
        (ACTIVITY_EMOJIS as any).file = 'test';
      }).toThrow();
    });
  });

  describe('PLUGIN_COLORS', () => {
    it('should contain CSS variable colors', () => {
      expect(PLUGIN_COLORS).toContain('var(--color-accent)');
      expect(PLUGIN_COLORS).toContain('var(--color-blue)');
      expect(PLUGIN_COLORS).toContain('var(--color-green)');
      expect(PLUGIN_COLORS).toContain('var(--color-orange)');
      expect(PLUGIN_COLORS).toContain('var(--color-purple)');
    });

    it('should have 5 colors', () => {
      expect(PLUGIN_COLORS).toHaveLength(5);
    });

    it('should be readonly', () => {
      expect(() => {
        (PLUGIN_COLORS as any)[0] = 'test';
      }).toThrow();
    });
  });

  describe('ACTIVITY_TYPES', () => {
    it('should contain expected activity types', () => {
      expect(ACTIVITY_TYPES).toContain('file');
      expect(ACTIVITY_TYPES).toContain('command');
      expect(ACTIVITY_TYPES).toContain('network');
    });

    it('should have 3 types', () => {
      expect(ACTIVITY_TYPES).toHaveLength(3);
    });

    it('should be readonly', () => {
      expect(() => {
        (ACTIVITY_TYPES as any).push('test');
      }).toThrow();
    });
  });

  describe('FILE_ACTIONS', () => {
    it('should contain Portuguese action mappings', () => {
      expect(FILE_ACTIONS.read).toBe('lendo');
      expect(FILE_ACTIONS.modify).toBe('editando');
      expect(FILE_ACTIONS.create).toBe('criando');
      expect(FILE_ACTIONS.delete).toBe('excluindo');
    });

    it('should have 4 actions', () => {
      expect(Object.keys(FILE_ACTIONS)).toHaveLength(4);
    });

    it('should be readonly', () => {
      expect(() => {
        (FILE_ACTIONS as any).read = 'test';
      }).toThrow();
    });
  });

  describe('FILE_EXTENSIONS', () => {
    it('should contain file extension mappings', () => {
      expect(FILE_EXTENSIONS.md).toBe('nota');
      expect(FILE_EXTENSIONS.json).toBe('configurações');
      expect(FILE_EXTENSIONS.css).toBe('estilos');
      expect(FILE_EXTENSIONS.js).toBe('código');
      expect(FILE_EXTENSIONS.ts).toBe('código');
      expect(FILE_EXTENSIONS.png).toBe('imagem');
      expect(FILE_EXTENSIONS.jpg).toBe('imagem');
      expect(FILE_EXTENSIONS.jpeg).toBe('imagem');
      expect(FILE_EXTENSIONS.gif).toBe('imagem');
      expect(FILE_EXTENSIONS.svg).toBe('imagem');
      expect(FILE_EXTENSIONS.pdf).toBe('PDF');
    });

    it('should have 11 extensions', () => {
      expect(Object.keys(FILE_EXTENSIONS)).toHaveLength(11);
    });

    it('should be readonly', () => {
      expect(() => {
        (FILE_EXTENSIONS as any).md = 'test';
      }).toThrow();
    });
  });
});
