use crate::database::models::Recipe;
use crate::database::service::DatabaseService;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn get_recipes(db: State<'_, DatabaseService>) -> Result<Vec<Recipe>, String> {
    db.get_recipes().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn import_recipe(
    file_path: String,
    db: State<'_, DatabaseService>,
) -> Result<Recipe, String> {
    let source_path = std::path::Path::new(&file_path);
    if !source_path.exists() {
        return Err("Recipe file not found".into());
    }

    let file_name = source_path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown.recipe");

    let uuid_str = Uuid::new_v4().to_string();
    let recipes_dir = crate::paths::get_recipes_dir();
    let dest_dir = recipes_dir.join(&uuid_str);
    
    std::fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
    
    let dest_path = dest_dir.join(file_name);
    std::fs::copy(source_path, &dest_path).map_err(|e| e.to_string())?;

    let mock_name = file_name.replace(".recipe", "");
    
    let id = db.import_recipe(
        &uuid_str,
        &mock_name,
        "1.0",
        "Character Forge",
        "A deployable character brain package.",
        "Fictional Character",
        dest_path.to_str().unwrap_or(""),
        None,
        100, // identity score
        100, // personality score
        100, // knowledge score
        "mock_hash", // recipe hash
        "v1", // recipe format
        "1.0", // engine version
        "fictional", // character type
    ).map_err(|e| e.to_string())?;

    let recipes = db.get_recipes().map_err(|e| e.to_string())?;
    recipes.into_iter().find(|r| r.id == id).ok_or("Failed to fetch newly imported recipe".into())
}
