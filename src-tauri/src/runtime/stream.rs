use crate::runtime::errors::RuntimeError;
use crate::runtime::types::{GenerationRequest, StreamUpdate, LlamaCompletionRequest, LlamaCompletionChunk, PromptAssemblyDiag};
use crate::runtime::prompt_builder::{PromptContext, build_prompt};
use tauri::Window;
use reqwest::Client;
use eventsource_stream::Eventsource;
use futures_util::StreamExt;

pub async fn stream_text(
    window: Window,
    request: GenerationRequest,
    history: Option<Vec<crate::database::models::Message>>,
) -> Result<(), RuntimeError> {
    let client = Client::new();
    
    let prompt_ctx = PromptContext {
        system_prompt: None,
        memory_context: None,
        knowledge_context: None,
        character_context: None,
        user_message: request.prompt.clone(),
        history,
    };

    let final_prompt = build_prompt(&prompt_ctx);

    let diag = PromptAssemblyDiag {
        system: prompt_ctx.system_prompt.is_some(),
        memory: prompt_ctx.memory_context.is_some(),
        knowledge: prompt_ctx.knowledge_context.is_some(),
        character: prompt_ctx.character_context.is_some(),
        final_length: final_prompt.len(),
    };

    let _ = window.emit("prompt-assembly-stage", diag);

    let payload = LlamaCompletionRequest {
        prompt: final_prompt,
        temperature: request.temperature,
        n_predict: request.max_tokens,
        top_p: request.top_p,
        top_k: request.top_k,
        repeat_penalty: request.repeat_penalty,
        stop: request.stop_sequences,
        stream: true,
    };

    if let Ok(json_str) = serde_json::to_string_pretty(&payload) {
        let _ = window.emit("raw-request-payload", json_str);
    }

    let response = client.post("http://127.0.0.1:8080/completion")
        .json(&payload)
        .send()
        .await
        .map_err(|_| RuntimeError::HttpError(r#"{"error": "Inference failed"}"#.to_string()))?;

    if !response.status().is_success() {
        return Err(RuntimeError::HttpError(r#"{"error": "Inference failed"}"#.to_string()));
    }

    let mut stream = response.bytes_stream().eventsource();

    while let Some(event) = stream.next().await {
        match event {
            Ok(ev) => {
                let data = ev.data;
                let _ = window.emit("raw-sse-payload", &data);
                if data == "[DONE]" {
                    break;
                }
                
                if let Ok(chunk) = serde_json::from_str::<LlamaCompletionChunk>(&data) {
                    let update = StreamUpdate {
                        token: chunk.content,
                        is_finished: chunk.stop,
                    };
                    
                    if window.emit("generation-token", update).is_err() {
                        // Client disconnected, abort generation
                        break;
                    }
                    
                    if chunk.stop {
                        break;
                    }
                }
            }
            Err(e) => {
                return Err(RuntimeError::HttpError(format!("Stream error: {}", e)));
            }
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stream_interface() {
        let req = GenerationRequest {
            prompt: "Hello world".to_string(),
            temperature: 0.7,
            max_tokens: 50,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1,
            stop_sequences: vec![],
        };
        assert_eq!(req.prompt, "Hello world");
    }
}
