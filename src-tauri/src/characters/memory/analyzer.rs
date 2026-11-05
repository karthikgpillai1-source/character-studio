use super::types::{MemoryRecord, MemoryType};
use uuid::Uuid;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct MemoryAnalyzer;

impl MemoryAnalyzer {
    pub fn extract_candidate_memories(user_message: &str, _assistant_response: &str) -> Vec<MemoryRecord> {
        let mut candidates = Vec::new();
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs() as i64;
        
        // In Phase 3.3B we mock the LLM's automatic fact extraction.
        // If the user's message is long enough, we pretend to extract a fact.
        if user_message.len() > 15 {
            let extracted_content = format!("User expressed: '{}'", user_message.trim());
            let importance = ImportanceEngine::score(&extracted_content);
            
            candidates.push(MemoryRecord {
                id: Uuid::new_v4().to_string(),
                character_id: "pending".to_string(),
                content: extracted_content,
                importance,
                source: "Auto-Extraction".to_string(),
                created_at: now,
                last_accessed: now,
                memory_type: MemoryType::ShortTerm,
            });
        }
        
        candidates
    }
}

pub struct ImportanceEngine;

impl ImportanceEngine {
    pub fn score(content: &str) -> u8 {
        let content_lower = content.to_lowercase();
        let mut score = 30; // base score

        // Mock heuristic scoring for Phase 3.3B
        if content_lower.contains("i love") || content_lower.contains("i hate") {
            score += 40; // High emotional weight
        }
        if content_lower.contains("always") || content_lower.contains("never") {
            score += 20; // Strong explicit statements
        }
        if content_lower.contains("project") || content_lower.contains("goal") {
            score += 35; // Future relevance
        }

        std::cmp::min(score, 100)
    }
}
