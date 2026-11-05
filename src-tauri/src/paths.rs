use std::path::PathBuf;

pub fn get_data_dir() -> PathBuf {
    let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    println!("[DIAGNOSTIC] paths::get_data_dir - current_dir: {:?}", current_dir);
    
    // Check if we are in the workspace root
    if current_dir.join("src-tauri").exists() {
        let res = current_dir.join("src-tauri").join("data");
        println!("[DIAGNOSTIC] paths::get_data_dir - resolved to (workspace root): {:?}", res);
        return res;
    }
    
    // Otherwise we are likely already in src-tauri, or it's a prod build
    let res = current_dir.join("data");
    println!("[DIAGNOSTIC] paths::get_data_dir - resolved to (local/fallback): {:?}", res);
    res
}

pub fn get_recipes_dir() -> PathBuf {
    let dir = get_data_dir().join("recipes");
    if !dir.exists() {
        let _ = std::fs::create_dir_all(&dir);
    }
    dir
}
