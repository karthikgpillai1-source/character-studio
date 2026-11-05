use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum BackendMode {
    Auto,
    CUDA,
    Vulkan,
    CPU,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ModelMetadata {
    pub file_path: String,
    pub name: String,
    pub size_bytes: u64,
    pub quantization: String,
    pub context_length: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RuntimeStatus {
    pub is_running: bool,
    pub pid: Option<u32>,
    pub active_backend: Option<String>,
    pub current_model: Option<ModelMetadata>,
    pub uptime_seconds: u64,
    pub tokens_per_second: f64,
    pub memory_usage_mb: u64,
    pub exit_code: Option<i32>,
    pub exit_reason: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GenerationRequest {
    pub prompt: String,
    pub conversation_id: Option<i64>,
    pub temperature: f32,
    pub max_tokens: u32,
    pub top_p: f32,
    pub top_k: u32,
    pub repeat_penalty: f32,
    pub stop_sequences: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LlamaCompletionRequest {
    pub prompt: String,
    pub temperature: f32,
    pub n_predict: u32,
    pub top_p: f32,
    pub top_k: u32,
    pub repeat_penalty: f32,
    pub stop: Vec<String>,
    pub stream: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LlamaCompletionChunk {
    pub content: String,
    pub stop: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StreamUpdate {
    pub token: String,
    pub is_finished: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PromptAssemblyDiag {
    pub system: bool,
    pub memory: bool,
    pub knowledge: bool,
    pub character: bool,
    pub final_length: usize,
}
