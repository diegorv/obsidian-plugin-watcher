import { NodeFsMonitor } from '../../src/monitoring/NodeFsMonitor';

describe('NodeFsMonitor', () => {
  let mockPlugin: any;
  let nodeFsMonitor: NodeFsMonitor;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    nodeFsMonitor = new NodeFsMonitor(mockPlugin);
  });

  afterEach(() => {
    nodeFsMonitor.restore();
  });

  describe('constructor', () => {
    it('should initialize with plugin', () => {
      expect(nodeFsMonitor).toBeInstanceOf(NodeFsMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorReadFileSyncSpy = jest.spyOn(nodeFsMonitor as any, 'monitorReadFileSync');
      const monitorReadFileSpy = jest.spyOn(nodeFsMonitor as any, 'monitorReadFile');
      const monitorWriteFileSyncSpy = jest.spyOn(nodeFsMonitor as any, 'monitorWriteFileSync');
      const monitorWriteFileSpy = jest.spyOn(nodeFsMonitor as any, 'monitorWriteFile');
      const monitorExistsSyncSpy = jest.spyOn(nodeFsMonitor as any, 'monitorExistsSync');
      const monitorStatSyncSpy = jest.spyOn(nodeFsMonitor as any, 'monitorStatSync');
      const monitorReaddirSyncSpy = jest.spyOn(nodeFsMonitor as any, 'monitorReaddirSync');
      const monitorReaddirSpy = jest.spyOn(nodeFsMonitor as any, 'monitorReaddir');

      nodeFsMonitor.initialize();

      expect(monitorReadFileSyncSpy).toHaveBeenCalled();
      expect(monitorReadFileSpy).toHaveBeenCalled();
      expect(monitorWriteFileSyncSpy).toHaveBeenCalled();
      expect(monitorWriteFileSpy).toHaveBeenCalled();
      expect(monitorExistsSyncSpy).toHaveBeenCalled();
      expect(monitorStatSyncSpy).toHaveBeenCalled();
      expect(monitorReaddirSyncSpy).toHaveBeenCalled();
      expect(monitorReaddirSpy).toHaveBeenCalled();
    });
  });

  describe('isSensitivePath', () => {
    beforeEach(() => {
      nodeFsMonitor.initialize();
    });

    it('should detect SSH paths as sensitive', () => {
      const isSensitive = (nodeFsMonitor as any).isSensitivePath('/home/user/.ssh/id_rsa');
      expect(isSensitive).toBe(true);
    });

    it('should detect AWS credentials as sensitive', () => {
      const isSensitive = (nodeFsMonitor as any).isSensitivePath('/home/user/.aws/credentials');
      expect(isSensitive).toBe(true);
    });

    it('should detect gitconfig as sensitive', () => {
      const isSensitive = (nodeFsMonitor as any).isSensitivePath('/home/user/.gitconfig');
      expect(isSensitive).toBe(true);
    });

    it('should detect .env files as sensitive', () => {
      const isSensitive = (nodeFsMonitor as any).isSensitivePath('/project/.env');
      expect(isSensitive).toBe(true);
    });

    it('should not flag regular paths as sensitive', () => {
      const isSensitive = (nodeFsMonitor as any).isSensitivePath('/home/user/documents/file.txt');
      expect(isSensitive).toBe(false);
    });
  });

  describe('restore', () => {
    it('should restore without errors', () => {
      nodeFsMonitor.initialize();
      expect(() => nodeFsMonitor.restore()).not.toThrow();
    });

    it('should be safe to call restore multiple times', () => {
      nodeFsMonitor.initialize();
      expect(() => {
        nodeFsMonitor.restore();
        nodeFsMonitor.restore();
      }).not.toThrow();
    });
  });
});
