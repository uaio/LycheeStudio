# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LycheeStudio is an AI tools management desktop application built with Electron + React + TypeScript. It provides a unified interface for managing AI CLI tools, Node.js versions, NPM packages, and development environments.

## Key Development Commands

### Development Workflow
```bash
# Start React development server
npm start

# Start Electron in development mode (recommended)
npm run electron-dev

# Alternative Electron startup methods
npm run electron-dev-fixed    # Uses fixed delay
npm run electron-dev-auto     # With timeout

# Clean start (kill processes then start)
npm run clean-start
```

### Building and Distribution
```bash
# Build React app for production
npm run build

# Package Electron app for all platforms
npm run dist

# Platform-specific builds
npm run dist:mac      # macOS
npm run dist:win      # Windows
npm run dist:linux    # Linux

# Build and package in one step
npm run preelectron-pack && npm run electron-pack
```

### Process Management
```bash
# Kill all Electron and related processes
npm run kill

# Manually clean processes if needed
pkill -f "Electron"
pkill -f "npm run electron"
```

## Architecture Overview

### Electron Structure
- **Main Process**: `public/electron.js` - Creates and manages BrowserWindow
- **Preload Script**: `public/preload.js` - Handles secure IPC communication
- **Security**: Content Security Policy configured, context isolation enabled

### React Application Structure
- **Main App**: `src/App.tsx` - Central routing and state management
- **Context**: `src/contexts/AppContext.tsx` - Global app state (theme, language)
- **Components**: Modular UI components in `src/components/`
- **Services**: Business logic in `src/services/`
- **Hooks**: Custom React hooks in `src/hooks/`
- **Types**: TypeScript definitions in `src/types/`

### Key Functional Areas

1. **Tool Management** (`src/App.tsx:241-325`)
   - Status cards for Homebrew, FNM, Node.js, NPM, AI tools
   - Real-time detection and installation
   - Dependency-aware installation logic

2. **Installation Service** (`src/services/installationService.ts`)
   - Tool detection and installation logic
   - Progress tracking and callbacks
   - Error handling and abort controllers

3. **Electron Integration** (`src/lib/electron-commands.ts`)
   - Command execution bridge
   - File system operations
   - External process management

### Component Hierarchy
```
App
├── ElectronTitleBar (custom window controls)
├── Sidebar (navigation menu)
├── Dashboard (home status cards)
├── NodeManager (Node.js version management)
├── NPMManager (NPM source configuration)
├── PackageManager (global packages)
├── ClaudeCodeManager (Claude CLI tools)
└── ClaudeProviderManager (provider configurations)
```

## Important Patterns

### State Management
- Uses React Context for global state (theme, language)
- Local state for component-specific data
- Custom hooks for complex stateful logic

### IPC Communication
- All Electron APIs exposed through `window.electronAPI`
- Type-safe interfaces in `src/types/electron.d.ts`
- Async/await pattern for all Electron operations

### Tool Detection
- Tools are detected via shell commands through Electron main process
- Status mapping: `active` (installed) | `warning` (installable) | `error` (issues)
- Dependency chain: Homebrew → FNM → Node.js → AI tools

### Error Handling
- Try/catch blocks around all Electron API calls
- Graceful degradation when APIs unavailable
- User-friendly error messages with fallback states

## Development Guidelines

### Adding New AI Tools
1. Update `TOOLS_INFO` in `src/types/installation.ts`
2. Add tool card to `initialStatusCards` in `src/App.tsx:242-325`
3. Update installation service logic
4. Add provider management if needed

### Theme Support
- Three modes: `light`, `dark`, `system`
- CSS custom properties for consistent theming
- Ant Design theme configuration in `App.tsx:2020-2025`

### Internationalization
- Language files: `src/locales/zh.ts`, `src/locales/en.ts`
- Type-safe translations via context
- Language preference persisted in localStorage

## Testing Notes
- Uses Create React App testing setup with Jest
- Component testing with React Testing Library
- Electron integration testing requires full app startup

## Build Configuration
- Electron Builder for packaging (`package.json:67-114`)
- Platform-specific settings and targets
- Code signing not configured (development build)

## Common Issues
- **Port conflicts**: Use `npm run kill` to clean processes
- **Hot reload**: React dev server works independently of Electron
- **CSP errors**: Development mode allows unsafe-eval, production doesn't
- **Electron API not found**: Ensure preload script is loaded properly