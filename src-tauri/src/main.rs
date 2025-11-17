// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[cfg(target_os = "macos")]
use cocoa::base::id;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg(target_os = "macos")]
fn setup_macos_titlebar(window: &tauri::WebviewWindow, height: f64) {
    use cocoa::appkit::{NSWindowTitleVisibility, NSWindowButton};
    use cocoa::base::{id, nil, YES};
    use cocoa::foundation::NSRect;
    use objc::{msg_send, sel, sel_impl};

    unsafe {
        if let Ok(ns_window_ptr) = window.ns_window() {
            let ns_window = ns_window_ptr as id;

            // 1. 设置窗口为全尺寸内容视图
            let current_style: u64 = msg_send![ns_window, styleMask];
            let new_style = current_style | 0x00010000; // NSFullSizeContentViewWindowMask
            let _: () = msg_send![ns_window, setStyleMask_: new_style];

            // 2. 设置标题栏透明
            let _: () = msg_send![ns_window, setTitlebarAppearsTransparent_: YES];

            // 3. 隐藏标题文本
            let _: () = msg_send![ns_window, setTitleVisibility_: NSWindowTitleVisibility::NSWindowTitleHidden];

            // 4. 调整红绿灯按钮垂直位置
            position_traffic_lights(ns_window, height);
        }
    }
}

#[cfg(target_os = "macos")]
unsafe fn position_traffic_lights(ns_window: id, titlebar_height: f64) {
    use cocoa::appkit::NSWindowButton;
    use cocoa::base::{id, nil};
    use cocoa::foundation::NSRect;
    use objc::{msg_send, sel, sel_impl};

    // 计算红绿灯按钮的垂直位置 (标题栏中心位置)
    let vertical_offset = (titlebar_height - 12.0) / 2.0; // 12 是按钮直径

    let close_button: id = msg_send![ns_window, standardWindowButton: NSWindowButton::NSWindowCloseButton];
    let miniaturize_button: id = msg_send![ns_window, standardWindowButton: NSWindowButton::NSWindowMiniaturizeButton];
    let zoom_button: id = msg_send![ns_window, standardWindowButton: NSWindowButton::NSWindowZoomButton];

    if close_button != nil {
        let mut frame: NSRect = msg_send![close_button, frame];
        frame.origin.y = vertical_offset;
        frame.origin.x = 13.0;
        let _: () = msg_send![close_button, setFrame: frame];
    }

    if miniaturize_button != nil {
        let mut frame: NSRect = msg_send![miniaturize_button, frame];
        frame.origin.y = vertical_offset;
        frame.origin.x = 33.0;
        let _: () = msg_send![miniaturize_button, setFrame: frame];
    }

    if zoom_button != nil {
        let mut frame: NSRect = msg_send![zoom_button, frame];
        frame.origin.y = vertical_offset;
        frame.origin.x = 53.0;
        let _: () = msg_send![zoom_button, setFrame: frame];
    }
}

#[tauri::command]
async fn read_config(tool: String) -> Result<String, String> {
    // 读取指定工具的配置文件
    match tool.as_str() {
        "claude" => {
            let home_dir = dirs::home_dir().unwrap_or_default();
            let config_path = home_dir.join(".config").join("claude").join("settings.json");
            match std::fs::read_to_string(config_path) {
                Ok(content) => Ok(content),
                Err(_) => Err("配置文件不存在".to_string()),
            }
        }
        "openai" => {
            let home_dir = dirs::home_dir().unwrap_or_default();
            let config_path = home_dir.join(".config").join("openai").join("config.json");
            match std::fs::read_to_string(config_path) {
                Ok(content) => Ok(content),
                Err(_) => Err("配置文件不存在".to_string()),
            }
        }
        "gemini" => {
            let home_dir = dirs::home_dir().unwrap_or_default();
            let config_path = home_dir.join(".config").join("gemini-cli").join("config.json");
            match std::fs::read_to_string(config_path) {
                Ok(content) => Ok(content),
                Err(_) => Err("配置文件不存在".to_string()),
            }
        }
        _ => Err("不支持的工具".to_string()),
    }
}

