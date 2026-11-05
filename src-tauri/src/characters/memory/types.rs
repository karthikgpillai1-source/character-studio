use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum MemoryType {
    ShortTerm,
    LongTerm,
    Pinned,
    System,
}

impl MemoryType {
    pub fn as_str(&self) -> &'static str {
        match self {
            MemoryType::ShortTerm => "short_term",
            MemoryType::LongTerm => "long_term",
            MemoryType::Pinned => "pinned",
            MemoryType::System => "system",
        }
    }
    
    pub fn from_str(s: &str) -> Self {
        match s {
            "long_term" => MemoryType::LongTerm,
            "pinned" => MemoryType::Pinned,
            "system" => MemoryType::System,
            _ => MemoryType::ShortTerm,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryRecord {
    pub id: String,
    pub character_id: String,
    pub content: String,
    pub importance: u8, // 0-100
    pub source: String,
    pub created_at: i64,
    pub last_accessed: i64,
    pub memory_type: MemoryType,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryCluster {
    pub id: String,
    pub character_id: String,
    pub topic: String,
    pub memory_ids: Vec<String>,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemorySummary {
    pub id: String,
    pub character_id: String,
    pub summary_content: String,
    pub importance: u8,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoryAnalytics {
    pub total_memories: u32,
    pub cluster_count: u32,
    pub summary_count: u32,
    pub avg_importance: f32,
    pub retention_rate: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateMemoryRequest {
    pub character_id: String,
    pub content: String,
    pub importance: u8,
    pub source: String,
    pub memory_type: String,
}
