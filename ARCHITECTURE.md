# Character Studio Architecture

## Frontend

React
TypeScript
Vite

Modules:

- Dashboard
- Runtime Workbench
- Character Manager
- Settings

---

## Backend

Rust
Tauri

Modules:

- Runtime Manager
- Hardware Service
- Model Service
- Database Service

---

## Runtime Layer

llama.cpp

Flow:

UI
↓
Tauri Command
↓
Runtime Manager
↓
llama-server
↓
SSE Stream
↓
Frontend

---

## Storage

SQLite

Tables:

- settings
- models
- conversations
- messages
- runtime_history

---

## Model Discovery

GGUF Files
↓
Scanner
↓
Validator
↓
Database Sync
↓
UI Selection
