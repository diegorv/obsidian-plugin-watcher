import { ActivityInterpretation } from '../types';
import { 
  parseUrl, 
  formatNetworkContext, 
  getActionText, 
  getFileTypeFromExtension, 
  formatGroupedRequest,
  getFileTypeEmoji,
  formatFileContext,
  ACTIVITY_EMOJIS, 
} from '../utils';

export class ActivityInterpreter {
  interpretActivity(
    type: string, 
    plugin: string, 
    action: string, 
    details: Record<string, unknown>,
  ): ActivityInterpretation {
    let interpretation = '';
    let context = '';

    switch (type) {
    case 'network':
      interpretation = this.interpretNetworkActivity(plugin, details);
      context = formatNetworkContext(details['url'] as string);
      break;
			
    case 'file':
      interpretation = this.interpretFileActivity(plugin, action, details);
      context = formatFileContext(details['path'] as string);
      break;
			
    case 'command':
      interpretation = this.interpretCommandActivity(plugin, action, details);
      context = `Comando: ${(details['commandId'] as string) || (details['url'] as string) || 'N/A'}`;
      break;
			
    default:
      interpretation = `${plugin} executou ${action}`;
      context = 'Atividade genérica';
    }

    return { interpretation, context };
  }

  private interpretNetworkActivity(plugin: string, details: Record<string, unknown>): string {
    const url = details['url'] as string;
    const method = (details['method'] as string) || 'GET';
    const isGrouped = details['grouped'] as boolean;
    const repeatCount = details['repeatCount'] as number;
    const timeSpan = details['timeSpan'] as number;

    const parsed = parseUrl(url);
    let result = `${ACTIVITY_EMOJIS.network} ${plugin} - ${method} `;
		
    if (parsed) {
      result += parsed.fullPath;
    } else {
      result += url;
    }
		
    // Se for uma requisição agrupada, mostrar informações de agrupamento
    if (isGrouped && repeatCount && timeSpan) {
      result += formatGroupedRequest(repeatCount, timeSpan);
    }
		
    return result;
  }

  private interpretFileActivity(
    plugin: string,
    action: string,
    details: Record<string, unknown>,
  ): string {
    const path = details['path'] as string;
    const actionText = getActionText(action);
		
    // Detectar tipo de arquivo baseado na extensão e contexto
    if (path.includes('.obsidian/')) {
      return `${ACTIVITY_EMOJIS.config} ${plugin} está ${actionText} configurações do Obsidian`;
    } else if (path.includes('template')) {
      return `${ACTIVITY_EMOJIS.template} ${plugin} está ${actionText} um template`;
    } else {
      const fileType = getFileTypeFromExtension(path);
      const emoji = getFileTypeEmoji(path);
      return `${emoji} ${plugin} está ${actionText} ${fileType}`;
    }
  }


  private interpretCommandActivity(plugin: string, action: string, details: Record<string, unknown>): string {
    const commandId = details['commandId'] as string;
		
    // Interpretação baseada no tipo de ação
    if (commandId) {
      return `⚡ ${plugin} executou comando: ${commandId}`;
    }
		
    if (details['url']) {
      return `🔗 ${plugin} abrindo URL externa: ${details['url'] as string}`;
    }
		
    // Interpretar ações específicas baseadas no tipo
    switch (action) {
    case 'web-worker':
      return `🔧 ${plugin} criando Web Worker`;
    case 'event-source':
      return `📡 ${plugin} estabelecendo Server-Sent Events`;
    case 'websocket':
      return `🔌 ${plugin} conectando via WebSocket`;
    case 'set-timeout':
      return `⏰ ${plugin} agendando tarefa`;
    case 'append-element':
      return `🎨 ${plugin} injetando elemento DOM`;
    case 'promise-all':
      return `🔄 ${plugin} executando operações assíncronas`;
    default:
      return `⚡ ${plugin} executou ação: ${action}`;
    }
  }



}
