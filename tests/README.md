# Testes Unitários - Extension Watcher

Este diretório contém todos os testes unitários para o projeto Extension Watcher, organizados seguindo a mesma estrutura do diretório `src/`.

## Estrutura de Testes

```
tests/
├── setup.ts                    # Configuração global dos testes
├── CommandManager.test.ts      # Testes para o gerenciador de comandos
├── ExtensionWatcherPlugin.test.ts # Testes para o plugin principal
├── index.test.ts               # Testes para o arquivo index principal
├── monitoring/                 # Testes para monitores
│   ├── BaseMonitor.test.ts
│   ├── FileMonitor.test.ts
│   ├── CommandMonitor.test.ts
│   ├── NetworkMonitor.test.ts
│   ├── MonitorManager.test.ts
│   └── index.test.ts
├── interpretation/             # Testes para interpretadores
│   ├── ActivityInterpreter.test.ts
│   ├── PluginDetector.test.ts
│   └── index.test.ts
├── ui/                         # Testes para componentes UI
│   ├── LogsModal.test.ts
│   ├── SettingsTab.test.ts
│   └── index.test.ts
├── utils/                      # Testes para utilitários
│   ├── constants.test.ts
│   ├── formatUtils.test.ts
│   ├── urlUtils.test.ts
│   ├── logFilters.test.ts
│   └── index.test.ts
└── types/                      # Testes para tipos
    └── index.test.ts
```

## Configuração

### Dependências de Teste

- **Jest**: Framework de testes principal
- **ts-jest**: Processador TypeScript para Jest
- **jest-environment-jsdom**: Ambiente DOM para testes de componentes UI
- **@types/jest**: Tipos TypeScript para Jest

### Configuração do Jest

O arquivo `jest.config.js` está configurado com:
- Preset TypeScript (`ts-jest`)
- Ambiente jsdom para testes de UI
- Cobertura de código habilitada
- Setup automático de mocks do Obsidian

### Setup Global

O arquivo `tests/setup.ts` configura:
- Mocks do Obsidian (Plugin, App, Notice, Modal, etc.)
- Mocks do console para evitar logs durante testes
- Mocks do Date para testes consistentes
- Mocks do DOM (localStorage, sessionStorage, matchMedia)

## Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## Padrões de Teste

### Nomenclatura
- Arquivos de teste: `*.test.ts`
- Descrições em inglês
- Estrutura: `describe` para agrupamento, `it` para casos individuais

### Mocks
- Mocks do Obsidian são configurados globalmente
- Mocks específicos são criados por arquivo quando necessário
- Uso de `jest.fn()` para funções mockadas

### Cobertura
- Testes cobrem casos de sucesso, erro e edge cases
- Foco em comportamento público das classes
- Testes de integração para fluxos principais

## Estrutura dos Testes

### Testes de Classe
```typescript
describe('ClassName', () => {
  let instance: ClassName;
  let mockDependency: any;

  beforeEach(() => {
    // Setup
  });

  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

### Testes de Função
```typescript
describe('functionName', () => {
  it('should return expected result for valid input', () => {
    // Test implementation
  });

  it('should handle edge cases', () => {
    // Test implementation
  });
});
```

## Cobertura de Testes

Os testes cobrem:
- ✅ Classes principais (ExtensionWatcherPlugin, CommandManager)
- ✅ Todos os monitores (BaseMonitor, FileMonitor, CommandMonitor, NetworkMonitor, etc.)
- ✅ Interpretadores (ActivityInterpreter, PluginDetector)
- ✅ Componentes UI (LogsModal, SettingsTab)
- ✅ Utilitários (constants, formatUtils, urlUtils, logFilters)
- ✅ Tipos e interfaces
- ✅ Arquivos de índice

## Manutenção

### Adicionando Novos Testes
1. Crie o arquivo de teste na pasta correspondente à estrutura do `src/`
2. Siga os padrões de nomenclatura e estrutura existentes
3. Adicione mocks necessários
4. Cubra casos de sucesso, erro e edge cases

### Atualizando Testes
- Mantenha os testes atualizados quando a funcionalidade mudar
- Adicione novos casos de teste para novas funcionalidades
- Remova testes obsoletos quando funcionalidades forem removidas

## Troubleshooting

### Problemas Comuns
1. **Mocks não funcionando**: Verifique se os mocks estão configurados corretamente no `setup.ts`
2. **Testes de DOM falhando**: Certifique-se de que o ambiente jsdom está configurado
3. **Cobertura baixa**: Adicione testes para métodos privados através de testes de comportamento público

### Debug
- Use `console.log` nos testes para debug (será suprimido automaticamente)
- Use `--verbose` flag para output detalhado
- Use `--detectOpenHandles` para detectar handles não fechados
