use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub description: String,
    pub avatar: String,
    pub assigned_model: Option<String>,
    pub category: String,
    pub creator: String,
    pub is_favorite: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateCharacterRequest {
    pub name: String,
    pub description: String,
    pub avatar: String,
    pub assigned_model: Option<String>,
    pub category: String,
    pub creator: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UpdateCharacterRequest {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub avatar: Option<String>,
    pub assigned_model: Option<String>,
    pub category: Option<String>,
    pub is_favorite: Option<bool>,
}
