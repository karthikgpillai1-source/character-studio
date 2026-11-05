use std::fmt;

#[derive(Debug)]
pub enum RuntimeError {
    Io(std::io::Error),
    GgufParse(String),
    BackendNotSupported(String),
    ProcessExecution(String),
    ModelAlreadyLoaded,
    ModelNotLoaded,
    InvalidConfiguration(String),
    HttpError(String),
    ServerUnreachable,
}

impl fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(e) => write!(f, "IO Error: {}", e),
            Self::GgufParse(s) => write!(f, "GGUF Parse Error: {}", s),
            Self::BackendNotSupported(s) => write!(f, "Backend not supported: {}", s),
            Self::ProcessExecution(s) => write!(f, "Process execution error: {}", s),
            Self::ModelAlreadyLoaded => write!(f, "A model is already loaded. Please unload it first."),
            Self::ModelNotLoaded => write!(f, "No model is currently loaded."),
            Self::InvalidConfiguration(s) => write!(f, "Invalid configuration: {}", s),
            Self::HttpError(s) => write!(f, "HTTP Error: {}", s),
            Self::ServerUnreachable => write!(f, "Local inference server is unreachable. Process may have crashed."),
        }
    }
}

impl std::error::Error for RuntimeError {}

impl From<std::io::Error> for RuntimeError {
    fn from(error: std::io::Error) -> Self {
        RuntimeError::Io(error)
    }
}

impl serde::Serialize for RuntimeError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
