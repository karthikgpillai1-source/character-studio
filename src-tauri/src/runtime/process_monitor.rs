use std::process::Child;
use std::time::Instant;

pub struct ProcessMonitor {
    pub child: Option<Child>,
    pub start_time: Option<Instant>,
    pub exit_code: Option<i32>,
    pub exit_reason: Option<String>,
}

impl ProcessMonitor {
    pub fn new() -> Self {
        Self {
            child: None,
            start_time: None,
            exit_code: None,
            exit_reason: None,
        }
    }

    pub fn set_child(&mut self, child: Child) {
        self.child = Some(child);
        self.start_time = Some(Instant::now());
    }

    pub fn is_running(&mut self) -> bool {
        if let Some(ref mut child) = self.child {
            match child.try_wait() {
                Ok(Some(status)) => {
                    self.exit_code = status.code();
                    self.exit_reason = Some(if status.success() { "Clean Exit".to_string() } else { format!("Failed with code {:?}", status.code()) });
                    false
                },
                Ok(None) => true,
                Err(e) => {
                    self.exit_reason = Some(format!("Error waiting: {}", e));
                    false
                },
            }
        } else {
            false
        }
    }

    pub fn kill(&mut self) -> Result<(), std::io::Error> {
        if let Some(ref mut child) = self.child {
            let res = child.kill();
            let _ = child.wait(); // Reap zombie
            self.child = None;
            res
        } else {
            Ok(())
        }
    }

    pub fn uptime_seconds(&self) -> u64 {
        if let Some(start) = self.start_time {
            start.elapsed().as_secs()
        } else {
            0
        }
    }
}

impl Drop for ProcessMonitor {
    fn drop(&mut self) {
        let _ = self.kill();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::process::Command;

    #[test]
    fn test_process_monitor() {
        let mut monitor = ProcessMonitor::new();
        assert!(!monitor.is_running());
        
        let child = if std::env::consts::OS == "windows" {
            Command::new("cmd").args(&["/C", "timeout 1"]).spawn().unwrap()
        } else {
            Command::new("sleep").arg("1").spawn().unwrap()
        };
        
        monitor.set_child(child);
        assert!(monitor.is_running());
        monitor.kill().unwrap();
        assert!(!monitor.is_running());
    }
}
