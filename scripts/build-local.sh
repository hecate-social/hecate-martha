#!/usr/bin/env bash
set -euo pipefail

# Build the hecate-martha OCI image locally for testing
# Push to ghcr.io happens via CI/CD only (GitHub Actions docker.yml)
#
# Usage: ./scripts/build-local.sh [version]
# Example: ./scripts/build-local.sh 0.1.0
#
# If version is omitted, reads from hecate-marthad/src/hecate_marthad.app.src

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="ghcr.io/hecate-social/hecate-marthad"

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

IMAGE_TAG="${IMAGE_NAME}:${VERSION}"

echo "Building ${IMAGE_TAG} (local only)..."
echo "  Context: ${REPO_ROOT}"
echo "  Dockerfile: ${REPO_ROOT}/Dockerfile"
echo ""

podman build \
    -t "${IMAGE_TAG}" \
    -f "${REPO_ROOT}/Dockerfile" \
    "${REPO_ROOT}"

echo ""
echo "Build complete: ${IMAGE_TAG}"
echo ""
echo "Image is local only. Push happens via CI/CD (git push + tag)."
