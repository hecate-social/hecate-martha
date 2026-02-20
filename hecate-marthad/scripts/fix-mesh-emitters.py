#!/usr/bin/env python3
"""Fix dialyzer warning in mesh emitter files.

Replaces the 3-clause mesh publish pattern with a 2-clause version.
The {error, Reason} clause is unreachable because publish/2 only
returns ok | {error, not_connected}.
"""
import glob
import os
import re

APPS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps")

OLD = """            ok -> ok;
            {error, not_connected} -> ok;
            {error, Reason} ->
                logger:warning("[~s] Mesh publish failed: ~p", [?MODULE, Reason])"""

NEW = """            ok -> ok;
            {error, _} -> ok"""

fixed = 0
for path in sorted(glob.glob(os.path.join(APPS_DIR, "**/*_to_mesh.erl"), recursive=True)):
    with open(path) as f:
        content = f.read()
    if OLD in content:
        content = content.replace(OLD, NEW)
        with open(path, "w") as f:
            f.write(content)
        print(f"Fixed: {os.path.relpath(path, APPS_DIR)}")
        fixed += 1

print(f"\n{fixed} files fixed.")
