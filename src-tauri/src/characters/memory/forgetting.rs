use super::types::{MemoryRecord, MemoryType};
use std::time::{SystemTime, UNIX_EPOCH};

pub struct DecayEngine;

impl DecayEngine {
    pub fn process_decay(memories: &mut Vec<MemoryRecord>) {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        
        for m in memories.iter_mut() {
            if m.memory_type == MemoryType::Pinned || m.memory_type == MemoryType::System {
                continue;
            }

            let days_since_access = (now - m.last_accessed) / 86400;
            if days_since_access > 3 {
                // Decay importance by 5 for every 3 days untouched
                let penalty = (days_since_access / 3) * 5;
                m.importance = m.importance.saturating_sub(penalty as u8);
            }
        }

        // Prune memories that have completely decayed
        memories.retain(|m| m.importance > 10 || m.memory_type == MemoryType::Pinned || m.memory_type == MemoryType::System);
    }
}
