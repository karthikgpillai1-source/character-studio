use rusqlite::Error as RusqliteError;
use std::fmt;

#[derive(Debug)]
pub enum DatabaseError {
    Connection(String),
    Query(String),
    Migration(String),
    NotFound(String),
}

impl fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Connection(msg) => write!(f, "Database connection error: {}", msg),
            Self::Query(msg) => write!(f, "Database query error: {}", msg),
            Self::Migration(msg) => write!(f, "Database migration error: {}", msg),
            Self::NotFound(msg) => write!(f, "Record not found: {}", msg),
        }
    }
}

impl std::error::Error for DatabaseError {}

impl From<RusqliteError> for DatabaseError {
    fn from(err: RusqliteError) -> Self {
        match err {
            RusqliteError::QueryReturnedNoRows => DatabaseError::NotFound("No rows returned".to_string()),
            _ => DatabaseError::Query(err.to_string()),
        }
    }
}

impl From<std::io::Error> for DatabaseError {
    fn from(err: std::io::Error) -> Self {
        DatabaseError::Connection(err.to_string())
    }
}

impl serde::Serialize for DatabaseError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
