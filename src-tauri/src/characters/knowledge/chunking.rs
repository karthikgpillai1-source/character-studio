use super::types::KnowledgeChunk;
use uuid::Uuid;

pub struct Chunker {
    pub chunk_size: usize,
    pub chunk_overlap: usize,
}

impl Chunker {
    pub fn new(chunk_size: usize, chunk_overlap: usize) -> Self {
        Self { chunk_size, chunk_overlap }
    }

    pub fn chunk_text(&self, text: &str, document_id: &str, character_id: &str) -> Vec<KnowledgeChunk> {
        let mut chunks = Vec::new();
        let chars: Vec<char> = text.chars().collect();
        let len = chars.len();
        let mut i = 0;

        let advance = self.chunk_size.saturating_sub(self.chunk_overlap);
        let step = if advance == 0 { self.chunk_size } else { advance };

        while i < len {
            let end = std::cmp::min(i + self.chunk_size, len);
            let chunk_content: String = chars[i..end].iter().collect();
            
            // In Phase 3.4B we generate metadata that includes the simulated section heading.
            let mock_metadata = format!(r#"{{"section": "auto-generated-{}", "tokens": {}}}"#, i, chunk_content.len());

            chunks.push(KnowledgeChunk {
                document_id: document_id.to_string(),
                character_id: character_id.to_string(),
                chunk_id: Uuid::new_v4().to_string(),
                content: chunk_content,
                metadata: mock_metadata,
            });

            if end == len {
                break;
            }
            i += step;
        }

        chunks
    }
}
