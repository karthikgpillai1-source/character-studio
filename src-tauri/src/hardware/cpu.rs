use crate::hardware::types::CpuInfo;
use sysinfo::{CpuExt, System, SystemExt};

#[allow(unreachable_code)]
pub fn get_cpu_info(sys: &System) -> CpuInfo {
    let cpu = sys.global_cpu_info();
    
    // Core and thread counts
    let physical_cores = sys.physical_core_count().unwrap_or(0);
    let logical_threads = sys.cpus().len();

    // Feature detection (x86/x86_64 only)
    #[cfg(any(target_arch = "x86", target_arch = "x86_64"))]
    let (avx, avx2, avx512, fma, sse4_1, sse4_2) = {
        (
            std::is_x86_feature_detected!("avx"),
            std::is_x86_feature_detected!("avx2"),
            std::is_x86_feature_detected!("avx512f"), // using avx512f as base avx512 indicator
            std::is_x86_feature_detected!("fma"),
            std::is_x86_feature_detected!("sse4.1"),
            std::is_x86_feature_detected!("sse4.2"),
        )
    };

    #[cfg(not(any(target_arch = "x86", target_arch = "x86_64")))]
    let (avx, avx2, avx512, fma, sse4_1, sse4_2) = (false, false, false, false, false, false);

    CpuInfo {
        name: cpu.brand().trim().to_string(),
        vendor: cpu.vendor_id().trim().to_string(),
        cores: physical_cores,
        threads: logical_threads,
        frequency_mhz: cpu.frequency(),
        // sysinfo does not directly provide max_frequency for all platforms reliably in v0.29
        // We fallback to current frequency as a placeholder for max
        max_frequency_mhz: cpu.frequency(), 
        architecture: std::env::consts::ARCH.to_string(),
        avx,
        avx2,
        avx512,
        fma,
        sse4_1,
        sse4_2,
        usage_percent: cpu.cpu_usage(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sysinfo::SystemExt;

    #[test]
    fn test_get_cpu_info() {
        let mut sys = System::new_all();
        sys.refresh_cpu();
        let cpu_info = get_cpu_info(&sys);
        
        assert!(!cpu_info.name.is_empty());
        assert!(!cpu_info.vendor.is_empty());
        assert!(cpu_info.threads > 0);
        assert!(!cpu_info.architecture.is_empty());
    }
}
