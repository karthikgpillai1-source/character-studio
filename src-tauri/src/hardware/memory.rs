use crate::hardware::types::MemoryInfo;
use sysinfo::{System, SystemExt};

const KB_TO_GB: f64 = 1_048_576.0; // sysinfo v0.29 returns sizes in KB by default for get_total_memory, wait, sysinfo 0.29 uses bytes. Let's check sysinfo 0.29 documentation. 
// Actually, sysinfo 0.29 uses bytes.
const BYTES_TO_GB: f64 = 1_073_741_824.0;
const BYTES_TO_MB: f64 = 1_048_576.0;

pub fn bytes_to_gb(bytes: u64) -> f64 {
    bytes as f64 / BYTES_TO_GB
}

pub fn bytes_to_mb(bytes: u64) -> f64 {
    bytes as f64 / BYTES_TO_MB
}

pub fn get_memory_info(sys: &System) -> MemoryInfo {
    let total = sys.total_memory();
    let available = sys.available_memory();
    let used = sys.used_memory();

    let total_gb = bytes_to_gb(total);
    let available_gb = bytes_to_gb(available);
    let used_gb = bytes_to_gb(used);

    let utilization = if total > 0 {
        (used as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    MemoryInfo {
        total_ram_gb: total_gb,
        available_ram_gb: available_gb,
        used_ram_gb: used_gb,
        utilization_percent: utilization,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sysinfo::SystemExt;

    #[test]
    fn test_memory_conversion() {
        assert_eq!(bytes_to_gb(1_073_741_824), 1.0);
        assert_eq!(bytes_to_mb(1_048_576), 1.0);
    }

    #[test]
    fn test_get_memory_info() {
        let mut sys = System::new_all();
        sys.refresh_memory();
        let mem_info = get_memory_info(&sys);
        
        assert!(mem_info.total_ram_gb > 0.0);
        assert!(mem_info.utilization_percent >= 0.0 && mem_info.utilization_percent <= 100.0);
    }
}
