#!/usr/bin/env bash
set -euo pipefail

# Decouple Martha apps from hecate-daemon
#
# ONLY run this after Martha standalone is proven working:
#   1. hecate-marthad compiles (rebar3 compile)
#   2. hecate-marthad tests pass (rebar3 eunit)
#   3. hecate-marthaw builds (npm run build:lib)
#   4. End-to-end: initiate venture via API, query it back
#
# This script modifies hecate-daemon to remove Martha apps.
# Review the diff before committing.

DAEMON_DIR="${1:-/home/rl/work/github.com/hecate-social/hecate-daemon}"

if [[ ! -d "$DAEMON_DIR/apps" ]]; then
    echo "Error: $DAEMON_DIR does not look like hecate-daemon"
    exit 1
fi

echo "=== Decoupling Martha from hecate-daemon ==="
echo "Target: $DAEMON_DIR"
echo ""

# 1. Delete Martha app directories
echo "1. Removing Martha app directories..."
rm -rf "$DAEMON_DIR/apps/guide_venture_lifecycle"
rm -rf "$DAEMON_DIR/apps/guide_division_alc"
rm -rf "$DAEMON_DIR/apps/query_venture_lifecycle"
rm -rf "$DAEMON_DIR/apps/query_division_alc"
echo "   Deleted 4 app directories"

# 2. Remove from rebar.config relx release
echo "2. Patching rebar.config (remove Martha from release)..."
sed -i '/guide_venture_lifecycle/d' "$DAEMON_DIR/rebar.config"
sed -i '/guide_division_alc/d' "$DAEMON_DIR/rebar.config"
sed -i '/query_venture_lifecycle/d' "$DAEMON_DIR/rebar.config"
sed -i '/query_division_alc/d' "$DAEMON_DIR/rebar.config"
sed -i '/Venture lifecycle.*4 consolidated/d' "$DAEMON_DIR/rebar.config"
sed -i '/Venture lifecycle.*query services/d' "$DAEMON_DIR/rebar.config"
echo "   Patched rebar.config"

# 3. Remove from hecate_api_routes.erl HECATE_APPS
echo "3. Patching hecate_api_routes.erl (remove Martha from HECATE_APPS)..."
ROUTES_FILE="$DAEMON_DIR/apps/hecate_api/src/hecate_api_routes.erl"
sed -i '/guide_venture_lifecycle, query_venture_lifecycle,/d' "$ROUTES_FILE"
sed -i '/guide_division_alc, query_division_alc,/d' "$ROUTES_FILE"
echo "   Patched hecate_api_routes.erl"

# 4. Remove start_dev_studio_store/0 from hecate_app.erl
echo "4. Patching hecate_app.erl (remove dev_studio_store startup)..."
echo "   NOTE: This requires manual editing."
echo "   In hecate_app.erl:"
echo "     - Remove the start_dev_studio_store/0 function (lines ~111-132)"
echo "     - In start_event_store/0, change:"
echo "       'ok -> start_dev_studio_store();'"
echo "       to:"
echo "       'ok -> start_hecate_sup();'"
echo ""

echo "=== Summary ==="
echo "  - Deleted: apps/guide_venture_lifecycle/"
echo "  - Deleted: apps/guide_division_alc/"
echo "  - Deleted: apps/query_venture_lifecycle/"
echo "  - Deleted: apps/query_division_alc/"
echo "  - Patched: rebar.config (release apps)"
echo "  - Patched: hecate_api_routes.erl (HECATE_APPS)"
echo "  - TODO:    hecate_app.erl (remove start_dev_studio_store/0)"
echo ""
echo "After running this script:"
echo "  1. Manually patch hecate_app.erl"
echo "  2. Run: cd $DAEMON_DIR && rebar3 compile"
echo "  3. Run: cd $DAEMON_DIR && rebar3 eunit"
echo "  4. Verify hecate-daemon starts without Martha"
