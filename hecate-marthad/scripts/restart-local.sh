#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Stopping hecate_marthad (if running) ==="
"${PROJECT_DIR}/_build/dev/rel/hecate_marthad/bin/hecate_marthad" stop 2>/dev/null || true
sleep 1

echo "=== Compiling ==="
cd "$PROJECT_DIR"
rebar3 compile

echo "=== Building release ==="
rebar3 release

echo "=== Starting hecate_marthad ==="
"${PROJECT_DIR}/_build/dev/rel/hecate_marthad/bin/hecate_marthad" daemon

echo "=== Waiting for socket ==="
SOCKET_PATH="${HOME}/.hecate/hecate-marthad/sockets/api.sock"
for i in $(seq 1 10); do
    if [ -S "$SOCKET_PATH" ]; then
        echo "Socket ready at: $SOCKET_PATH"
        echo "=== Health check ==="
        curl --unix-socket "$SOCKET_PATH" http://localhost/health 2>/dev/null || true
        echo ""
        exit 0
    fi
    sleep 1
done

echo "ERROR: Socket did not appear at $SOCKET_PATH"
exit 1
