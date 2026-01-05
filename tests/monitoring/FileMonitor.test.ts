import { FileMonitor } from '../../src/monitoring/FileMonitor';
import { App, TFile } from 'obsidian';

// Mock the App and TFile classes
jest.mock('obsidian', () => ({
  App: jest.fn(),
  TFile: jest.fn(),
}));

describe('FileMonitor', () => {
  let mockPlugin: any;
  let mockApp: App;
  let mockVault: any;
  let fileMonitor: FileMonitor;
  let mockFile: TFile;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFile = {
      path: '/test.md',
      name: 'test.md',
      extension: 'md',
      stat: {
        size: 1024,
        mtime: 1234567890,
        ctime: 1234567890,
      },
    } as any;

    mockVault = {
      read: jest.fn().mockResolvedValue('file content'),
      modify: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(mockFile),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockApp = {
      vault: mockVault,
    } as any;

    mockPlugin = {
      detectPluginFromStack: jest.fn().mockReturnValue('test-plugin'),
      addLog: jest.fn(),
    };

    fileMonitor = new FileMonitor(mockApp, mockPlugin);
  });

  describe('constructor', () => {
    it('should initialize with app and plugin', () => {
      expect(fileMonitor).toBeInstanceOf(FileMonitor);
    });
  });

  describe('initialize', () => {
    it('should call all monitoring methods', () => {
      const monitorVaultReadSpy = jest.spyOn(fileMonitor as any, 'monitorVaultRead');
      const monitorVaultModifySpy = jest.spyOn(fileMonitor as any, 'monitorVaultModify');
      const monitorVaultCreateSpy = jest.spyOn(fileMonitor as any, 'monitorVaultCreate');
      const monitorVaultDeleteSpy = jest.spyOn(fileMonitor as any, 'monitorVaultDelete');

      fileMonitor.initialize();

      expect(monitorVaultReadSpy).toHaveBeenCalled();
      expect(monitorVaultModifySpy).toHaveBeenCalled();
      expect(monitorVaultCreateSpy).toHaveBeenCalled();
      expect(monitorVaultDeleteSpy).toHaveBeenCalled();
    });
  });

  describe('monitorVaultRead', () => {
    beforeEach(() => {
      fileMonitor.initialize();
    });

    it('should intercept vault.read and log file access', async () => {
      await mockVault.read(mockFile);

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'file',
        plugin: 'test-plugin',
        action: 'read',
        details: {
          path: '/test.md',
          name: 'test.md',
          extension: 'md',
          size: 1024,
          mtime: 1234567890,
          ctime: 1234567890,
          contentLength: 12, // 'file content'.length
          readTime: expect.any(Number),
          isBinary: false,
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle binary files correctly', async () => {
      const binaryFile = {
        ...mockFile,
        extension: 'png',
      };

      await mockVault.read(binaryFile);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            isBinary: true,
          }),
        }),
      );
    });

    it('should handle missing vault.read method', () => {
      const appWithoutVaultRead = {
        vault: {},
      } as any;

      const monitorWithoutVaultRead = new FileMonitor(appWithoutVaultRead, mockPlugin);
      
      expect(() => {
        monitorWithoutVaultRead.initialize();
      }).not.toThrow();
    });
  });

  describe('monitorVaultModify', () => {
    beforeEach(() => {
      fileMonitor.initialize();
    });

    it('should intercept vault.modify and log file modification', async () => {
      const newContent = 'new file content';
      
      await mockVault.modify(mockFile, newContent);

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'file',
        plugin: 'test-plugin',
        action: 'modify',
        details: {
          path: '/test.md',
          name: 'test.md',
          extension: 'md',
          size: 1024,
          dataLength: newContent.length,
          previousLength: 12, // 'file content'.length
          contentDiff: newContent.length - 12,
          lineCount: 1,
          wordCount: 3,
          modifyTime: expect.any(Number),
          hasMarkdown: true,
          hasFrontmatter: false,
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle file with frontmatter', async () => {
      const contentWithFrontmatter = '---\ntitle: Test\n---\nContent here';
      
      await mockVault.modify(mockFile, contentWithFrontmatter);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            hasFrontmatter: true,
          }),
        }),
      );
    });

    it('should handle error when reading previous content', async () => {
      // Create a new mock that rejects
      const mockVaultWithError = {
        ...mockVault,
        read: jest.fn().mockRejectedValue(new Error('File not found')),
      };
      
      const appWithError = {
        ...mockApp,
        vault: mockVaultWithError,
      } as any;
      
      const fileMonitorWithError = new FileMonitor(appWithError, mockPlugin);
      fileMonitorWithError.initialize();
      
      await mockVaultWithError.modify(mockFile, 'new content');

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            previousLength: 0,
          }),
        }),
      );
    });

    it('should handle missing vault.modify method', () => {
      const appWithoutVaultModify = {
        vault: { read: jest.fn() },
      } as any;

      const monitorWithoutVaultModify = new FileMonitor(appWithoutVaultModify, mockPlugin);
      
      expect(() => {
        monitorWithoutVaultModify.initialize();
      }).not.toThrow();
    });
  });

  describe('monitorVaultCreate', () => {
    beforeEach(() => {
      fileMonitor.initialize();
    });

    it('should intercept vault.create and log file creation', async () => {
      const path = '/new-file.md';
      const content = 'new file content';
      
      await mockVault.create(path, content);

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'file',
        plugin: 'test-plugin',
        action: 'create',
        details: {
          path,
          fileName: 'new-file.md',
          extension: 'md',
          directory: '',
          dataLength: content.length,
          lineCount: 1,
          wordCount: 3,
          createTime: expect.any(Number),
          hasMarkdown: true,
          hasFrontmatter: false,
          isTemplate: false,
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle file in subdirectory', async () => {
      const path = '/notes/daily.md';
      const content = 'daily note content';
      
      await mockVault.create(path, content);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            directory: '/notes',
            fileName: 'daily.md',
          }),
        }),
      );
    });

    it('should handle template files', async () => {
      const path = '/template.md';
      const content = 'Template with {{date}} and {{title}}';
      
      await mockVault.create(path, content);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            isTemplate: true,
          }),
        }),
      );
    });

    it('should handle files without extension', async () => {
      const path = '/file-without-extension';
      const content = 'content';
      
      await mockVault.create(path, content);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            extension: '',
            hasMarkdown: false,
          }),
        }),
      );
    });

    it('should handle missing vault.create method', () => {
      const appWithoutVaultCreate = {
        vault: { read: jest.fn(), modify: jest.fn() },
      } as any;

      const monitorWithoutVaultCreate = new FileMonitor(appWithoutVaultCreate, mockPlugin);
      
      expect(() => {
        monitorWithoutVaultCreate.initialize();
      }).not.toThrow();
    });
  });

  describe('monitorVaultDelete', () => {
    beforeEach(() => {
      fileMonitor.initialize();
    });

    it('should intercept vault.delete and log file deletion', async () => {
      await mockVault.delete(mockFile);

      expect(mockPlugin.addLog).toHaveBeenCalledWith({
        type: 'file',
        plugin: 'test-plugin',
        action: 'delete',
        details: {
          path: '/test.md',
          name: 'test.md',
          extension: 'md',
          size: 1024,
          mtime: 1234567890,
          ctime: 1234567890,
          isBinary: false,
          deleteTime: expect.any(Number),
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle binary file deletion', async () => {
      const binaryFile = {
        ...mockFile,
        extension: 'jpg',
      };

      await mockVault.delete(binaryFile);

      expect(mockPlugin.addLog).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.objectContaining({
            isBinary: true,
          }),
        }),
      );
    });

    it('should handle missing vault.delete method', () => {
      const appWithoutVaultDelete = {
        vault: { read: jest.fn(), modify: jest.fn(), create: jest.fn() },
      } as any;

      const monitorWithoutVaultDelete = new FileMonitor(appWithoutVaultDelete, mockPlugin);
      
      expect(() => {
        monitorWithoutVaultDelete.initialize();
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle missing app', () => {
      const monitorWithoutApp = new FileMonitor(null as any, mockPlugin);
      
      expect(() => {
        monitorWithoutApp.initialize();
      }).not.toThrow();
    });

    it('should handle missing vault', () => {
      const appWithoutVault = {} as any;
      const monitorWithoutVault = new FileMonitor(appWithoutVault, mockPlugin);
      
      expect(() => {
        monitorWithoutVault.initialize();
      }).not.toThrow();
    });
  });
});