#[tauri::command]
async fn write_config(tool: String, config: String) -> Result<String, String> {
    // 写入指定工具的配置文件
    match tool.as_str() {
        "claude" => {
            let home_dir = dirs::home_dir().unwrap_or_default();
            let config_dir = home_dir.join(".config").join("claude");
            let config_path = config_dir.join("settings.json");

            // 创建目录（如果不存在）
            std::fs::create_dir_all(config_dir).map_err(|e| e.to_string())?;

            // 写入配置文件
            std::fs::write(config_path, config).map_err(|e| e.to_string())?;
            Ok("配置已保存".to_string())
        }
        "openai" => {
            let home_dir = dirs::home_dir().unwrap_or_default();
            let config_dir = home_dir.join(".config").join("openai");
            let config_path = config_dir.join("config.json");

            std::fs::create_dir_all(config_dir).map_err(|e| e.to_string())?;
            std::fs::write(config_path, config).map_err(|e| e.to_string())?;
            Ok("配置已保存".to_string())
        }
        "gemini" => {
            let home_dir = dirs::home_dir().unwrap_or_default();
            let config_dir = home_dir.join(".config").join("gemini-cli");
            let config_path = config_dir.join("config.json");

            std::fs::create_dir_all(config_dir).map_err(|e| e.to_string())?;
            std::fs::write(config_path, config).map_err(|e| e.to_string())?;
            Ok("配置已保存".to_string())
        }
        _ => Err("不支持的工具".to_string()),
    }
}

#[tauri::command]
async fn get_node_versions() -> Result<Vec<String>, String> {
    // 获取已安装的Node.js版本
    let output = tokio::process::Command::new("nvm")
        .arg("ls")
        .output()
        .await;

    match output {
        Ok(result) => {
            let versions = String::from_utf8_lossy(&result.stdout)
                .lines()
                .filter(|line| line.trim().starts_with("v") || line.contains("->"))
                .map(|line| line.trim().to_string())
                .collect();
            Ok(versions)
        }
        Err(_) => {
            // 如果nvm不可用，尝试直接获取当前版本
            match tokio::process::Command::new("node").arg("--version").output().await {
                Ok(result) => {
                    let version = String::from_utf8_lossy(&result.stdout).trim().to_string();
                    Ok(vec![version])
                }
                Err(_) => Err("无法获取Node.js版本信息".to_string()),
            }
        }
    }
}

#[tauri::command]
async fn install_node_version(version: String) -> Result<String, String> {
    let output = tokio::process::Command::new("nvm")
        .arg("install")
        .arg(&version)
        .output()
        .await;

    match output {
        Ok(_) => Ok(format!("Node.js {} 安装完成", version)),
        Err(e) => Err(format!("安装失败: {}", e)),
    }
}

#[tauri::command]
async fn switch_node_version(version: String) -> Result<String, String> {
    let output = tokio::process::Command::new("nvm")
        .arg("use")
        .arg(&version)
        .output()
        .await;

    match output {
        Ok(_) => Ok(format!("已切换到 Node.js {}", version)),
        Err(e) => Err(format!("切换失败: {}", e)),
    }
}

#[tauri::command]
async fn get_npm_packages() -> Result<Vec<String>, String> {
    let output = tokio::process::Command::new("npm")
        .args(&["list", "-g", "--depth=0"])
        .output()
        .await;

    match output {
        Ok(result) => {
            let packages = String::from_utf8_lossy(&result.stdout)
                .lines()
                .skip(1) // 跳过标题行
                .filter(|line| !line.trim().is_empty())
                .map(|line| line.trim().to_string())
                .collect();
            Ok(packages)
        }
        Err(e) => Err(format!("获取npm包列表失败: {}", e)),
    }
}

#[tauri::command]
async fn install_npm_package(package: String, global: bool) -> Result<String, String> {
    let mut cmd = tokio::process::Command::new("npm");
    cmd.arg("install").arg(&package);

    if global {
        cmd.arg("-g");
    }

    let output = cmd.output().await;

    match output {
        Ok(_) => Ok(format!("包 {} 安装完成", package)),
        Err(e) => Err(format!("安装失败: {}", e)),
    }
}

#[tauri::command]
async fn set_npm_registry(registry: String) -> Result<String, String> {
    let output = tokio::process::Command::new("npm")
        .args(&["config", "set", "registry", &registry])
        .output()
        .await;

    match output {
        Ok(_) => Ok(format!("npm源已设置为: {}", registry)),
        Err(e) => Err(format!("设置npm源失败: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                // 设置 macOS 原生标题栏，高度为 52px
                setup_macos_titlebar(&window, 52.0);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            read_config,
            write_config,
            get_node_versions,
            install_node_version,
            switch_node_version,
            get_npm_packages,
            install_npm_package,
            set_npm_registry
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run()
}