use std::sync::{Arc, Mutex};
use super::repository::MemoryRepository;
use super::types::{MemoryRecord, CreateMemoryRequest};

pub struct MemoryManager {
    repository: Arc<Mutex<MemoryRepository>>,
}

impl MemoryManager {
    pub fn new(db_path: &str) -> Result<Self, String> {
        let repo = MemoryRepository::new(db_path).map_err(|e| e.to_string())?;
        Ok(Self {
            repository: Arc::new(Mutex::new(repo)),
        })
    }

    pub fn create_memory(&self, req: CreateMemoryRequest) -> Result<MemoryRecord, String> {
        let repo = self.repository.lock().unwrap();
        repo.create_memory(req).map_err(|e| e.to_string())
    }

    pub fn get_memories(&self, character_id: &str) -> Result<Vec<MemoryRecord>, String> {
        let repo = self.repository.lock().unwrap();
        repo.get_memories(character_id).map_err(|e| e.to_string())
    }

    pub fn pin_memory(&self, id: &str) -> Result<(), String> {
        let repo = self.repository.lock().unwrap();
        repo.update_memory_type(id, "pinned").map_err(|e| e.to_string())
    }

    pub fn delete_memory(&self, id: &str) -> Result<(), String> {
        let repo = self.repository.lock().unwrap();
        repo.delete_memory(id).map_err(|e| e.to_string())
    }
}
