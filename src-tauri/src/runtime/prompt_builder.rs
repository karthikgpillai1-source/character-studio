pub struct PromptContext {
    pub system_prompt: Option<String>,
    pub memory_context: Option<String>,
    pub knowledge_context: Option<String>,
    pub character_context: Option<String>,
    pub user_message: String,
    pub history: Option<Vec<crate::database::models::Message>>,
}

const DEFAULT_SYSTEM_PROMPT: &str = r#"
You are a helpful and intelligent AI assistant. 
Provide accurate, concise, and context-aware answers. 
Engage naturally in conversation.
"#;

pub fn build_prompt(ctx: &PromptContext) -> String {
    let mut prompt = String::new();

    // <|im_start|>system
    prompt.push_str("<|im_start|>system\n");
    
    // Core system prompt
    if let Some(ref sys) = ctx.system_prompt {
        prompt.push_str(sys.trim());
    } else {
        prompt.push_str(DEFAULT_SYSTEM_PROMPT.trim());
    }
    
    prompt.push('\n');

    // Context blocks
    if let Some(ref memory) = ctx.memory_context {
        prompt.push_str("\nMemory Context:\n");
        prompt.push_str(memory.trim());
        prompt.push('\n');
    }

    if let Some(ref knowledge) = ctx.knowledge_context {
        prompt.push_str("\nKnowledge Context:\n");
        prompt.push_str(knowledge.trim());
        prompt.push('\n');
    }

    if let Some(ref char_ctx) = ctx.character_context {
        prompt.push_str("\nCharacter Context:\n");
        prompt.push_str(char_ctx.trim());
        prompt.push('\n');
    }

    prompt.push_str("<|im_end|>\n");

    // Conversation History
    if let Some(ref history) = ctx.history {
        for msg in history {
            // We only format user and assistant roles; skip system if it's stored
            if msg.role == "user" {
                prompt.push_str(&format!("<|im_start|>user\n{}\n<|im_end|>\n", msg.content.trim()));
            } else if msg.role == "assistant" {
                prompt.push_str(&format!("<|im_start|>assistant\n{}\n<|im_end|>\n", msg.content.trim()));
            }
        }
    }

    // <|im_start|>user
    prompt.push_str("<|im_start|>user\n");
    prompt.push_str(ctx.user_message.trim());
    prompt.push_str("\n<|im_end|>\n");

    // <|im_start|>assistant
    prompt.push_str("<|im_start|>assistant\n");

    prompt
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_prompt_empty_contexts() {
        let ctx = PromptContext {
            system_prompt: None,
            memory_context: None,
            knowledge_context: None,
            character_context: None,
            user_message: "Hello".to_string(),
        };

        let result = build_prompt(&ctx);
        assert!(result.contains("<|im_start|>system\nYou are a helpful AI assistant"));
        assert!(result.contains("<|im_start|>user\nHello\n<|im_end|>"));
        assert!(result.contains("<|im_start|>assistant\n"));
        assert!(!result.contains("Memory Context:"));
        assert!(!result.contains("Knowledge Context:"));
        assert!(!result.contains("Character Context:"));
    }

    #[test]
    fn test_build_prompt_with_contexts() {
        let ctx = PromptContext {
            system_prompt: Some("Custom system.".to_string()),
            memory_context: Some("Has memory.".to_string()),
            knowledge_context: Some("Has knowledge.".to_string()),
            character_context: Some("Has character.".to_string()),
            user_message: "Hello".to_string(),
        };

        let result = build_prompt(&ctx);
        assert!(result.contains("<|im_start|>system\nCustom system."));
        assert!(result.contains("Memory Context:\nHas memory."));
        assert!(result.contains("Knowledge Context:\nHas knowledge."));
        assert!(result.contains("Character Context:\nHas character."));
        assert!(result.contains("<|im_end|>\n"));
        assert!(result.contains("<|im_start|>user\nHello\n<|im_end|>"));
    }
}
