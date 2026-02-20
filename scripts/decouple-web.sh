#!/usr/bin/env bash
set -euo pipefail

# Decouple Martha from hecate-web
#
# ONLY run after Martha standalone is proven working.
# This removes DevOps Studio components, stores, and routes.

WEB_DIR="${1:-/home/rl/work/github.com/hecate-social/hecate-web}"

if [[ ! -d "$WEB_DIR/src" ]]; then
    echo "Error: $WEB_DIR does not look like hecate-web"
    exit 1
fi

echo "=== Decoupling Martha from hecate-web ==="
echo "Target: $WEB_DIR"
echo ""

# 1. Delete DevOps routes
echo "1. Removing DevOps routes..."
rm -rf "$WEB_DIR/src/routes/devops"
echo "   Deleted src/routes/devops/"

# 2. Delete DevOps components
echo "2. Removing DevOps components..."
rm -rf "$WEB_DIR/src/lib/components/devops"
echo "   Deleted src/lib/components/devops/"

# 3. Delete DevOps store + agents store
echo "3. Removing DevOps stores..."
rm -f "$WEB_DIR/src/lib/stores/devops.ts"
rm -f "$WEB_DIR/src/lib/stores/agents.ts"
echo "   Deleted devops.ts and agents.ts"

# 4. Manual patches needed
echo ""
echo "=== Manual patches required ==="
echo ""
echo "4. src/lib/stores/studios.ts:"
echo "   - Remove 'devops' from coreStudios array"
echo "   - Remove any Martha-specific studio definition"
echo ""
echo "5. src/lib/api.ts:"
echo "   - Remove 24 Martha error codes from humanizeError()"
echo "   - Error codes to remove: VENTURE_*, DIVISION_*, STORM_*, VISION_*"
echo ""
echo "6. src/lib/components/StatusBar.svelte:"
echo "   - Remove Martha/DevOps imports and references"
echo ""
echo "7. src/lib/components/ModelSelector.svelte:"
echo "   - Remove Martha/DevOps model affinity references"
echo ""
echo "After running this script:"
echo "  1. Apply manual patches above"
echo "  2. Run: cd $WEB_DIR && npm run check"
echo "  3. Run: cd $WEB_DIR && npm run build"
echo "  4. Verify hecate-web starts without Martha"
echo "  5. Martha should appear via plugin discovery when marthad runs"
