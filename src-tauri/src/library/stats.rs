use crate::database::models::Model;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct LibrarySummary {
    pub total_models: usize,
    pub total_storage_bytes: u64,
    pub favorite_count: usize,
    pub recently_used: Vec<Model>,
}

pub fn get_summary(models: &[Model]) -> LibrarySummary {
    let total = models.len();
    let storage = models.iter().map(|m| m.size_bytes).sum();
    let favorites = models.iter().filter(|m| m.is_favorite).count();
    
    let mut recent = models.to_vec();
    recent.sort_by_key(|m| std::cmp::Reverse(m.last_used.unwrap_or(0)));
    let recently_used = recent.into_iter().take(5).collect();

    LibrarySummary {
        total_models: total,
        total_storage_bytes: storage,
        favorite_count: favorites,
        recently_used,
    }
}
