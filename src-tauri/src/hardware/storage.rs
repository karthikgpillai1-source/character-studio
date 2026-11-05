use crate::hardware::types::StorageInfo;
use sysinfo::{DiskExt, System, SystemExt};
use std::path::Path;

const BYTES_TO_GB: f64 = 1_073_741_824.0;
const WARNING_THRESHOLD_GB: f64 = 5.0; // Warn if less than 5GB free

pub fn get_storage_info(sys: &System) -> StorageInfo {
    // Find the disk that likely contains the application.
    // For this implementation, we will look for the disk containing the current executable,
    // or fallback to the first available disk if resolution fails.
    
    let current_exe = std::env::current_exe().unwrap_or_else(|_| std::path::PathBuf::from("/"));
    let mut selected_disk = sys.disks().first();

    for disk in sys.disks() {
        let mount_point = disk.mount_point();
        if current_exe.starts_with(mount_point) {
            selected_disk = Some(disk);
            break;
        }
    }

    if let Some(disk) = selected_disk {
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);

        let free_gb = available as f64 / BYTES_TO_GB;

        StorageInfo {
            drive_name: disk.name().to_string_lossy().into_owned(),
            total_capacity_gb: total as f64 / BYTES_TO_GB,
            free_capacity_gb: free_gb,
            used_capacity_gb: used as f64 / BYTES_TO_GB,
            low_space_warning: free_gb < WARNING_THRESHOLD_GB,
        }
    } else {
        StorageInfo {
            drive_name: "Unknown".to_string(),
            total_capacity_gb: 0.0,
            free_capacity_gb: 0.0,
            used_capacity_gb: 0.0,
            low_space_warning: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sysinfo::SystemExt;

    #[test]
    fn test_get_storage_info() {
        let mut sys = System::new_all();
        sys.refresh_disks_list();
        sys.refresh_disks();
        
        let storage = get_storage_info(&sys);
        // At least one disk should typically be found on a test machine
        if storage.total_capacity_gb > 0.0 {
            assert!(!storage.drive_name.is_empty());
        }
    }
}
