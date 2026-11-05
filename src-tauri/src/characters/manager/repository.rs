use rusqlite::{params, Connection, Result};
use super::types::{Character, CreateCharacterRequest, UpdateCharacterRequest};
use uuid::Uuid;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct CharacterRepository {
    conn: Connection,
}

impl CharacterRepository {
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        Ok(Self { conn })
    }

    pub fn create_character(&self, req: CreateCharacterRequest) -> Result<Character> {
        let id = Uuid::new_v4().to_string();
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        
        self.conn.execute(
            "INSERT INTO characters (id, name, description, avatar, assigned_model, category, creator, is_favorite, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                id, req.name, req.description, req.avatar, req.assigned_model, req.category, req.creator, false, now, now
            ],
        )?;

        Ok(Character {
            id,
            name: req.name,
            description: req.description,
            avatar: req.avatar,
            assigned_model: req.assigned_model,
            category: req.category,
            creator: req.creator,
            is_favorite: false,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_characters(&self) -> Result<Vec<Character>> {
        let mut stmt = self.conn.prepare("SELECT id, name, description, avatar, assigned_model, category, creator, is_favorite, created_at, updated_at FROM characters ORDER BY updated_at DESC")?;
        
        let character_iter = stmt.query_map([], |row| {
            Ok(Character {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                avatar: row.get(3)?,
                assigned_model: row.get(4)?,
                category: row.get(5)?,
                creator: row.get(6)?,
                is_favorite: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })?;

        let mut characters = Vec::new();
        for char_res in character_iter {
            characters.push(char_res?);
        }
        Ok(characters)
    }

    pub fn delete_character(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM characters WHERE id = ?1", params![id])?;
        Ok(())
    }
}
