# Extension Watcher - Estrutura Modular

Este projeto foi reorganizado em uma estrutura modular para melhor manutenibilidade e organização do código.

## Estrutura de Pastas

```
src/
├── types/                    # Tipos e interfaces TypeScript
│   └── index.ts             # Definições de tipos principais
├── monitoring/              # Módulos de monitoramento
│   ├── NetworkMonitor.ts    # Monitoramento de chamadas de rede
│   ├── FileMonitor.ts       # Monitoramento de acesso a arquivos
│   ├── CommandMonitor.ts    # Monitoramento de comandos
│   ├── AdvancedAPIMonitor.ts # Monitoramento de APIs avançadas
│   ├── DebugMonitor.ts      # Monitoramento de debug agressivo
│   └── index.ts             # Exportações dos monitores
├── interpretation/          # Lógica de interpretação
│   ├── ActivityInterpreter.ts # Interpretação de atividades
│   ├── PluginDetector.ts    # Detecção de plugins
│   └── index.ts             # Exportações dos interpretadores
├── ui/                      # Componentes de interface
│   ├── LogsModal.ts         # Modal de visualização de logs
│   ├── SettingsTab.ts       # Aba de configurações
│   └── index.ts             # Exportações dos componentes UI
├── ExtensionWatcherPlugin.ts # Classe principal do plugin
└── index.ts                 # Exportações principais
```

## Componentes Principais

### 1. Types (`src/types/`)
- `ExtensionWatcherSettings`: Interface das configurações do plugin
- `LogEntry`: Interface para entradas de log
- `ActivityInterpretation`: Interface para interpretações de atividade
- `DEFAULT_SETTINGS`: Configurações padrão

### 2. Monitoring (`src/monitoring/`)
- **NetworkMonitor**: Intercepta fetch, XMLHttpRequest, sendBeacon
- **FileMonitor**: Intercepta operações do vault (read, modify, create, delete)
- **CommandMonitor**: Intercepta execução de comandos e window.open
- **AdvancedAPIMonitor**: Intercepta Web Workers, EventSource, WebSocket
- **DebugMonitor**: Monitoramento agressivo para debugging

### 3. Interpretation (`src/interpretation/`)
- **ActivityInterpreter**: Interpreta atividades e gera descrições legíveis
- **PluginDetector**: Detecta qual plugin está executando uma ação

### 4. UI (`src/ui/`)
- **LogsModal**: Modal para visualizar logs com filtros
- **SettingsTab**: Aba de configurações do plugin

### 5. ExtensionWatcherPlugin
Classe principal que orquestra todos os componentes:
- Inicializa monitores baseado nas configurações
- Gerencia logs e interpretações
- Fornece interface pública para os monitores

## Benefícios da Nova Estrutura

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade específica
2. **Manutenibilidade**: Código mais fácil de manter e debugar
3. **Testabilidade**: Componentes isolados são mais fáceis de testar
4. **Reutilização**: Componentes podem ser reutilizados em outros contextos
5. **Legibilidade**: Código mais organizado e fácil de entender

## Como Usar

O arquivo `main.ts` agora simplesmente exporta a classe principal:

```typescript
import { ExtensionWatcherPlugin } from './src/ExtensionWatcherPlugin';
export default ExtensionWatcherPlugin;
```

Todos os componentes são automaticamente inicializados quando o plugin é carregado.
