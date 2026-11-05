@echo off
echo Starting Character Studio in Validation Mode...
set VITE_APP_STARTUP_SCREEN=workbench
cd src-tauri
cargo run
