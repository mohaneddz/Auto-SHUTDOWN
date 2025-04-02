#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use user_idle_time::get_idle_time;

// returns the time since launch
#[tauri::command]
fn get_uptime() -> u64 {
    let uptime = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("Time went backwards");
    uptime.as_secs()
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn shutdown() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        Command::new("shutdown")
            .args(&["/s", "/t", "0"])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Shutdown is only supported on Windows".into())
    }
}

#[tauri::command]
fn get_system_idle_time() -> Result<u64, String> {
    match get_idle_time() {
        Ok(duration) => Ok(duration.as_secs()),
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .invoke_handler(tauri::generate_handler![
            get_system_idle_time,
            greet,
            shutdown,
            get_uptime
        ])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
