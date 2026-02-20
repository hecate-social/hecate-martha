#!/usr/bin/env bash
set -euo pipefail

# Deploy/update the hecate-marthad Quadlet container file to gitops
#
# Usage: ./scripts/deploy-quadlet.sh [version]
# Example: ./scripts/deploy-quadlet.sh 0.1.0

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
GITOPS_DIR="${HOME}/.hecate/gitops/apps"
QUADLET_FILE="${GITOPS_DIR}/hecate-marthad.container"

# Determine version
if [[ $# -ge 1 ]]; then
    VERSION="$1"
else
    VERSION=$(grep -oP '{vsn, "\K[0-9]+\.[0-9]+\.[0-9]+' "$REPO_ROOT/hecate-marthad/src/hecate_marthad.app.src")
    if [[ -z "$VERSION" ]]; then
        echo "Error: Could not extract version from app.src"
        exit 1
    fi
fi

IMAGE_TAG="ghcr.io/hecate-social/hecate-marthad:${VERSION}"

echo "Deploying Quadlet for ${IMAGE_TAG}"
echo "  Target: ${QUADLET_FILE}"

mkdir -p "${GITOPS_DIR}"

cat > "${QUADLET_FILE}" <<UNIT
[Unit]
Description=Hecate Martha Daemon (AI agent plugin)
After=hecate-daemon.service
Wants=hecate-daemon.service

[Container]
Image=${IMAGE_TAG}
ContainerName=hecate-marthad
AutoUpdate=registry
Network=host

# HOME=%h so convention paths (~/.hecate/...) resolve to real user home
Environment=HOME=%h

# Volume mounts — convention paths identical inside/outside
Volume=%h/.hecate/hecate-marthad:%h/.hecate/hecate-marthad:Z
Volume=%h/.hecate/hecate-daemon/sockets:%h/.hecate/hecate-daemon/sockets:ro
Volume=%h/.hecate/secrets:%h/.hecate/secrets:ro

# Health check via convention path
HealthCmd=test -S %h/.hecate/hecate-marthad/sockets/api.sock
HealthInterval=30s
HealthRetries=3
HealthTimeout=5s
HealthStartPeriod=10s

[Service]
Restart=on-failure
RestartSec=5s
TimeoutStartSec=60s

[Install]
WantedBy=default.target
UNIT

echo "Quadlet written to ${QUADLET_FILE}"
echo ""
echo "Reconciler will pick it up, or manually:"
echo "  systemctl --user daemon-reload"
echo "  systemctl --user start hecate-marthad"
