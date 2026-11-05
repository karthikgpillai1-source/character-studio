use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EngineStatus {
    pub state: String,
    pub backend_type: String,
    pub model_loaded: bool,
    pub port: u16,
    pub context_length: u32,
    pub gpu_backend: String,
    pub pid: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelMetrics {
    pub name: String,
    pub path: String,
    pub architecture: String,
    pub quantization: String,
    pub size_bytes: u64,
    pub load_time_ms: u64,
    pub ram_usage_mb: u32,
    pub vram_usage_mb: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenEvent {
    pub index: u32,
    pub timestamp: i64,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptSnapshot {
    pub character_context: String,
    pub dna_context: String,
    pub memory_context: String,
    pub knowledge_context: String,
    pub user_prompt: String,
    pub final_assembled: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PerformanceMetrics {
    pub cpu_usage: f32,
    pub ram_usage_mb: u32,
    pub gpu_usage: f32,
    pub vram_usage_mb: u32,
    pub tokens_per_second: f32,
    pub latency_ms: u32,
    pub generation_duration_ms: u32,
    pub context_usage_percent: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PipelineStage {
    pub name: String,
    pub status: String, // "Success", "Warning", "Failure"
    pub execution_time_ms: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiagnosticLog {
    pub id: String,
    pub timestamp: i64,
    pub event_type: String,
    pub message: String,
}
