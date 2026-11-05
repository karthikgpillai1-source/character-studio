pub const SCHEMA_MIGRATIONS: [&str; 9] = [
    r#"
    -- Settings Table
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
    );

    -- Models Table
    CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT UNIQUE NOT NULL,
        size_bytes INTEGER NOT NULL,
        quantization TEXT NOT NULL,
        context_length INTEGER NOT NULL,
        backend TEXT,
        last_used INTEGER,
        created_at INTEGER NOT NULL
    );

    -- Conversations Table
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );

    -- Messages Table
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        token_count INTEGER,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
    );

    -- Runtime History Table
    CREATE TABLE IF NOT EXISTS runtime_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER NOT NULL,
        backend TEXT NOT NULL,
        tokens_per_second REAL NOT NULL,
        generation_time INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (model_id) REFERENCES models (id) ON DELETE CASCADE
    );
    "#,
    r#"
    ALTER TABLE models ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT 0;
    "#,
    r#"
    -- Characters Phase 3.1
    CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        avatar TEXT NOT NULL,
        assigned_model TEXT,
        category TEXT NOT NULL,
        creator TEXT NOT NULL,
        is_favorite BOOLEAN NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS character_tags (
        character_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
        UNIQUE (character_id, tag)
    );
    CREATE TABLE IF NOT EXISTS character_models (
        character_id TEXT NOT NULL,
        model_id INTEGER NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
        FOREIGN KEY (model_id) REFERENCES models (id) ON DELETE CASCADE,
        UNIQUE (character_id, model_id)
    );
    "#,
    r#"
    -- DNA System Phase 3.2
    CREATE TABLE IF NOT EXISTS character_dna (
        character_id TEXT PRIMARY KEY,
        personality_curiosity INTEGER NOT NULL,
        personality_confidence INTEGER NOT NULL,
        personality_humor INTEGER NOT NULL,
        personality_empathy INTEGER NOT NULL,
        personality_patience INTEGER NOT NULL,
        personality_creativity INTEGER NOT NULL,
        personality_formality INTEGER NOT NULL,
        
        reasoning_analytical INTEGER NOT NULL,
        reasoning_scientific INTEGER NOT NULL,
        reasoning_strategic INTEGER NOT NULL,
        reasoning_creative INTEGER NOT NULL,
        reasoning_pragmatic INTEGER NOT NULL,
        reasoning_emotional INTEGER NOT NULL,
        reasoning_educational INTEGER NOT NULL,
        
        comm_verbosity INTEGER NOT NULL,
        comm_tone TEXT NOT NULL,
        comm_vocab_complexity INTEGER NOT NULL,
        comm_humor_level INTEGER NOT NULL,
        comm_directness INTEGER NOT NULL,
        
        emotion_optimism INTEGER NOT NULL,
        emotion_calmness INTEGER NOT NULL,
        emotion_aggression INTEGER NOT NULL,
        emotion_sensitivity INTEGER NOT NULL,
        emotion_resilience INTEGER NOT NULL,
        
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS character_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL,
        name TEXT NOT NULL,
        priority INTEGER NOT NULL,
        description TEXT NOT NULL,
        behavioral_impact TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES character_dna (character_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS character_knowledge (
        character_id TEXT NOT NULL,
        domain_type TEXT NOT NULL, -- 'allowed', 'restricted', 'expertise'
        domain_value TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES character_dna (character_id) ON DELETE CASCADE
    );
    "#,
    r#"
    -- Memory System Phase 3.3
    CREATE TABLE IF NOT EXISTS character_memories (
        id TEXT PRIMARY KEY,
        character_id TEXT NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER NOT NULL,
        source TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_accessed INTEGER NOT NULL,
        memory_type TEXT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS memory_embeddings (
        memory_id TEXT NOT NULL,
        embedding_blob BLOB,
        FOREIGN KEY (memory_id) REFERENCES character_memories (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS memory_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (memory_id) REFERENCES character_memories (id) ON DELETE CASCADE
    );
    "#,
    r#"
    -- Knowledge Base System Phase 3.4
    CREATE TABLE IF NOT EXISTS knowledge_documents (
        id TEXT PRIMARY KEY,
        character_id TEXT NOT NULL,
        name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
        chunk_id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES knowledge_documents (id) ON DELETE CASCADE,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS knowledge_embeddings (
        chunk_id TEXT NOT NULL,
        embedding_blob BLOB,
        FOREIGN KEY (chunk_id) REFERENCES knowledge_chunks (chunk_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS knowledge_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (document_id) REFERENCES knowledge_documents (id) ON DELETE CASCADE
    );
    "#,
    r#"
    -- Phase 3.3B: Production Memory System
    CREATE TABLE IF NOT EXISTS memory_clusters (
        id TEXT PRIMARY KEY,
        character_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS memory_cluster_links (
        cluster_id TEXT NOT NULL,
        memory_id TEXT NOT NULL,
        FOREIGN KEY (cluster_id) REFERENCES memory_clusters (id) ON DELETE CASCADE,
        FOREIGN KEY (memory_id) REFERENCES character_memories (id) ON DELETE CASCADE,
        UNIQUE(cluster_id, memory_id)
    );
    CREATE TABLE IF NOT EXISTS memory_summaries (
        id TEXT PRIMARY KEY,
        character_id TEXT NOT NULL,
        summary_content TEXT NOT NULL,
        importance INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS memory_access_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_id TEXT NOT NULL,
        access_time INTEGER NOT NULL,
        FOREIGN KEY (memory_id) REFERENCES character_memories (id) ON DELETE CASCADE
    );
    "#,
    r#"
    -- Phase 3.4B: Production Knowledge Base System
    CREATE TABLE IF NOT EXISTS knowledge_index (
        chunk_id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        vector_data BLOB NOT NULL,
        metadata_json TEXT NOT NULL,
        FOREIGN KEY (chunk_id) REFERENCES knowledge_chunks (chunk_id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS knowledge_retrieval_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        character_id TEXT NOT NULL,
        top_chunk_id TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        timestamp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS knowledge_statistics (
        character_id TEXT PRIMARY KEY,
        document_count INTEGER NOT NULL DEFAULT 0,
        chunk_count INTEGER NOT NULL DEFAULT 0,
        storage_bytes INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE
    );
    "#,
    r#"
    -- Phase 5.1A: Recipe System
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        recipe_path TEXT NOT NULL,
        avatar_path TEXT,
        identity_score INTEGER NOT NULL DEFAULT 0,
        personality_score INTEGER NOT NULL DEFAULT 0,
        knowledge_score INTEGER NOT NULL DEFAULT 0,
        recipe_hash TEXT NOT NULL,
        recipe_format TEXT NOT NULL,
        recipe_engine_version TEXT NOT NULL,
        character_type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );
    "#,
];
