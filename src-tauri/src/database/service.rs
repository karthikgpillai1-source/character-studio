use crate::database::connection::establish_connection;
use crate::database::errors::DatabaseError;
use crate::database::models::{Conversation, Message, Model, Setting};
use crate::database::repositories::{
    ConversationRepository, MessageRepository, ModelRepository, SettingsRepository,
};
use rusqlite::Connection;
use std::sync::Mutex;

pub struct DatabaseService {
    conn: Mutex<Connection>,
}

impl DatabaseService {
    pub fn new() -> Result<Self, DatabaseError> {
        let conn = establish_connection()?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<Setting>, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        SettingsRepository::get(&conn, key)
    }

    pub fn save_setting(&self, key: &str, value: &str) -> Result<(), DatabaseError> {
        let conn = self.conn.lock().unwrap();
        SettingsRepository::set(&conn, key, value)
    }

    pub fn save_model(
        &self,
        name: &str,
        path: &str,
        size_bytes: u64,
        quantization: &str,
        context_length: u32,
    ) -> Result<i64, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        ModelRepository::insert_or_update(&conn, name, path, size_bytes, quantization, context_length)
    }

    pub fn get_models(&self) -> Result<Vec<Model>, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        ModelRepository::get_all(&conn)
    }

    pub fn set_model_favorite(&self, id: i64, is_favorite: bool) -> Result<(), DatabaseError> {
        let conn = self.conn.lock().unwrap();
        ModelRepository::set_favorite(&conn, id, is_favorite)
    }

    pub fn create_conversation(&self, title: &str) -> Result<i64, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        ConversationRepository::create(&conn, title)
    }

    pub fn get_conversations(&self) -> Result<Vec<Conversation>, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        ConversationRepository::get_all(&conn)
    }

    pub fn save_message(
        &self,
        conversation_id: i64,
        role: &str,
        content: &str,
        token_count: Option<u32>,
    ) -> Result<i64, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        MessageRepository::insert(&conn, conversation_id, role, content, token_count)
    }

    pub fn get_messages(&self, conversation_id: i64) -> Result<Vec<Message>, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        MessageRepository::get_by_conversation(&conn, conversation_id)
    }

    pub fn get_recipes(&self) -> Result<Vec<crate::database::models::Recipe>, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        crate::database::repositories::RecipeRepository::get_all(&conn)
    }

    pub fn import_recipe(
        &self,
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
        let conn = self.conn.lock().unwrap();
        crate::database::repositories::RecipeRepository::insert(
            &conn, uuid, name, version, author, description, category, recipe_path, avatar_path,
            identity_score, personality_score, knowledge_score, recipe_hash, recipe_format,
            recipe_engine_version, character_type
        )
    }

    pub fn get_dashboard_stats(&self) -> Result<crate::database::models::DashboardStats, DatabaseError> {
        let conn = self.conn.lock().unwrap();
        
        let models_count: i64 = conn.query_row("SELECT count(*) FROM models", [], |row| row.get(0)).unwrap_or(0);
        let characters_count: i64 = conn.query_row("SELECT count(*) FROM characters", [], |row| row.get(0)).unwrap_or(0);
        let recipes_count: i64 = conn.query_row("SELECT count(*) FROM recipes", [], |row| row.get(0)).unwrap_or(0);
        let memories_count: i64 = conn.query_row("SELECT count(*) FROM character_memories", [], |row| row.get(0)).unwrap_or(0);
        let knowledge_documents_count: i64 = conn.query_row("SELECT count(*) FROM knowledge_documents", [], |row| row.get(0)).unwrap_or(0);
        
        Ok(crate::database::models::DashboardStats {
            models_count,
            characters_count,
            recipes_count,
            memories_count,
            knowledge_documents_count,
        })
    }
}
