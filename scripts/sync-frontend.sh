#!/usr/bin/env bash
set -euo pipefail

# Build hecate-marthaw and copy component.js into marthad's priv/static/
# For local dev — the Docker build handles this automatically
#
# Usage: ./scripts/sync-frontend.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$REPO_ROOT/hecate-marthaw"
DIST_FILE="$FRONTEND_DIR/dist/component.js"

# Find the priv/static dir in the local release
PRIV_STATIC=$(find "$REPO_ROOT/hecate-marthad/_build" -path "*/hecate_marthad-*/priv/static" -type d 2>/dev/null | head -1)

if [[ -z "$PRIV_STATIC" ]]; then
    echo "Error: No marthad release found. Run 'rebar3 release' first."
    exit 1
fi

echo "Building frontend..."
(cd "$FRONTEND_DIR" && npm run build:lib)

echo "Copying component.js -> $PRIV_STATIC/"
cp "$DIST_FILE" "$PRIV_STATIC/component.js"

echo "Done. Marthad will serve the new component.js immediately (no restart needed)."
