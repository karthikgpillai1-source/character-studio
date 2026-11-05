use crate::hardware::types::{CapabilitiesInfo, MemoryInfo, RecommendationInfo};

pub fn generate_recommendations(
    memory: &MemoryInfo,
    caps: &CapabilitiesInfo,
    max_vram_gb: f64,
) -> RecommendationInfo {
    
    // 1. Backend Recommendation
    let recommended_backend = if caps.cuda {
        "CUDA".to_string()
    } else if caps.directml {
        "DirectML".to_string()
    } else if caps.vulkan {
        "Vulkan".to_string()
    } else if caps.avx2 || caps.avx512 {
        "CPU (AVX2+)".to_string()
    } else {
        "CPU".to_string()
    };

    // 2. Model Size Recommendation
    // A heuristic based primarily on VRAM, falling back to RAM if using CPU
    let total_memory_gb = if max_vram_gb > 2.0 { max_vram_gb } else { memory.total_ram_gb * 0.5 }; // assume we can use half of sys RAM

    let recommended_model_size = if total_memory_gb >= 24.0 {
        "32B".to_string()
    } else if total_memory_gb >= 12.0 {
        "14B".to_string()
    } else if total_memory_gb >= 8.0 {
        "8B".to_string()
    } else if total_memory_gb >= 6.0 {
        "7B".to_string()
    } else {
        "1B-3B".to_string()
    };

    // 3. Context Length Recommendation
    let recommended_context_length = if total_memory_gb >= 16.0 {
        "32K".to_string()
    } else if total_memory_gb >= 12.0 {
        "16K".to_string()
    } else if total_memory_gb >= 8.0 {
        "8K".to_string()
    } else {
        "4K".to_string()
    };

    // 4. Performance Estimate
    let performance_estimate = if caps.cuda && max_vram_gb >= 16.0 {
        "Enthusiast".to_string()
    } else if caps.cuda || (caps.vulkan && max_vram_gb >= 8.0) {
        "High".to_string()
    } else if max_vram_gb >= 4.0 || caps.avx512 {
        "Medium".to_string()
    } else {
        "Low".to_string()
    };

    RecommendationInfo {
        recommended_backend,
        recommended_model_size,
        recommended_context_length,
        performance_estimate,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_recommendations_enthusiast() {
        let mem = MemoryInfo {
            total_ram_gb: 32.0, available_ram_gb: 16.0, used_ram_gb: 16.0, utilization_percent: 50.0
        };
        let caps = CapabilitiesInfo {
            cuda: true, vulkan: true, directml: true, avx: true, avx2: true, avx512: false, fma: true
        };
        let vram = 24.0;

        let rec = generate_recommendations(&mem, &caps, vram);
        assert_eq!(rec.recommended_backend, "CUDA");
        assert_eq!(rec.recommended_model_size, "32B");
        assert_eq!(rec.recommended_context_length, "32K");
        assert_eq!(rec.performance_estimate, "Enthusiast");
    }
    
    #[test]
    fn test_generate_recommendations_low_end() {
        let mem = MemoryInfo {
            total_ram_gb: 8.0, available_ram_gb: 4.0, used_ram_gb: 4.0, utilization_percent: 50.0
        };
        let caps = CapabilitiesInfo {
            cuda: false, vulkan: false, directml: false, avx: true, avx2: false, avx512: false, fma: false
        };
        let vram = 0.0; // CPU only

        let rec = generate_recommendations(&mem, &caps, vram);
        assert_eq!(rec.recommended_backend, "CPU");
        assert_eq!(rec.recommended_model_size, "1B-3B");
        assert_eq!(rec.recommended_context_length, "4K");
        assert_eq!(rec.performance_estimate, "Low");
    }
}
