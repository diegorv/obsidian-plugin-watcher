// Mock do módulo Obsidian para testes
export class Plugin {
  app: any;
  settings: any;
  logs: any[] = [];
  
  constructor(app: any, _manifest?: any) {
    this.app = app;
  }
  
  async loadData() {
    return {};
  }
  
  async saveData(_data: any) {
    return;
  }
  
  addCommand(_command: any) {
    return;
  }
  
  addRibbonIcon(_icon: string, _title: string, _callback: (evt: MouseEvent) => void) {
    return;
  }
  
  addSettingTab(_tab: any) {
    return;
  }

  registerEvent(_eventRef: any) {
    return;
  }
}

export class Notice {
  message: string;
  
  constructor(message: string) {
    this.message = message;
  }
}

export class Modal {
  app: any;
  contentEl: any = {
    empty: jest.fn(),
    createEl: jest.fn().mockReturnValue({
      style: {},
      createEl: jest.fn().mockReturnValue({
        style: {},
        addEventListener: jest.fn(),
        setAttribute: jest.fn(),
      }),
      addEventListener: jest.fn(),
      setAttribute: jest.fn(),
    }),
    createDiv: jest.fn().mockReturnValue({
      style: {},
      createEl: jest.fn().mockReturnValue({
        style: {},
        addEventListener: jest.fn(),
        setAttribute: jest.fn(),
      }),
      addEventListener: jest.fn(),
      setAttribute: jest.fn(),
    }),
  };
  
  constructor(app: any) {
    this.app = app;
  }
  
  open() {
    return;
  }
  
  close() {
    return;
  }
}

export class Setting {
  constructor(_containerEl: HTMLElement) {}
  
  setName(_name: string) {
    return this;
  }
  
  setDesc(_desc: string) {
    return this;
  }
  
  addToggle(_callback: any) {
    return this;
  }
  
  addText(_callback: any) {
    return this;
  }
}

export class PluginSettingTab {
  app: any;
  plugin: any;
  containerEl: any = {
    empty: jest.fn(),
    createEl: jest.fn(),
  };
  
  constructor(app: any, plugin: any) {
    this.app = app;
    this.plugin = plugin;
  }
  
  display() {
    return;
  }
}

export class App {
  workspace: any;
  vault: any;
  metadataCache: any;
  plugins: any;
  
  constructor() {
    this.workspace = {
      getActiveFile: () => null,
      getActiveViewOfType: () => null,
      executeCommandById: jest.fn(),
      activeLeaf: null,
      on: () => {},
      off: () => {},
      trigger: () => {},
    };
    
    this.vault = {
      getAbstractFileByPath: () => null,
      read: jest.fn().mockResolvedValue(''),
      modify: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      write: () => Promise.resolve(),
      on: () => {},
      off: () => {},
    };
    
    this.metadataCache = {
      getFileCache: () => null,
      on: () => {},
      off: () => {},
    };
    
    this.plugins = {
      plugins: {},
      on: () => {},
      off: () => {},
    };
  }
}

export class TFile {
  path: string;
  name: string;
  extension: string;
  stat: {
    size: number;
    mtime: number;
    ctime: number;
  };
  
  constructor(path: string) {
    this.path = path;
    this.name = path.split('/').pop() || '';
    this.extension = this.name.split('.').pop() || '';
    this.stat = {
      size: 1024,
      mtime: Date.now(),
      ctime: Date.now(),
    };
  }
}
