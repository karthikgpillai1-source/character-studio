use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Setting {
    pub id: i64,
    pub key: String,
    pub value: String,
    pub updated_at: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Model {
    pub id: i64,
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
    pub quantization: String,
    pub context_length: u32,
    pub backend: Option<String>,
    pub last_used: Option<u64>,
    pub created_at: u64,
    pub is_favorite: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Conversation {
    pub id: i64,
    pub title: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Message {
    pub id: i64,
    pub conversation_id: i64,
    pub role: String,
    pub content: String,
    pub token_count: Option<u32>,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RuntimeHistory {
    pub id: i64,
    pub model_id: i64,
    pub backend: String,
    pub tokens_per_second: f64,
    pub generation_time: u64,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Recipe {
    pub id: i64,
    pub uuid: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub category: String,
    pub recipe_path: String,
    pub avatar_path: Option<String>,
    pub identity_score: i32,
    pub personality_score: i32,
    pub knowledge_score: i32,
    pub recipe_hash: String,
    pub recipe_format: String,
    pub recipe_engine_version: String,
    pub character_type: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DashboardStats {
    pub models_count: i64,
    pub characters_count: i64,
    pub recipes_count: i64,
    pub memories_count: i64,
    pub knowledge_documents_count: i64,
}
