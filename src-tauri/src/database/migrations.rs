use crate::database::errors::DatabaseError;
use crate::database::schema::SCHEMA_MIGRATIONS;
use rusqlite::Connection;

pub fn run_migrations(conn: &mut Connection) -> Result<(), DatabaseError> {
    // Create migrations table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_versions (
            version INTEGER PRIMARY KEY,
            applied_at INTEGER NOT NULL
        )",
        [],
    )?;

    // Get current version
    let current_version: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), -1) FROM schema_versions",
            [],
            |row| row.get(0),
        )
        .unwrap_or(-1);

    let tx = conn.transaction()?;

    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    for (i, migration) in SCHEMA_MIGRATIONS.iter().enumerate() {
        let version = i as i64;
        if version > current_version {
            tx.execute_batch(migration).map_err(|e| DatabaseError::Migration(e.to_string()))?;
            tx.execute(
                "INSERT INTO schema_versions (version, applied_at) VALUES (?1, ?2)",
                rusqlite::params![version, current_time],
            )?;
        }
    }

    tx.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    #[test]
    fn test_migrations() {
        let mut conn = Connection::open_in_memory().unwrap();
        run_migrations(&mut conn).unwrap();
        
        // Ensure settings table exists
        let count: i64 = conn.query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='settings'",
            [],
            |row| row.get(0)
        ).unwrap();
        
        assert_eq!(count, 1);
    }
}
