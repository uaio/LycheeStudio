import { invoke } from '@tauri-apps/api/core';

// AI 配置相关命令
export const readConfig = (tool: string) => invoke<string>('read_config', { tool });
export const writeConfig = (tool: string, config: string) => invoke<string>('write_config', { tool, config });

// Node.js 管理相关命令
export const getNodeVersions = () => invoke<string[]>('get_node_versions');
export const installNodeVersion = (version: string) => invoke<string>('install_node_version', { version });
export const switchNodeVersion = (version: string) => invoke<string>('switch_node_version', { version });

// NPM 管理相关命令
export const getNpmPackages = () => invoke<string[]>('get_npm_packages');
export const installNpmPackage = (package_name: string, global: boolean) => invoke<string>('install_npm_package', { package: package_name, global });
export const setNpmRegistry = (registry: string) => invoke<string>('set_npm_registry', { registry });

// 通用命令
export const greet = (name: string) => invoke<string>('greet', { name });