use super::types::RerankedChunk;

pub struct ContextCompressor;

impl ContextCompressor {
    pub fn build_knowledge_prompt(chunks: &[RerankedChunk], max_tokens: usize) -> String {
        let mut block = String::from("\n<knowledge_context>\n");
        block.push_str("You have access to the following domain knowledge:\n\n");

        let mut current_length = 0;

        for res in chunks {
            // Rough character to token estimation (approx 4 chars per token)
            let estimated_tokens = res.chunk.content.len() / 4;
            
            if current_length + estimated_tokens > max_tokens {
                break; // Enforce budget
            }
            
            block.push_str(&format!("--- [Source: {} | Confidence: {:.2}] ---\n", res.citation.document_name, res.citation.confidence));
            block.push_str(&res.chunk.content);
            block.push_str("\n\n");
            
            current_length += estimated_tokens;
        }

        block.push_str("</knowledge_context>\n");
        block
    }
}
