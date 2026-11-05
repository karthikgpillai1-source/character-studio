pub mod capabilities;
pub mod cpu;
pub mod gpu;
pub mod memory;
pub mod recommendations;
pub mod storage;
pub mod types;

use std::sync::Mutex;
use sysinfo::{System, SystemExt};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::State;
use types::{HardwareSnapshot, RecommendationInfo};

pub struct HardwareService {
    sys: Mutex<System>,
    last_snapshot: Mutex<Option<HardwareSnapshot>>,
}

impl HardwareService {
    pub fn new() -> Self {
        let mut sys = System::new_all();
        sys.refresh_all();
        Self {
            sys: Mutex::new(sys),
            last_snapshot: Mutex::new(None),
        }
    }

    pub fn generate_snapshot(&self) -> HardwareSnapshot {
        let mut sys = self.sys.lock().unwrap();
        // Refresh specific components to keep it fast
        sys.refresh_cpu();
        sys.refresh_memory();
        sys.refresh_disks();

        let cpu_info = cpu::get_cpu_info(&sys);
        let mem_info = memory::get_memory_info(&sys);
        let storage_info = storage::get_storage_info(&sys);
        let gpus = gpu::get_gpu_info();
        
        let caps = capabilities::detect_capabilities(&cpu_info, &gpus);

        // Find max VRAM for recommendations
        let max_vram = gpus.iter().map(|g| g.vram_total_gb).fold(0.0, f64::max);
        let recs = recommendations::generate_recommendations(&mem_info, &caps, max_vram);

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let snapshot = HardwareSnapshot {
            cpu: cpu_info,
            memory: mem_info,
            storage: storage_info,
            gpus,
            capabilities: caps,
            recommendations: recs,
            timestamp,
        };

        *self.last_snapshot.lock().unwrap() = Some(snapshot.clone());
        snapshot
    }

    pub fn get_snapshot(&self) -> HardwareSnapshot {
        let guard = self.last_snapshot.lock().unwrap();
        if let Some(snapshot) = &*guard {
            snapshot.clone()
        } else {
            drop(guard);
            self.generate_snapshot()
        }
    }
}

// Default implementation
impl Default for HardwareService {
    fn default() -> Self {
        Self::new()
    }
}

use std::sync::Arc;

#[tauri::command]
pub fn get_hardware_snapshot(state: State<'_, Arc<HardwareService>>) -> Result<HardwareSnapshot, String> {
    Ok(state.get_snapshot())
}

#[tauri::command]
pub fn refresh_hardware_snapshot(state: State<'_, Arc<HardwareService>>) -> Result<HardwareSnapshot, String> {
    Ok(state.generate_snapshot())
}

#[tauri::command]
pub fn get_hardware_recommendations(state: State<'_, Arc<HardwareService>>) -> Result<RecommendationInfo, String> {
    Ok(state.get_snapshot().recommendations)
}
