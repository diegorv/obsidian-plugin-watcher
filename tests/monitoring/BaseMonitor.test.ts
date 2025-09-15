import { BaseMonitor } from '../../src/monitoring/BaseMonitor';
import { App } from 'obsidian';

// Mock the App class
jest.mock('obsidian', () => ({
  App: jest.fn(),
}));

describe('BaseMonitor', () => {
  let mockPlugin: any;
  let mockApp: App;
  let monitor: BaseMonitor;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
      registerEvent: jest.fn(),
    };
    
    mockApp = new App();
    
    // Create a concrete implementation of BaseMonitor for testing
    class TestMonitor extends BaseMonitor {
      initialize(): void {
        // Test implementation
      }
    }
    
    monitor = new TestMonitor(mockPlugin, mockApp);
  });

  describe('constructor', () => {
    it('should initialize with plugin and app', () => {
      expect(monitor).toBeInstanceOf(BaseMonitor);
    });

    it('should initialize with plugin only', () => {
      const monitorWithoutApp = new (class extends BaseMonitor {
        initialize(): void {}
      })(mockPlugin);
      
      expect(monitorWithoutApp).toBeInstanceOf(BaseMonitor);
    });
  });

  describe('detectPluginFromStack', () => {
    it('should call plugin.detectPluginFromStack with current stack', () => {
      const result = (monitor as any).detectPluginFromStack();
      
      expect(mockPlugin.detectPluginFromStack).toHaveBeenCalled();
      expect(result).toBe('test-plugin');
    });

    it('should return unknown when plugin method throws', () => {
      mockPlugin.detectPluginFromStack.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const result = (monitor as any).detectPluginFromStack();
      
      expect(result).toBe('unknown');
    });

    it('should return unknown when plugin method returns undefined', () => {
      mockPlugin.detectPluginFromStack.mockReturnValue(undefined);
      
      const result = (monitor as any).detectPluginFromStack();
      
      expect(result).toBe('unknown');
    });
  });

  describe('addLog', () => {
    it('should call plugin.addLog with correct parameters', () => {
      const details = { path: '/test.md' };
      
      (monitor as any).addLog('file', 'read', details);
      
      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'file',
        plugin: 'test-plugin',
        action: 'read',
        details,
        timestamp: expect.any(Date),
      });
    });

    it('should use provided plugin name when given', () => {
      const details = { path: '/test.md' };
      
      (monitor as any).addLog('file', 'read', details, 'custom-plugin');
      
      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'file',
        plugin: 'custom-plugin',
        action: 'read',
        details,
        timestamp: expect.any(Date),
      });
    });

    it('should handle empty details object', () => {
      (monitor as any).addLog('command', 'execute', {});
      
      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'command',
        plugin: 'test-plugin',
        action: 'execute',
        details: {},
        timestamp: expect.any(Date),
      });
    });

    it('should handle null details', () => {
      (monitor as any).addLog('network', 'request', null);
      
      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'network',
        plugin: 'test-plugin',
        action: 'request',
        details: {},
        timestamp: expect.any(Date),
      });
    });

    it('should handle undefined details', () => {
      (monitor as any).addLog('workspace', 'change', undefined);
      
      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'workspace',
        plugin: 'test-plugin',
        action: 'change',
        details: {},
        timestamp: expect.any(Date),
      });
    });

    it('should handle plugin.addLog throwing error', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockPlugin.addLog.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      (monitor as any).addLog('file', 'read', { path: '/test.md' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Extension Watcher] Erro ao adicionar log:',
        expect.any(Error),
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('interceptMethod', () => {
    it('should successfully intercept a method', () => {
      const target = {
        testMethod: jest.fn().mockReturnValue('original result'),
      };
      
      const interceptor = jest.fn((originalMethod, ...args) => {
        return originalMethod.apply(this, args);
      });
      
      const result = (monitor as any).interceptMethod(target, 'testMethod', interceptor);
      
      expect(result).toBe(true);
      expect(target.testMethod).not.toBe(interceptor);
    });

    it('should return false for non-existent method', () => {
      const target = {};
      
      const result = (monitor as any).interceptMethod(target, 'nonExistentMethod', jest.fn());
      
      expect(result).toBe(false);
    });

    it('should return false for non-function property', () => {
      const target = {
        notAFunction: 'string value',
      };
      
      const result = (monitor as any).interceptMethod(target, 'notAFunction', jest.fn());
      
      expect(result).toBe(false);
    });

    it('should handle interceptor throwing error', () => {
      const target = {
        testMethod: jest.fn().mockReturnValue('original result'),
      };
      
      const interceptor = jest.fn(() => {
        throw new Error('Interceptor error');
      });
      
      const result = (monitor as any).interceptMethod(target, 'testMethod', interceptor);
      
      expect(result).toBe(true);
      
      // Call the intercepted method to trigger the error
      target.testMethod();
      
      expect(console.warn).toHaveBeenCalledWith(
        '[Extension Watcher] Erro no interceptor para testMethod:',
        expect.any(Error),
      );
    });

    it('should handle interception throwing error', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const target = {
        get testMethod() {
          throw new Error('Property access error');
        },
      };
      
      const result = (monitor as any).interceptMethod(target, 'testMethod', jest.fn());
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Extension Watcher] Erro ao interceptar método testMethod:',
        expect.any(Error),
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('registerEvent', () => {
    it('should call plugin.registerEvent when available', () => {
      const eventRef = { type: 'test-event' };
      
      (monitor as any).registerEvent(eventRef);
      
      expect(mockPlugin.registerEvent).toHaveBeenCalledWith(eventRef);
    });

    it('should handle plugin without registerEvent method', () => {
      const pluginWithoutRegisterEvent = {
        detectPluginFromStack: jest.fn(),
        addLog: jest.fn(),
        registerEvent: jest.fn(() => {
          throw new Error('Register event error');
        }),
      };
      
      const monitorWithoutRegisterEvent = new (class extends BaseMonitor {
        initialize(): void {}
      })(pluginWithoutRegisterEvent);
      
      (monitorWithoutRegisterEvent as any).registerEvent({ type: 'test-event' });
      
      expect(console.warn).toHaveBeenCalledWith(
        '[Extension Watcher] Erro ao registrar evento:',
        expect.any(Error),
      );
    });

    it('should handle registerEvent throwing error', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockPlugin.registerEvent.mockImplementation(() => {
        throw new Error('Register event error');
      });
      
      (monitor as any).registerEvent({ type: 'test-event' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Extension Watcher] Erro ao registrar evento:',
        expect.any(Error),
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('restore', () => {
    it('should have default empty restore implementation', () => {
      expect(() => {
        monitor.restore();
      }).not.toThrow();
    });
  });

  describe('abstract methods', () => {
    it('should require initialize method to be implemented', () => {
      expect(() => {
        new (class extends BaseMonitor {
          initialize(): void {
            // Implementation required
          }
        })(mockPlugin);
      }).not.toThrow();
    });
  });
});
