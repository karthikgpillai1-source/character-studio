use crate::hardware::HardwareService;
use crate::runtime::backend::resolve_binary_path;
use crate::runtime::errors::RuntimeError;
use crate::runtime::launcher::launch_model;
use crate::runtime::model_loader::validate_gguf;
use crate::runtime::process_monitor::ProcessMonitor;
use crate::runtime::types::{BackendMode, ModelMetadata, RuntimeStatus};
use std::sync::{Arc, Mutex};
use tauri::Manager;

pub struct RuntimeManager {
    hardware_service: Arc<HardwareService>,
    process_monitor: Arc<Mutex<ProcessMonitor>>,
    active_model: Arc<Mutex<Option<ModelMetadata>>>,
    active_backend: Arc<Mutex<Option<String>>>,
}

impl RuntimeManager {
    pub fn new(hardware_service: Arc<HardwareService>) -> Self {
        Self {
            hardware_service,
            process_monitor: Arc::new(Mutex::new(ProcessMonitor::new())),
            active_model: Arc::new(Mutex::new(None)),
            active_backend: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn load_model(&self, path: &str, backend_mode: BackendMode, app_handle: tauri::AppHandle) -> Result<ModelMetadata, RuntimeError> {
        // Pre-flight file validations
        let model_path_buf = std::path::Path::new(path);
        if !model_path_buf.exists() {
            return Err(RuntimeError::InvalidConfiguration(format!("Model file not found at: {}", path)));
        }

        // Validate the model
        let model = validate_gguf(path)?;

        // Resolve backend binary
        let binary_path = resolve_binary_path(&backend_mode, &self.hardware_service)?;
        if !binary_path.exists() {
            return Err(RuntimeError::InvalidConfiguration(format!("Backend binary not found at: {:?}", binary_path)));
        }
        let binary_name = binary_path.file_name().unwrap_or_default().to_string_lossy().into_owned();

        // Emit Startup Diagnostics
        #[derive(serde::Serialize, Clone)]
        struct StartupDiagnostics {
            selected_backend: String,
            resolved_binary: String,
            resolved_model: String,
            context_length: u32,
            port: u16,
            working_directory: String,
        }
        let _ = app_handle.emit_all("runtime-diagnostic", StartupDiagnostics {
            selected_backend: format!("{:?}", backend_mode),
            resolved_binary: binary_path.to_string_lossy().into_owned(),
            resolved_model: model_path_buf.to_string_lossy().into_owned(),
            context_length: model.context_length,
            port: 8080,
            working_directory: std::env::current_dir().unwrap_or_default().to_string_lossy().into_owned(),
        });

        {
            let mut monitor = self.process_monitor.lock().unwrap();
            if monitor.is_running() {
                return Err(RuntimeError::ModelAlreadyLoaded);
            }
            // Launch process
            crate::runtime::launcher::launch_model(&binary_path, &model, &mut monitor, app_handle.clone())?;
        }
        
        // Wait for health check (30s timeout)
        if let Err(e) = crate::runtime::launcher::wait_for_server(8080, 30, app_handle.clone()).await {
            let mut monitor_err = self.process_monitor.lock().unwrap();
            let _ = monitor_err.kill(); // Cleanup on failure
            return Err(e);
        }

        // Update state
        *self.active_model.lock().unwrap() = Some(model.clone());
        *self.active_backend.lock().unwrap() = Some(binary_name);

        Ok(model)
    }

    pub fn unload_model(&self) -> Result<(), RuntimeError> {
        let mut monitor = self.process_monitor.lock().unwrap();
        
        if let Err(e) = monitor.kill() {
            return Err(RuntimeError::ProcessExecution(format!("Failed to kill process: {}", e)));
        }

        *self.active_model.lock().unwrap() = None;
        *self.active_backend.lock().unwrap() = None;

        Ok(())
    }

    pub fn get_status(&self) -> RuntimeStatus {
        let mut monitor = self.process_monitor.lock().unwrap();
        let is_running = monitor.is_running();
        
        let pid = if is_running {
            monitor.child.as_ref().map(|c| c.id())
        } else {
            None
        };

        RuntimeStatus {
            is_running,
            pid,
            active_backend: self.active_backend.lock().unwrap().clone(),
            current_model: self.active_model.lock().unwrap().clone(),
            uptime_seconds: monitor.uptime_seconds(),
            tokens_per_second: 0.0, // To be integrated with streaming metrics
            memory_usage_mb: 0, // To be integrated with sysinfo process metrics
            exit_code: monitor.exit_code,
            exit_reason: monitor.exit_reason.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_manager_initial_status() {
        let hw = Arc::new(HardwareService::new());
        let manager = RuntimeManager::new(hw);
        let status = manager.get_status();
        
        assert!(!status.is_running);
        assert!(status.current_model.is_none());
        assert!(status.active_backend.is_none());
    }
}
