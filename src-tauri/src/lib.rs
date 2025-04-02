#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use user_idle_time::get_idle_time;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
fn get_system_idle_time() -> Result<u64, String> {
    match get_idle_time() {
        Ok(duration) => Ok(duration.as_secs()),
        Err(e) => Err(e.to_string()),
    }
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_idle_time,
            greet,
            shutdown
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
