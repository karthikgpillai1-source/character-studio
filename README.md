# Character Studio

Character Studio is an offline-first AI character and local model management platform built with Tauri (Rust) and React/TypeScript.

## Features
- **Local GGUF Discovery:** Automatically detects and validates local GGUF models.
- **Real-time SSE Streaming:** Live streaming responses powered by `llama.cpp` (`llama-server`).
- **Hardware Diagnostics:** Real-time VRAM, RAM, and GPU load monitoring.
- **Persona Management:** SQLite-backed character profiles and dialogue constraints.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Rust, Tauri
- **Runtime:** `llama.cpp` sidecar
- **Database:** SQLite

## Prerequisites
- Node.js 18+ and `npm`
- Rust toolchain (`cargo`, `rustc`)
- Local `llama.cpp` binary (`llama-server.exe`)

## Quickstart

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Models:**
   Place your GGUF models into `src-tauri/data/models/`.

3. **Run in Development:**
   ```bash
   npm run tauri dev
   ```

4. **Build Production Binary:**
   ```bash
   npm run tauri build
   ```
