use crate::database::errors::DatabaseError;
use crate::database::models::{Conversation, Message, Model, RuntimeHistory, Setting};
use rusqlite::Connection;

pub struct SettingsRepository;
impl SettingsRepository {
    pub fn get(conn: &Connection, key: &str) -> Result<Option<Setting>, DatabaseError> {
        let mut stmt = conn.prepare("SELECT id, key, value, updated_at FROM settings WHERE key = ?1")?;
        let mut rows = stmt.query(rusqlite::params![key])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Setting {
                id: row.get(0)?,
                key: row.get(1)?,
                value: row.get(2)?,
                updated_at: row.get(3)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn set(conn: &Connection, key: &str, value: &str) -> Result<(), DatabaseError> {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
        conn.execute(
            "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            rusqlite::params![key, value, now],
        )?;
        Ok(())
    }
}

pub struct ModelRepository;
impl ModelRepository {
    pub fn insert_or_update(conn: &Connection, name: &str, path: &str, size_bytes: u64, quantization: &str, context_length: u32) -> Result<i64, DatabaseError> {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
        conn.execute(
            "INSERT INTO models (name, path, size_bytes, quantization, context_length, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(path) DO UPDATE SET name=excluded.name, size_bytes=excluded.size_bytes, 
             quantization=excluded.quantization, context_length=excluded.context_length",
            rusqlite::params![name, path, size_bytes, quantization, context_length, now],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_all(conn: &Connection) -> Result<Vec<Model>, DatabaseError> {
        let mut stmt = conn.prepare("SELECT id, name, path, size_bytes, quantization, context_length, backend, last_used, created_at, is_favorite FROM models")?;
        let rows = stmt.query_map([], |row| {
            Ok(Model {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                size_bytes: row.get(3)?,
                quantization: row.get(4)?,
                context_length: row.get(5)?,
                backend: row.get(6)?,
                last_used: row.get(7)?,
                created_at: row.get(8)?,
                is_favorite: row.get(9).unwrap_or(false),
            })
        })?;
        let mut models = Vec::new();
        for model in rows {
            models.push(model?);
        }
        Ok(models)
    }

    pub fn set_favorite(conn: &Connection, id: i64, is_favorite: bool) -> Result<(), DatabaseError> {
        conn.execute(
            "UPDATE models SET is_favorite = ?1 WHERE id = ?2",
            rusqlite::params![is_favorite, id],
        )?;
        Ok(())
    }
}

pub struct ConversationRepository;
impl ConversationRepository {
    pub fn create(conn: &Connection, title: &str) -> Result<i64, DatabaseError> {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
        conn.execute(
            "INSERT INTO conversations (title, created_at, updated_at) VALUES (?1, ?2, ?3)",
            rusqlite::params![title, now, now],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_all(conn: &Connection) -> Result<Vec<Conversation>, DatabaseError> {
        let mut stmt = conn.prepare("SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC")?;
        let rows = stmt.query_map([], |row| {
            Ok(Conversation {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })?;
        let mut convos = Vec::new();
        for c in rows {
            convos.push(c?);
        }
        Ok(convos)
    }
}

pub struct MessageRepository;
impl MessageRepository {
    pub fn insert(conn: &Connection, conversation_id: i64, role: &str, content: &str, token_count: Option<u32>) -> Result<i64, DatabaseError> {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
        
        let tx = conn.unchecked_transaction()?; // using unchecked for simple manual commit
        
        tx.execute(
            "INSERT INTO messages (conversation_id, role, content, token_count, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![conversation_id, role, content, token_count, now],
        )?;
        let id = tx.last_insert_rowid();
        
        tx.execute(
            "UPDATE conversations SET updated_at = ?1 WHERE id = ?2",
            rusqlite::params![now, conversation_id],
        )?;

        tx.commit()?;
        Ok(id)
    }

    pub fn get_by_conversation(conn: &Connection, conversation_id: i64) -> Result<Vec<Message>, DatabaseError> {
        let mut stmt = conn.prepare("SELECT id, conversation_id, role, content, token_count, created_at FROM messages WHERE conversation_id = ?1 ORDER BY created_at ASC")?;
        let rows = stmt.query_map(rusqlite::params![conversation_id], |row| {
            Ok(Message {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                token_count: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;
        let mut messages = Vec::new();
        for m in rows {
            messages.push(m?);
        }
        Ok(messages)
    }
}

pub struct RuntimeRepository;
impl RuntimeRepository {
    pub fn insert(conn: &Connection, model_id: i64, backend: &str, tokens_per_second: f64, generation_time: u64) -> Result<i64, DatabaseError> {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
        conn.execute(
            "INSERT INTO runtime_history (model_id, backend, tokens_per_second, generation_time, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![model_id, backend, tokens_per_second, generation_time, now],
        )?;
        Ok(conn.last_insert_rowid())
    }
}

pub struct RecipeRepository;
impl RecipeRepository {
    pub fn insert(
        conn: &Connection,
        uuid: &str,
        name: &str,
        version: &str,
        author: &str,
        description: &str,
        category: &str,
        recipe_path: &str,
        avatar_path: Option<&str>,
        identity_score: i32,
        personality_score: i32,
        knowledge_score: i32,
        recipe_hash: &str,
        recipe_format: &str,
        recipe_engine_version: &str,
        character_type: &str,
    ) -> Result<i64, DatabaseError> {
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();

        conn.execute(
            "INSERT INTO recipes (
                uuid, name, version, author, description, category, recipe_path, avatar_path,
                identity_score, personality_score, knowledge_score, recipe_hash, recipe_format,
                recipe_engine_version, character_type, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            rusqlite::params![
                uuid, name, version, author, description, category, recipe_path, avatar_path,
                identity_score, personality_score, knowledge_score, recipe_hash, recipe_format,
                recipe_engine_version, character_type, now, now
            ],
        )?;

        Ok(conn.last_insert_rowid())
    }

    pub fn get_all(conn: &Connection) -> Result<Vec<crate::database::models::Recipe>, DatabaseError> {
        let mut stmt = conn.prepare("SELECT id, uuid, name, version, author, description, category, recipe_path, avatar_path, identity_score, personality_score, knowledge_score, recipe_hash, recipe_format, recipe_engine_version, character_type, created_at, updated_at FROM recipes ORDER BY created_at DESC")?;
        
        let recipes = stmt.query_map([], |row| {
            Ok(crate::database::models::Recipe {
                id: row.get(0)?,
                uuid: row.get(1)?,
                name: row.get(2)?,
                version: row.get(3)?,
                author: row.get(4)?,
                description: row.get(5)?,
                category: row.get(6)?,
                recipe_path: row.get(7)?,
                avatar_path: row.get(8)?,
                identity_score: row.get(9)?,
                personality_score: row.get(10)?,
                knowledge_score: row.get(11)?,
                recipe_hash: row.get(12)?,
                recipe_format: row.get(13)?,
                recipe_engine_version: row.get(14)?,
                character_type: row.get(15)?,
                created_at: row.get(16)?,
                updated_at: row.get(17)?,
            })
        })?;

        let mut result = Vec::new();
        for recipe in recipes {
            result.push(recipe?);
        }
        
        Ok(result)
    }
}
