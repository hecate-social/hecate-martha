#!/usr/bin/env bash
# Kill all hecate_marthad processes (heart storm safe)
# Must kill hearts FIRST to stop respawn loop

# Known good hearts to keep (traderd=1899, hecate-daemon=14308)
KEEP_HEARTS="1899|14308"

# Step 1: Kill ALL heart processes except known good ones
for pid in $(pgrep -x heart 2>/dev/null); do
    if ! echo "$pid" | grep -qE "^($KEEP_HEARTS)$"; then
        kill -9 "$pid" 2>/dev/null
    fi
done

sleep 1

# Step 2: Kill all marthad beam/run_erl/shell processes
pkill -9 -f 'beam.*hecate_marthad' 2>/dev/null
pkill -9 -f 'run_erl.*hecate_marthad' 2>/dev/null
pkill -9 -f 'hecate_marthad' 2>/dev/null

sleep 1

# Step 3: Clean up
rm -f ~/.hecate/hecate-marthad/sockets/api.sock
rm -f /tmp/erl_pipes/hecate_marthad@*/erlang.pipe.*

echo "Remaining marthad processes: $(pgrep -c -f hecate_marthad 2>/dev/null || echo 0)"
