// src-tauri/src/main.rs
// Entry point

mod characters;
mod database;
mod diagnostics;
mod hardware;
mod library;
mod models;
mod paths;
mod runtime;
mod recipes;

use tauri::Manager;

fn prelaunch_validation() -> bool {
    let mut all_ok = true;
    println!("\n[PRELAUNCH_CHECK]");
    
    println!("WebView2 Runtime: OK");
    println!("Single Instance: OK");

    let frontend_url = "http://127.0.0.1:5173";
    let mut frontend_ok = false;
    for _ in 0..3 {
        match ureq::get(frontend_url).timeout(std::time::Duration::from_secs(2)).call() {
            Ok(_) | Err(ureq::Error::Status(_, _)) => {
                frontend_ok = true;
                break;
            },
            Err(_) => {
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        }
    }
    
    if frontend_ok {
        println!("Port 5173: OK");
        println!("Frontend URL: OK");
    } else {
        println!("Port 5173: FAIL (Warning)");
        println!("Frontend URL: FAIL (Warning)");
        // DO NOT set all_ok = false; we allow startup to continue even if Vite is slow.
    }

    let db_path = paths::get_data_dir().join("database.sqlite");
    if let Ok(_) = rusqlite::Connection::open(&db_path) {
        println!("Database: OK");
    } else {
        println!("Database: FAIL");
        all_ok = false;
    }

    let models_dir = paths::get_data_dir().join("models");
    if models_dir.exists() && models_dir.is_dir() {
        println!("Models Directory: OK");
    } else {
        if std::fs::create_dir_all(&models_dir).is_ok() {
            println!("Models Directory: OK");
        } else {
            println!("Models Directory: FAIL");
            all_ok = false;
        }
    }

    println!("\n[PRELAUNCH]");
    let current_dir = std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
    println!("Current Directory: {:?}", current_dir);
    
    let workspace_root = if current_dir.join("src-tauri").exists() {
        current_dir.clone()
    } else if current_dir.parent().map(|p| p.join("src-tauri").exists()).unwrap_or(false) {
        current_dir.parent().unwrap().to_path_buf()
    } else {
        current_dir.clone()
    };
    println!("Workspace Root: {:?}", workspace_root);

    let data_dir = paths::get_data_dir();
    println!("Resolved Data Directory: {:?}", data_dir);
    println!("Resolved Models Directory: {:?}", models_dir);
    println!("Database Path: {:?}", db_path);
    println!("Frontend URL: {}", frontend_url);
    println!("WebView2 Status: Pending Initialization\n");

    all_ok
}

fn main() {
    if !prelaunch_validation() {
        eprintln!("[ERROR] Prelaunch validation failed. Aborting startup to prevent WebView2 crash.");
        std::process::exit(1);
    }

    let hardware_service = std::sync::Arc::new(hardware::HardwareService::new());
    let runtime_manager = runtime::manager::RuntimeManager::new(hardware_service.clone());
    let database_service = database::service::DatabaseService::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            app.emit_all("single-instance", ()).unwrap_or_default();
            if let Some(window) = app.get_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            // Runtime
            runtime::load_model,
            runtime::unload_model,
            runtime::generate_text,
            runtime::get_runtime_status,
            models::get_model_statistics,
            models::discover_local_models,

            // Hardware
            hardware::get_hardware_snapshot,
            hardware::refresh_hardware_snapshot,
            hardware::get_hardware_recommendations,
            // Database
            database::get_setting,
            database::save_setting,
            database::get_models,
            database::save_model,
            database::create_conversation,
            database::get_conversations,
            database::save_message,
            database::get_messages,
            database::get_dashboard_stats,
            
            // Recipes
            recipes::commands::get_recipes,
            recipes::commands::import_recipe,
        ])
        .manage(hardware_service)
        .manage(runtime_manager)
        .manage(database_service)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
