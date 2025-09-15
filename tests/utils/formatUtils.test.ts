import {
  formatTimestamp,
  formatFileContext,
  getActionText,
  getActivityEmoji,
  getPluginColor,
  getFileTypeFromExtension,
  formatGroupedRequest,
  getFileTypeEmoji,
} from '../../src/utils/formatUtils';

describe('formatUtils', () => {
  describe('formatTimestamp', () => {
    it('should format date to locale time string', () => {
      const date = new Date('2024-01-01T15:30:45.123Z');
      const result = formatTimestamp(date);
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should handle different timezones', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = formatTimestamp(date);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatFileContext', () => {
    it('should format file path with folder', () => {
      const result = formatFileContext('folder/subfolder/file.md');
      
      expect(result).toBe('📁 subfolder');
    });

    it('should format file path without folder', () => {
      const result = formatFileContext('file.md');
      
      expect(result).toBe('arquivo');
    });

    it('should handle empty path', () => {
      const result = formatFileContext('');
      
      expect(result).toBe('arquivo');
    });

    it('should handle path with only folder', () => {
      const result = formatFileContext('folder/');
      
      expect(result).toBe('📁 folder');
    });
  });

  describe('getActionText', () => {
    it('should return Portuguese text for known actions', () => {
      expect(getActionText('read')).toBe('lendo');
      expect(getActionText('modify')).toBe('editando');
      expect(getActionText('create')).toBe('criando');
      expect(getActionText('delete')).toBe('excluindo');
    });

    it('should return original action for unknown actions', () => {
      expect(getActionText('unknown')).toBe('unknown');
      expect(getActionText('custom-action')).toBe('custom-action');
    });
  });

  describe('getActivityEmoji', () => {
    it('should return correct emoji for known types', () => {
      expect(getActivityEmoji('file')).toBe('📁');
      expect(getActivityEmoji('command')).toBe('⚡');
      expect(getActivityEmoji('network')).toBe('🌐');
      expect(getActivityEmoji('note')).toBe('📝');
      expect(getActivityEmoji('config')).toBe('⚙️');
    });

    it('should return default emoji for unknown types', () => {
      expect(getActivityEmoji('unknown')).toBe('📄');
      expect(getActivityEmoji('')).toBe('📄');
    });
  });

  describe('getPluginColor', () => {
    it('should return consistent color for same plugin name', () => {
      const color1 = getPluginColor('test-plugin');
      const color2 = getPluginColor('test-plugin');
      
      expect(color1).toBe(color2);
    });

    it('should return different colors for different plugin names', () => {
      const color1 = getPluginColor('plugin-a');
      const color2 = getPluginColor('plugin-b');
      
      expect(color1).not.toBe(color2);
    });

    it('should handle empty string', () => {
      const result = getPluginColor('');
      
      expect(result).toBe('var(--color-accent)');
    });

    it('should handle null/undefined', () => {
      const result1 = getPluginColor(null as any);
      const result2 = getPluginColor(undefined as any);
      
      expect(result1).toBe('var(--color-accent)');
      expect(result2).toBe('var(--color-accent)');
    });

    it('should return valid CSS variable', () => {
      const result = getPluginColor('test-plugin');
      
      expect(result).toMatch(/^var\(--color-\w+\)$/);
    });
  });

  describe('getFileTypeFromExtension', () => {
    it('should return correct type for known extensions', () => {
      expect(getFileTypeFromExtension('file.md')).toBe('nota');
      expect(getFileTypeFromExtension('config.json')).toBe('configurações');
      expect(getFileTypeFromExtension('style.css')).toBe('estilos');
      expect(getFileTypeFromExtension('script.js')).toBe('código');
      expect(getFileTypeFromExtension('script.ts')).toBe('código');
      expect(getFileTypeFromExtension('image.png')).toBe('imagem');
      expect(getFileTypeFromExtension('document.pdf')).toBe('PDF');
    });

    it('should handle case insensitive extensions', () => {
      expect(getFileTypeFromExtension('file.MD')).toBe('nota');
      expect(getFileTypeFromExtension('config.JSON')).toBe('configurações');
      expect(getFileTypeFromExtension('image.PNG')).toBe('imagem');
    });

    it('should return default for unknown extensions', () => {
      expect(getFileTypeFromExtension('file.unknown')).toBe('arquivo');
      expect(getFileTypeFromExtension('file')).toBe('arquivo');
      expect(getFileTypeFromExtension('')).toBe('arquivo');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileTypeFromExtension('file.backup.md')).toBe('nota');
      expect(getFileTypeFromExtension('config.prod.json')).toBe('configurações');
    });
  });

  describe('formatGroupedRequest', () => {
    it('should format grouped request with count and time span', () => {
      const result = formatGroupedRequest(5, 3000);
      
      expect(result).toBe(' (5x em 3s)');
    });

    it('should handle zero time span', () => {
      const result = formatGroupedRequest(2, 0);
      
      expect(result).toBe(' (2x em 0s)');
    });

    it('should round time span to seconds', () => {
      const result = formatGroupedRequest(1, 1500);
      
      expect(result).toBe(' (1x em 2s)');
    });

    it('should handle large numbers', () => {
      const result = formatGroupedRequest(100, 60000);
      
      expect(result).toBe(' (100x em 60s)');
    });
  });

  describe('getFileTypeEmoji', () => {
    it('should return correct emoji for known file types', () => {
      expect(getFileTypeEmoji('file.md')).toBe('📝');
      expect(getFileTypeEmoji('config.json')).toBe('⚙️');
      expect(getFileTypeEmoji('style.css')).toBe('🎨');
      expect(getFileTypeEmoji('script.js')).toBe('💻');
      expect(getFileTypeEmoji('script.ts')).toBe('💻');
      expect(getFileTypeEmoji('image.png')).toBe('🖼️');
      expect(getFileTypeEmoji('image.jpg')).toBe('🖼️');
      expect(getFileTypeEmoji('image.jpeg')).toBe('🖼️');
      expect(getFileTypeEmoji('image.gif')).toBe('🖼️');
      expect(getFileTypeEmoji('image.svg')).toBe('🖼️');
      expect(getFileTypeEmoji('document.pdf')).toBe('📄');
    });

    it('should handle case insensitive extensions', () => {
      expect(getFileTypeEmoji('file.MD')).toBe('📝');
      expect(getFileTypeEmoji('config.JSON')).toBe('⚙️');
      expect(getFileTypeEmoji('image.PNG')).toBe('🖼️');
    });

    it('should return default emoji for unknown extensions', () => {
      expect(getFileTypeEmoji('file.unknown')).toBe('📁');
      expect(getFileTypeEmoji('file')).toBe('📁');
      expect(getFileTypeEmoji('')).toBe('📁');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileTypeEmoji('file.backup.md')).toBe('📝');
      expect(getFileTypeEmoji('config.prod.json')).toBe('⚙️');
    });
  });
});
