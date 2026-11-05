use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CpuInfo {
    pub name: String,
    pub vendor: String,
    pub cores: usize,
    pub threads: usize,
    pub frequency_mhz: u64,
    pub max_frequency_mhz: u64,
    pub architecture: String,
    // Instructions
    pub avx: bool,
    pub avx2: bool,
    pub avx512: bool,
    pub fma: bool,
    pub sse4_1: bool,
    pub sse4_2: bool,
    pub usage_percent: f32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MemoryInfo {
    pub total_ram_gb: f64,
    pub available_ram_gb: f64,
    pub used_ram_gb: f64,
    pub utilization_percent: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorageInfo {
    pub drive_name: String,
    pub total_capacity_gb: f64,
    pub free_capacity_gb: f64,
    pub used_capacity_gb: f64,
    pub low_space_warning: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GpuInfo {
    pub detected: bool,
    pub reason: Option<String>,
    pub name: String,
    pub driver_version: String,
    pub vram_total_gb: f64,
    pub vram_used_gb: f64,
    pub vram_free_gb: f64,
    pub cuda_support: bool,
    pub usage_percent: f32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CapabilitiesInfo {
    pub cuda: bool,
    pub vulkan: bool,
    pub directml: bool,
    pub avx: bool,
    pub avx2: bool,
    pub avx512: bool,
    pub fma: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RecommendationInfo {
    pub recommended_backend: String,
    pub recommended_model_size: String,
    pub recommended_context_length: String,
    pub performance_estimate: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HardwareSnapshot {
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub storage: StorageInfo,
    pub gpus: Vec<GpuInfo>,
    pub capabilities: CapabilitiesInfo,
    pub recommendations: RecommendationInfo,
    pub timestamp: u64,
}
