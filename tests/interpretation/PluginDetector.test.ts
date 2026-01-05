import { PluginDetector } from '../../src/interpretation/PluginDetector';

describe('PluginDetector', () => {
  let detector: PluginDetector;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    detector = new PluginDetector({ debugMode: false });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should initialize with settings', () => {
      const settings = { debugMode: true };
      const detectorWithDebug = new PluginDetector(settings);
      
      expect(detectorWithDebug).toBeInstanceOf(PluginDetector);
    });
  });

  describe('detectPluginFromStack', () => {
    it('should return unknown for empty stack', () => {
      const result = detector.detectPluginFromStack('');
      
      expect(result).toBe('unknown');
    });

    it('should return unknown for undefined stack', () => {
      const result = detector.detectPluginFromStack(undefined);
      
      expect(result).toBe('unknown');
    });

    it('should detect plugin from standard Obsidian pattern', () => {
      const stack = `
        Error
        at someFunction (plugin:my-plugin:123:45)
        at anotherFunction (plugin:my-plugin:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should detect plugin from alternative pattern', () => {
      const stack = `
        Error
        at someFunction (plugins/my-plugin/main.js:123:45)
        at anotherFunction (plugins/my-plugin/utils.js:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should detect plugin from function-specific pattern', () => {
      const stack = `
        Error
        at someFunction (plugin:my-plugin:123:45)
        at window.fetch (plugin:my-plugin:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should detect plugin from generic pattern', () => {
      const stack = `
        Error
        at someFunction (plugin:my-plugin)
        at anotherFunction (plugin:my-plugin)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should filter out obsidian-extension-watcher from results', () => {
      const stack = `
        Error
        at someFunction (plugin:obsidian-extension-watcher:123:45)
        at anotherFunction (plugin:my-plugin:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should normalize obsidian.md to core', () => {
      const stack = `
        Error
        at someFunction (plugin:obsidian.md:123:45)
        at anotherFunction (plugin:obsidian.md:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('core');
    });

    it('should detect core operation from app.js references', () => {
      const stack = `
        Error
        at someFunction (app://obsidian.md/app.js:123:45)
        at anotherFunction (app://obsidian.md/app.js:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('core');
    });

    it('should detect core operation from obsidian.md references', () => {
      const stack = `
        Error
        at someFunction (obsidian.md:123:45)
        at anotherFunction (obsidian.md:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('core');
    });

    it('should detect core operation from app.js references', () => {
      const stack = `
        Error
        at someFunction (app.js:123:45)
        at anotherFunction (app.js:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('core');
    });

    it('should return unknown when no valid plugin is found', () => {
      const stack = `
        Error
        at someFunction (unknown.js:123:45)
        at anotherFunction (unknown.js:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('unknown');
    });

    it('should handle mixed stack with valid and invalid plugins', () => {
      const stack = `
        Error
        at someFunction (plugin:invalid-plugin:123:45)
        at anotherFunction (plugin:my-plugin:67:89)
        at thirdFunction (unknown.js:90:12)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should prioritize first valid plugin found', () => {
      const stack = `
        Error
        at someFunction (plugin:first-plugin:123:45)
        at anotherFunction (plugin:second-plugin:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('first-plugin');
    });
  });

  describe('debug mode', () => {
    it('should log debug information when debug mode is enabled', () => {
      const debugDetector = new PluginDetector({ debugMode: true });
      const stack = `
        Error
        at someFunction (plugin:my-plugin:123:45)
      `;
      
      debugDetector.detectPluginFromStack(stack);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Extension Watcher Debug] Stack completo:',
        expect.stringContaining('Error'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Extension Watcher Debug] Stack limpo:',
        expect.stringContaining('someFunction'),
      );
    });

    it('should not log debug information when debug mode is disabled', () => {
      const stack = `
        Error
        at someFunction (plugin:my-plugin:123:45)
      `;
      
      detector.detectPluginFromStack(stack);
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle stack with only extension watcher references', () => {
      const stack = `
        Error
        at someFunction (plugin:obsidian-extension-watcher:123:45)
        at anotherFunction (window.fetch (plugin:obsidian-extension-watcher:67:89))
        at thirdFunction (app.vault.read (plugin:obsidian-extension-watcher:90:12))
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('unknown');
    });

    it('should handle stack with only app.js references', () => {
      const stack = `
        Error
        at someFunction (app://obsidian.md/app.js:123:45)
        at anotherFunction (app://obsidian.md/app.js:67:89)
        at thirdFunction (app://obsidian.md/app.js:90:12)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('core');
    });

    it('should handle malformed stack traces', () => {
      const stack = `
        Error
        at someFunction (malformed:123:45)
        at anotherFunction (also-malformed:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('unknown');
    });

    it('should handle empty lines in stack', () => {
      const stack = `
        Error
        
        at someFunction (plugin:my-plugin:123:45)
        
        at anotherFunction (plugin:my-plugin:67:89)
      `;
      
      const result = detector.detectPluginFromStack(stack);
      
      expect(result).toBe('my-plugin');
    });

    it('should handle very long stack traces', () => {
      const longStack = `
        Error
        ${Array(100).fill('at someFunction (plugin:my-plugin:123:45)').join('\n')}
      `;
      
      const result = detector.detectPluginFromStack(longStack);
      
      expect(result).toBe('my-plugin');
    });
  });
});
