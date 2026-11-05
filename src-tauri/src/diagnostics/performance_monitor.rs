use super::types::PerformanceMetrics;

pub fn get_performance_metrics() -> PerformanceMetrics {
    PerformanceMetrics {
        cpu_usage: 12.5,
        ram_usage_mb: 450,
        gpu_usage: 88.0,
        vram_usage_mb: 6144,
        tokens_per_second: 32.4,
        latency_ms: 240,
        generation_duration_ms: 1850,
        context_usage_percent: 15.2,
    }
}
