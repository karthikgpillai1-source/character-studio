pub trait EmbeddingsProvider {
    fn generate_embedding(text: &str) -> Result<Vec<f32>, String>;
}

// Struct to hold future local embedding models (e.g. all-MiniLM-L6-v2)
pub struct LocalEmbedder;

impl EmbeddingsProvider for LocalEmbedder {
    fn generate_embedding(_text: &str) -> Result<Vec<f32>, String> {
        // Mock returning a dummy vector until integrated with an ML backend in future phase
        Ok(vec![0.0; 384]) 
    }
}
