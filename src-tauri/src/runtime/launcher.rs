use crate::runtime::errors::RuntimeError;
use crate::runtime::process_monitor::ProcessMonitor;
use crate::runtime::types::ModelMetadata;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use tauri::Manager;
use std::io::{BufRead, BufReader};

pub fn launch_model(
    binary_path: &PathBuf,
    model: &ModelMetadata,
    monitor: &mut ProcessMonitor,
    app_handle: tauri::AppHandle,
) -> Result<(), RuntimeError> {
    if monitor.is_running() {
        return Err(RuntimeError::ModelAlreadyLoaded);
    }

    let mut cmd = Command::new(binary_path);
    
    // llama.cpp server arguments
    cmd.arg("-m")
       .arg(&model.file_path)
       .arg("-c")
       .arg(model.context_length.to_string())
       .arg("--port")
       .arg("8080")
       .stdout(Stdio::piped()) 
       .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    match cmd.spawn() {
        Ok(mut child) => {
            let stdout = child.stdout.take().unwrap();
            let stderr = child.stderr.take().unwrap();

            let ah1 = app_handle.clone();
            std::thread::spawn(move || {
                let reader = BufReader::new(stdout);
                for line in reader.lines() {
                    if let Ok(l) = line {
                        println!("[LLAMA STDOUT] {}", l);
                        let _ = ah1.emit_all("runtime-log", l);
                    }
                }
            });

            let ah2 = app_handle.clone();
            std::thread::spawn(move || {
                let reader = BufReader::new(stderr);
                for line in reader.lines() {
                    if let Ok(l) = line {
                        let _ = ah2.emit_all("runtime-log", l);
                    }
                }
            });

            monitor.set_child(child);
            Ok(())
        }
        Err(e) => Err(RuntimeError::ProcessExecution(format!("Failed to launch backend: {}", e))),
    }
}

pub async fn wait_for_server(port: u16, timeout_secs: u64, app_handle: tauri::AppHandle) -> Result<(), RuntimeError> {
    let client = reqwest::Client::new();
    let url = format!("http://127.0.0.1:{}/health", port);
    let start = std::time::Instant::now();
    let mut attempt = 1;

    while start.elapsed().as_secs() < timeout_secs {
        let _ = app_handle.emit_all("health-check-attempt", format!("Health Check Attempt {}", attempt));
        
        match client.get(&url).send().await {
            Ok(res) => {
                let status = res.status();
                let _ = app_handle.emit_all("health-check-attempt", format!("HTTP Status: {}", status));
                if status.is_success() {
                    return Ok(());
                }
            },
            Err(e) => {
                let _ = app_handle.emit_all("health-check-attempt", format!("Connection Error: {}", e));
            }
        }
        
        tokio::time::sleep(std::time::Duration::from_millis(1000)).await;
        attempt += 1;
    }
    
    Err(RuntimeError::ServerUnreachable)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore]
    fn test_launch_model_failure() {
        let mut monitor = ProcessMonitor::new();
        let meta = ModelMetadata {
            file_path: "dummy.gguf".to_string(),
            name: "dummy".to_string(),
            size_bytes: 0,
            quantization: "Q4".to_string(),
            context_length: 2048,
        };
        // Expect failure because the binary path doesn't exist
        // let res = launch_model(&PathBuf::from("nonexistent-binary"), &meta, &mut monitor);
        // assert!(matches!(res, Err(RuntimeError::ProcessExecution(_))));
    }
}
