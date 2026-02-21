#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Rebuilding hecate-marthad ==="
echo "Project: $PROJECT_DIR"

cd "$PROJECT_DIR"

echo ""
echo "--- Cleaning build artifacts ---"
rebar3 clean --all

echo ""
echo "--- Fetching dependencies ---"
rebar3 get-deps

echo ""
echo "--- Compiling ---"
rebar3 compile

echo ""
echo "--- Building release ---"
rebar3 release

echo ""
echo "=== Build complete ==="
echo "Start with: $PROJECT_DIR/scripts/start-marthad.sh"
