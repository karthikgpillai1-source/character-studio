use super::types::MemoryRecord;

pub struct ContextBuilder;

impl ContextBuilder {
    pub fn build_context_block(retrieved_memories: &[MemoryRecord]) -> String {
        if retrieved_memories.is_empty() {
            return String::new();
        }

        let mut block = String::from("\n<memory_context>\n");
        block.push_str("You have the following relevant memories to draw upon:\n\n");
        
        for mem in retrieved_memories {
            block.push_str(&format!("- [{}] {}\n", mem.memory_type.as_str().to_uppercase(), mem.content));
        }
        
        block.push_str("</memory_context>\n");
        block
    }
}
