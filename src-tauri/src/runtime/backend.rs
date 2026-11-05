use crate::runtime::errors::RuntimeError;
use crate::runtime::types::BackendMode;
use crate::hardware::HardwareService;
use std::path::{Path, PathBuf};

pub fn resolve_binary_path(mode: &BackendMode, hardware: &HardwareService) -> Result<PathBuf, RuntimeError> {
    let base_dir = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("binaries");

    let resolved_mode = match mode {
        BackendMode::Auto => {
            let snap = hardware.get_snapshot();
            let rec = &snap.recommendations.recommended_backend;
            if rec == "CUDA" {
                BackendMode::CUDA
            } else if rec == "Vulkan" {
                BackendMode::Vulkan
            } else {
                BackendMode::CPU
            }
        }
        other => other.clone(),
    };

    let binary_name = match resolved_mode {
        BackendMode::CUDA => "llama-server-cuda",
        BackendMode::Vulkan => "llama-server-vulkan",
        BackendMode::CPU | BackendMode::Auto => "llama-server-cpu",
    };

    let ext = if std::env::consts::OS == "windows" { ".exe" } else { "" };
    let binary_path = base_dir.join(format!("{}{}", binary_name, ext));

    // In a real environment, we'd check if the binary actually exists.
    // Since this is Phase 1 scaffolding, we won't strictly enforce it here during initialization
    // unless explicitly executed.
    
    Ok(binary_path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolve_binary_path() {
        let hw = HardwareService::new();
        let path = resolve_binary_path(&BackendMode::CPU, &hw).unwrap();
        assert!(path.to_string_lossy().contains("llama-server-cpu"));
    }
}
