/**
 * Utilitários para parsing e formatação de URLs
 */

export interface ParsedUrl {
	domain: string;
	pathname: string;
	search: string;
	fullPath: string;
}

/**
 * Parse uma URL e retorna componentes estruturados
 */
export function parseUrl(url: string): ParsedUrl | null {
  try {
    const urlObj = new URL(url);
    return {
      domain: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      fullPath: `${urlObj.hostname}${urlObj.pathname}${urlObj.search}`,
    };
  } catch {
    return null;
  }
}

/**
 * Formata uma URL para exibição amigável
 */
export function formatUrlForDisplay(url: string): string {
  const parsed = parseUrl(url);
  if (parsed) {
    return parsed.fullPath;
  }
  return url;
}

/**
 * Formata uma URL para contexto de rede
 */
export function formatNetworkContext(url: string): string {
  const parsed = parseUrl(url);
  if (parsed) {
    return `🌐 ${parsed.fullPath}`;
  }
  return `🌐 ${url}`;
}
