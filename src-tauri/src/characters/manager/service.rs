use std::sync::{Arc, Mutex};
use super::repository::CharacterRepository;
use super::types::{Character, CreateCharacterRequest};

pub struct CharacterManager {
    repository: Arc<Mutex<CharacterRepository>>,
}

impl CharacterManager {
    pub fn new(db_path: &str) -> Result<Self, String> {
        let repo = CharacterRepository::new(db_path).map_err(|e| e.to_string())?;
        Ok(Self {
            repository: Arc::new(Mutex::new(repo)),
        })
    }

    pub fn create_character(&self, req: CreateCharacterRequest) -> Result<Character, String> {
        let repo = self.repository.lock().unwrap();
        repo.create_character(req).map_err(|e| e.to_string())
    }

    pub fn get_characters(&self) -> Result<Vec<Character>, String> {
        let repo = self.repository.lock().unwrap();
        repo.get_characters().map_err(|e| e.to_string())
    }

    pub fn delete_character(&self, id: &str) -> Result<(), String> {
        let repo = self.repository.lock().unwrap();
        repo.delete_character(id).map_err(|e| e.to_string())
    }
}
