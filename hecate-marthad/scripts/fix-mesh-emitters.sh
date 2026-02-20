#!/usr/bin/env bash
# Fix dialyzer warning: {error, Reason} clause after {error, not_connected}
# is unreachable because marthad_mesh_proxy:publish/2 only returns
# ok | {error, not_connected}. Merge into a single {error, _} clause.
set -euo pipefail

APPS_DIR="$(cd "$(dirname "$0")/../apps" && pwd)"

find "$APPS_DIR" -name '*_to_mesh.erl' -print0 | while IFS= read -r -d '' file; do
    if grep -q '{error, not_connected}' "$file"; then
        # Replace the 3-clause pattern with a 2-clause pattern
        sed -i \
            -e '/ok -> ok;/{
                N
                /\n.*{error, not_connected} -> ok;/{
                    N
                    /\n.*{error, Reason} ->/{
                        N
                        s/ok -> ok;\n.*{error, not_connected} -> ok;\n.*{error, Reason} ->\n.*logger:warning.*/ok -> ok;\n            {error, _} -> ok/
                    }
                }
            }' "$file"
        echo "Fixed: $file"
    fi
done
