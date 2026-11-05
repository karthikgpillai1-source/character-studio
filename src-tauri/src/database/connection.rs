use crate::database::errors::DatabaseError;
use crate::database::migrations::run_migrations;
use rusqlite::Connection;
use crate::paths::get_data_dir;

pub fn establish_connection() -> Result<Connection, DatabaseError> {
    let data_dir = get_data_dir();

    if !data_dir.exists() {
        std::fs::create_dir_all(&data_dir)?;
    }

    let db_path = data_dir.join("character_studio.db");
    
    let mut conn = Connection::open(&db_path)?;
    
    // Enable foreign key support
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    // Run migrations automatically
    run_migrations(&mut conn)?;

    Ok(conn)
}
