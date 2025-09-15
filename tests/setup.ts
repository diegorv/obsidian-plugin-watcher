// Setup global para os testes

// Mock do console para evitar logs durante os testes
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock do window para testes de DOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
(global as any).localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
(global as any).sessionStorage = sessionStorageMock;

// Mock de timer functions que podem estar faltando no ambiente de teste
(global as any).setInterval = jest.fn().mockImplementation((callback: Function, delay: number) => {
  return setTimeout(callback, delay);
});

(global as any).clearInterval = jest.fn().mockImplementation((id: any) => {
  clearTimeout(id);
});

// Garantir que clearInterval está disponível globalmente
if (typeof global.clearInterval === 'undefined') {
  global.clearInterval = jest.fn().mockImplementation((id: any) => {
    clearTimeout(id);
  });
}

// Garantir que clearInterval está disponível no window também
if (typeof (global as any).window !== 'undefined' && typeof (global as any).window.clearInterval === 'undefined') {
  (global as any).window.clearInterval = global.clearInterval;
}

// Mock do performance se não estiver disponível
if (typeof global.performance === 'undefined') {
  global.performance = {
    now: jest.fn().mockReturnValue(Date.now()),
  } as any;
}

// Mock do window.open para evitar erro do JSDOM
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn().mockImplementation((_url?: string, _target?: string, _features?: string) => {
    // Retorna um mock de window para simular uma nova janela
    return {
      document: {
        write: jest.fn(),
        close: jest.fn(),
      },
      close: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn(),
    };
  }),
});