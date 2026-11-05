use crate::hardware::types::GpuInfo;
use nvml_wrapper::Nvml;
use nvml_wrapper::error::NvmlError;

const BYTES_TO_GB: f64 = 1_073_741_824.0;

pub fn get_gpu_info() -> Vec<GpuInfo> {
    match Nvml::init() {
        Ok(nvml) => {
            let mut gpus = Vec::new();
            let device_count = nvml.device_count().unwrap_or(0);

            for i in 0..device_count {
                if let Ok(device) = nvml.device_by_index(i) {
                    let name = device.name().unwrap_or_else(|_| "Unknown NVIDIA GPU".to_string());
                    let driver_version = nvml.sys_driver_version().unwrap_or_else(|_| "Unknown".to_string());
                    
                    let memory = device.memory_info().unwrap_or(nvml_wrapper::struct_wrappers::device::MemoryInfo {
                        free: 0,
                        total: 0,
                        used: 0,
                    });

                    let util = device.utilization_rates().unwrap_or(nvml_wrapper::struct_wrappers::device::Utilization {
                        gpu: 0,
                        memory: 0,
                    });

                    gpus.push(GpuInfo {
                        detected: true,
                        reason: None,
                        name,
                        driver_version,
                        vram_total_gb: memory.total as f64 / BYTES_TO_GB,
                        vram_used_gb: memory.used as f64 / BYTES_TO_GB,
                        vram_free_gb: memory.free as f64 / BYTES_TO_GB,
                        cuda_support: true, // If NVML loads, CUDA is supported
                        usage_percent: util.gpu as f32,
                    });
                }
            }

            if gpus.is_empty() {
                vec![GpuInfo {
                    detected: false,
                    reason: Some("NVML initialized but no devices found".to_string()),
                    name: "None".to_string(),
                    driver_version: "None".to_string(),
                    vram_total_gb: 0.0,
                    vram_used_gb: 0.0,
                    vram_free_gb: 0.0,
                    cuda_support: false,
                    usage_percent: 0.0,
                }]
            } else {
                gpus
            }
        }
        Err(e) => {
            // Graceful fallback if NVIDIA is not available
            let reason = match e {
                NvmlError::LibraryNotFound => "NVIDIA driver not found",
                _ => "NVML initialization failed",
            };
            
            vec![GpuInfo {
                detected: false,
                reason: Some(reason.to_string()),
                name: "None".to_string(),
                driver_version: "None".to_string(),
                vram_total_gb: 0.0,
                vram_used_gb: 0.0,
                vram_free_gb: 0.0,
                cuda_support: false,
                usage_percent: 0.0,
            }]
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_gpu_info() {
        let gpus = get_gpu_info();
        assert!(!gpus.is_empty());
        // Since tests can run on machines with or without GPUs, we just check that it doesn't crash
        let gpu = &gpus[0];
        if gpu.detected {
            assert!(gpu.vram_total_gb > 0.0);
        } else {
            assert!(gpu.reason.is_some());
        }
    }
}
