use super::types::{RetrievalResult, RerankedChunk, Citation};

pub struct RerankingEngine;

impl RerankingEngine {
    pub fn rerank_and_deduplicate(results: Vec<RetrievalResult>) -> Vec<RerankedChunk> {
        let mut reranked = Vec::new();
        let mut seen_chunks = std::collections::HashSet::new();

        for res in results {
            if seen_chunks.insert(res.chunk.content.clone()) {
                // Determine mock section based on metadata
                let section_str = res.chunk.metadata.clone(); // In reality parse JSON
                
                let citation = Citation {
                    document_name: res.chunk.document_id.clone(), // Should lookup real name
                    chunk_id: res.chunk.chunk_id.clone(),
                    confidence: res.confidence_score,
                };
                
                reranked.push(RerankedChunk {
                    chunk: res.chunk,
                    score: res.confidence_score,
                    citation,
                });
            }
        }

        // Final sanity sort
        reranked.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        reranked
    }
}
