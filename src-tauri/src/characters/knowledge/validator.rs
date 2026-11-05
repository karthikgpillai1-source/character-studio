pub struct KnowledgeValidator;

impl KnowledgeValidator {
    pub fn is_supported_type(ext: &str) -> bool {
        matches!(ext.to_lowercase().as_str(), "pdf" | "txt" | "md" | "json" | "docx")
    }
}
