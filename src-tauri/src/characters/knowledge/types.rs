use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnowledgeDocument {
    pub id: String,
    pub character_id: String,
    pub name: String,
    pub file_type: String,
    pub size_bytes: u64,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnowledgeChunk {
    pub document_id: String,
    pub character_id: String,
    pub chunk_id: String,
    pub content: String,
    pub metadata: String, // JSON serialized metadata
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchQuery {
    pub query: String,
    pub character_id: String,
    pub top_k: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RetrievalResult {
    pub chunk: KnowledgeChunk,
    pub confidence_score: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Citation {
    pub document_name: String,
    pub chunk_id: String,
    pub confidence: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RerankedChunk {
    pub chunk: KnowledgeChunk,
    pub score: f64,
    pub citation: Citation,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnowledgeAnalytics {
    pub document_count: u32,
    pub chunk_count: u32,
    pub storage_usage_bytes: u64,
    pub retrieval_frequency: u32,
    pub coverage_percent: f32,
}
