use crate::hardware::types::{CapabilitiesInfo, CpuInfo, GpuInfo};

pub fn detect_capabilities(cpu: &CpuInfo, gpus: &[GpuInfo]) -> CapabilitiesInfo {
    // Check if any GPU has CUDA support
    let cuda = gpus.iter().any(|g| g.cuda_support && g.detected);
    
    // For Vulkan and DirectML, a robust implementation would dynamically load vulkan-1.dll/so
    // and d3d12.dll or use wgpu. For this baseline Phase 1 implementation, we use heuristics:
    // Any detected modern GPU is assumed to have Vulkan/DirectML support on Windows/Linux,
    // pending a deeper graphics API probe in a future release.
    let has_any_gpu = gpus.iter().any(|g| g.detected);
    
    let is_windows = std::env::consts::OS == "windows";
    let vulkan = has_any_gpu;
    let directml = has_any_gpu && is_windows;

    CapabilitiesInfo {
        cuda,
        vulkan,
        directml,
        avx: cpu.avx,
        avx2: cpu.avx2,
        avx512: cpu.avx512,
        fma: cpu.fma,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_capabilities_with_cuda() {
        let cpu = CpuInfo {
            name: "Test CPU".into(), vendor: "Test".into(),
            cores: 4, threads: 8, frequency_mhz: 2000, max_frequency_mhz: 3000,
            architecture: "x86_64".into(),
            avx: true, avx2: true, avx512: false, fma: true, sse4_1: true, sse4_2: true,
        };
        let gpu = GpuInfo {
            detected: true, reason: None, name: "RTX 3060".into(), driver_version: "500".into(),
            vram_total_gb: 12.0, vram_used_gb: 1.0, vram_free_gb: 11.0, cuda_support: true,
        };

        let caps = detect_capabilities(&cpu, &[gpu]);
        assert!(caps.cuda);
        assert!(caps.vulkan);
        assert!(caps.avx2);
    }
}
