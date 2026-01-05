import * as interpretation from '../../src/interpretation';

describe('interpretation index exports', () => {
  it('should export ActivityInterpreter', () => {
    expect(interpretation.ActivityInterpreter).toBeDefined();
    expect(typeof interpretation.ActivityInterpreter).toBe('function');
  });

  it('should export PluginDetector', () => {
    expect(interpretation.PluginDetector).toBeDefined();
    expect(typeof interpretation.PluginDetector).toBe('function');
  });

  it('should allow instantiation of ActivityInterpreter', () => {
    const interpreter = new interpretation.ActivityInterpreter();
    expect(interpreter).toBeInstanceOf(interpretation.ActivityInterpreter);
  });

  it('should allow instantiation of PluginDetector', () => {
    const detector = new interpretation.PluginDetector({ debugMode: false });
    expect(detector).toBeInstanceOf(interpretation.PluginDetector);
  });

  it('should have all expected exports', () => {
    const exports = Object.keys(interpretation);
    expect(exports).toContain('ActivityInterpreter');
    expect(exports).toContain('PluginDetector');
    expect(exports).toHaveLength(2);
  });
});
