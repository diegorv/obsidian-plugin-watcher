export interface ExtensionWatcherSettings {
	monitorFileAccess: boolean;
	monitorCommands: boolean;
	monitorNetworkCalls: boolean;
	showNotifications: boolean;
	logToConsole: boolean;
	maxLogEntries: number;
	excludeSelfLogs: boolean;
	debugMode: boolean;
}

export interface LogEntry {
	timestamp: Date;
	type: 'file' | 'command' | 'network' | 'workspace' | 'metadata' | 'keymap' | 'modal' | 'editor' | 'canvas' | 'settings' | 'performance';
	plugin: string;
	action: string;
	details: Record<string, unknown>;
	interpretation?: string;
	context?: string;
}

export interface ActivityInterpretation {
	interpretation: string;
	context: string;
}

export const DEFAULT_SETTINGS: ExtensionWatcherSettings = {
  monitorFileAccess: true,
  monitorCommands: true,
  monitorNetworkCalls: true,
  showNotifications: false,
  logToConsole: true,
  maxLogEntries: 1000,
  excludeSelfLogs: true,
  debugMode: false,
};
