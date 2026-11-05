use rusqlite::{params, Connection, Result};
use super::types::{MemoryRecord, CreateMemoryRequest, MemoryType};
use uuid::Uuid;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct MemoryRepository {
    conn: Connection,
}

impl MemoryRepository {
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        Ok(Self { conn })
    }

    pub fn create_memory(&self, req: CreateMemoryRequest) -> Result<MemoryRecord> {
        let id = Uuid::new_v4().to_string();
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        
        self.conn.execute(
            "INSERT INTO character_memories (id, character_id, content, importance, source, created_at, last_accessed, memory_type)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                id, req.character_id, req.content, req.importance, req.source, now, now, req.memory_type
            ],
        )?;

        Ok(MemoryRecord {
            id,
            character_id: req.character_id,
            content: req.content,
            importance: req.importance,
            source: req.source,
            created_at: now,
            last_accessed: now,
            memory_type: MemoryType::from_str(&req.memory_type),
        })
    }

    pub fn get_memories(&self, character_id: &str) -> Result<Vec<MemoryRecord>> {
        let mut stmt = self.conn.prepare("SELECT id, character_id, content, importance, source, created_at, last_accessed, memory_type FROM character_memories WHERE character_id = ?1 ORDER BY created_at DESC")?;
        
        let iter = stmt.query_map(params![character_id], |row| {
            let mt: String = row.get(7)?;
            Ok(MemoryRecord {
                id: row.get(0)?,
                character_id: row.get(1)?,
                content: row.get(2)?,
                importance: row.get(3)?,
                source: row.get(4)?,
                created_at: row.get(5)?,
                last_accessed: row.get(6)?,
                memory_type: MemoryType::from_str(&mt),
            })
        })?;

        let mut memories = Vec::new();
        for mem in iter {
            memories.push(mem?);
        }
        Ok(memories)
    }

    pub fn update_memory_type(&self, id: &str, new_type: &str) -> Result<()> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        self.conn.execute(
            "UPDATE character_memories SET memory_type = ?1, last_accessed = ?2 WHERE id = ?3",
            params![new_type, now, id]
        )?;
        Ok(())
    }

    pub fn delete_memory(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM character_memories WHERE id = ?1", params![id])?;
        Ok(())
    }
}
