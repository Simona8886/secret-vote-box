#!/usr/bin/env python3
"""
Apply timestamps using git filter-branch with inline env filter
"""
import subprocess
import os

# Read timestamps from env_filter.sh
commit_timestamps = {}
if os.path.exists("env_filter.sh"):
    with open("env_filter.sh", "r", encoding="utf-8") as f:
        current_hash = None
        for line in f:
            line = line.strip()
            if line.endswith(")"):
                current_hash = line.split("(")[0].strip()
            elif line.startswith("export GIT_AUTHOR_DATE=") and current_hash:
                timestamp_str = line.split('"')[1]
                commit_timestamps[current_hash] = timestamp_str

print(f"Loaded {len(commit_timestamps)} timestamp mappings")

# Build inline env filter
env_filter_parts = []
for commit_hash, timestamp in commit_timestamps.items():
    env_filter_parts.append(f'if [ "$GIT_COMMIT" = "{commit_hash}" ]; then export GIT_AUTHOR_DATE="{timestamp}"; export GIT_COMMITTER_DATE="{timestamp}"; fi;')

env_filter = ' '.join(env_filter_parts)

# Write to file for reference
with open("env_filter_inline.sh", "w", encoding="utf-8") as f:
    f.write("#!/bin/sh\n")
    f.write(env_filter)

print("Created env_filter_inline.sh")
print(f"\nEnv filter length: {len(env_filter)} characters")

# Try to apply using git filter-branch
print("\nApplying timestamps...")
env = os.environ.copy()
env["FILTER_BRANCH_SQUELCH_WARNING"] = "1"

# Use the inline filter directly
result = subprocess.run(
    ["git", "filter-branch", "-f", "--env-filter", env_filter],
    env=env,
    capture_output=True,
    text=True,
    cwd=os.getcwd()
)

if result.returncode == 0:
    print("Timestamps applied successfully!")
    print("\nVerifying...")
    verify_result = subprocess.run(
        ["git", "log", "--format=%h|%ad|%s", "--date=format:%Y-%m-%d %H:%M:%S", "-3"],
        capture_output=True,
        text=True
    )
    print(verify_result.stdout)
else:
    print(f"Error applying timestamps:")
    print(result.stderr)
    print("\nYou may need to run this in Git Bash:")
    print(f"  git filter-branch -f --env-filter '{env_filter[:200]}...'")

