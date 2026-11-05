use super::types::{MemoryRecord, MemoryType};
use std::time::{SystemTime, UNIX_EPOCH};

pub struct SemanticRetrieval;

impl SemanticRetrieval {
    pub fn retrieve(memories: &mut Vec<MemoryRecord>, query: &str) -> Vec<MemoryRecord> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        
        // In Phase 3.3B, we simulate the logic of a hybrid vector/keyword/recency search
        let mut scored_mems = memories.iter_mut().map(|m| {
            let mut score = m.importance as f64;
            
            // Mock Cosine Similarity
            if m.content.to_lowercase().contains(&query.to_lowercase()) {
                score += 75.0; // High simulated similarity
            } else if query.len() > 10 && m.content.len() > 10 {
                score += 15.0; // Base baseline similarity 
            }
            
            // Recency penalty (0.5 points per hour old)
            let hours_old = (now - m.created_at) as f64 / 3600.0;
            if m.memory_type != MemoryType::Pinned && m.memory_type != MemoryType::System {
                score -= hours_old * 0.5;
            }

            // Pinned/System override
            if m.memory_type == MemoryType::Pinned { score += 100.0; }
            if m.memory_type == MemoryType::System { score += 200.0; }

            (score, m.clone())
        }).collect::<Vec<(f64, MemoryRecord)>>();

        scored_mems.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        
        // Keep top 10 for context
        scored_mems.into_iter().take(10).map(|(_, m)| m).collect()
    }
}
