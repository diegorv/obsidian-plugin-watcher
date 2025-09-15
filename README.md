# Extension Watcher - Obsidian Plugin

A comprehensive monitoring plugin for Obsidian that tracks extension activities, providing detailed insights into file access, command execution, network calls, and more.

## Overview

Extension Watcher is a powerful debugging and security tool that helps you understand what your Obsidian plugins are doing behind the scenes. It provides real-time monitoring of various activities and generates human-readable logs to help you identify potential issues or understand plugin behavior.

## Features

### 🔍 **Comprehensive Monitoring**
- **File Operations**: Track file reads, writes, creates, and deletes
- **Network Activity**: Monitor HTTP/HTTPS requests, WebSocket connections, and Web Workers
- **Command Execution**: Track plugin commands and window.open calls
- **Advanced APIs**: Monitor EventSource, WebSocket, and other modern web APIs
- **Canvas Operations**: Track Canvas file creation and access
- **Editor Events**: Monitor editor changes and interactions
- **Settings Changes**: Track configuration modifications
- **Keyboard Events**: Monitor keymap interactions
- **Modal Operations**: Track modal openings and interactions
- **Metadata Access**: Monitor frontmatter and metadata operations
- **Workspace Changes**: Track workspace modifications

### 🎯 **Smart Detection**
- **Plugin Identification**: Automatically detects which plugin is performing each action
- **Activity Interpretation**: Converts technical logs into human-readable descriptions
- **Stack Trace Analysis**: Uses call stack analysis to identify plugin sources

### 🛠️ **User Interface**
- **Real-time Logs Modal**: View and filter activity logs
- **Configurable Settings**: Enable/disable specific monitoring features
- **Debug Mode**: Aggressive monitoring for detailed debugging
- **Ribbon Icon**: Quick access to logs from the ribbon

### ⚙️ **Configuration Options**
- Toggle individual monitoring features
- Control notification display
- Set maximum log entries
- Enable/disable console logging
- Exclude self-logs option
- Debug mode toggle

## Installation

1. Download the latest release from the [releases page](https://github.com/diegorv/obsidian-plugin-watcher/releases)
2. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/obsidian-extension-watcher/` folder
3. Enable the plugin in Obsidian's Community Plugins settings

## Usage

### Basic Usage

1. **Enable the Plugin**: Go to Settings → Community Plugins → Extension Watcher
2. **Configure Monitoring**: Access the plugin settings to enable/disable specific monitoring features
3. **View Logs**: Click the eye icon in the ribbon or use the command palette to open the logs modal

### Commands

- **Open Extension Watcher Logs**: Opens the logs modal to view all tracked activities
- **Toggle Debug Mode**: Temporarily enables aggressive debugging mode for Smart Composer

### Settings

Configure the plugin through Settings → Community Plugins → Extension Watcher:

- **Monitor File Access**: Track file operations (read, write, create, delete)
- **Monitor Commands**: Track command execution
- **Monitor Network Calls**: Track HTTP/HTTPS requests
- **Show Notifications**: Display real-time activity notifications
- **Log to Console**: Output logs to browser console
- **Max Log Entries**: Limit the number of stored log entries
- **Exclude Self Logs**: Filter out logs from the Extension Watcher plugin itself
- **Debug Mode**: Enable aggressive monitoring for debugging

## Architecture

The plugin is built with a modular architecture for maintainability and extensibility:

```
src/
├── types/                    # TypeScript type definitions
├── monitoring/              # Monitoring modules
│   ├── BaseMonitor.ts       # Base monitoring class
│   ├── NetworkMonitor.ts    # Network activity monitoring
│   ├── FileMonitor.ts       # File operations monitoring
│   ├── CommandMonitor.ts    # Command execution monitoring
│   ├── AdvancedAPIMonitor.ts # Modern web APIs monitoring
│   ├── DebugMonitor.ts      # Aggressive debugging
│   ├── WorkspaceMonitor.ts  # Workspace changes
│   ├── MetadataMonitor.ts   # Metadata operations
│   ├── KeymapMonitor.ts     # Keyboard events
│   ├── ModalMonitor.ts      # Modal operations
│   ├── EditorMonitor.ts     # Editor interactions
│   ├── CanvasMonitor.ts     # Canvas operations
│   ├── SettingsMonitor.ts   # Settings changes
│   └── MonitorManager.ts    # Orchestrates all monitors
├── interpretation/          # Activity interpretation
│   ├── ActivityInterpreter.ts # Converts logs to readable text
│   └── PluginDetector.ts    # Identifies plugin sources
├── ui/                      # User interface components
│   ├── LogsModal.ts         # Logs viewing modal
│   └── SettingsTab.ts       # Settings configuration
├── utils/                   # Utility functions
├── ExtensionWatcherPlugin.ts # Main plugin class
└── CommandManager.ts        # Command registration
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- TypeScript knowledge

### Setup

```bash
# Clone the repository
git clone https://github.com/diegorv/obsidian-plugin-watcher.git
cd obsidian-extension-watcher

# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Scripts

- `npm run dev` - Start development build with watch mode
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security & Privacy

- Extension Watcher only monitors activities within your Obsidian vault
- No data is sent to external servers
- All logs are stored locally
- You can exclude the plugin's own activities from logging

## Troubleshooting

### Common Issues

1. **Plugin not loading**: Ensure all files are in the correct directory structure
2. **No logs appearing**: Check that monitoring features are enabled in settings
3. **Performance issues**: Disable unnecessary monitoring features or reduce max log entries

### Debug Mode

Enable debug mode for detailed troubleshooting:
1. Use the "Toggle Debug Mode" command
2. Or enable it in plugin settings
3. This will provide more verbose logging for debugging

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Diego RV**

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/diegorv/obsidian-plugin-watcher/issues) page
2. Create a new issue with detailed information
3. Include your Obsidian version and plugin version

---

**Note**: This plugin is designed for debugging and security analysis. Use responsibly and be aware that extensive monitoring may impact performance.