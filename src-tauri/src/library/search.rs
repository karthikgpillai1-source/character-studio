use crate::database::models::Model;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct FilterCriteria {
    pub quantization: Option<String>,
    pub max_size_bytes: Option<u64>,
    pub min_context: Option<u32>,
    pub favorites_only: Option<bool>,
}

pub fn search_models(models: &[Model], query: &str) -> Vec<Model> {
    let query = query.to_lowercase();
    models
        .iter()
        .filter(|m| {
            m.name.to_lowercase().contains(&query) || 
            m.quantization.to_lowercase().contains(&query)
        })
        .cloned()
        .collect()
}

pub fn filter_models(models: &[Model], criteria: &FilterCriteria) -> Vec<Model> {
    models
        .iter()
        .filter(|m| {
            let mut matches = true;
            if let Some(ref q) = criteria.quantization {
                matches &= &m.quantization == q;
            }
            if let Some(size) = criteria.max_size_bytes {
                matches &= m.size_bytes <= size;
            }
            if let Some(ctx) = criteria.min_context {
                matches &= m.context_length >= ctx;
            }
            if let Some(true) = criteria.favorites_only {
                matches &= m.is_favorite;
            }
            matches
        })
        .cloned()
        .collect()
}
