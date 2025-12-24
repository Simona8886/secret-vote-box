#!/usr/bin/env python3
"""
Update commit timestamps using git rebase
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

# Get all commits
result = subprocess.run(["git", "log", "--format=%H", "--reverse"], capture_output=True, text=True)
commit_hashes = [h.strip() for h in result.stdout.strip().split('\n') if h.strip()]

print(f"Found {len(commit_hashes)} commits")

# Use git filter-branch
# Create a simple env filter
env_filter = '#!/bin/sh\n'
for commit_hash, timestamp in commit_timestamps.items():
    env_filter += f'if [ "$GIT_COMMIT" = "{commit_hash}" ]; then\n'
    env_filter += f'  export GIT_AUTHOR_DATE="{timestamp}"\n'
    env_filter += f'  export GIT_COMMITTER_DATE="{timestamp}"\n'
    env_filter += 'fi\n'

with open("update_env.sh", "w", encoding="utf-8") as f:
    f.write(env_filter)

print("Created update_env.sh")
print("\nTo apply timestamps, run in Git Bash:")
print("  git filter-branch -f --env-filter 'sh update_env.sh'")

# Try to execute if we're in a compatible environment
try:
    # Check if we can use git filter-branch
    result = subprocess.run(["git", "--version"], capture_output=True, text=True)
    print(f"\nGit version: {result.stdout.strip()}")
    print("\nAttempting to apply timestamps...")
    
    # Use git filter-branch
    env = os.environ.copy()
    env["FILTER_BRANCH_SQUELCH_WARNING"] = "1"
    
    # For Windows, we need to use the full path or Git Bash
    result = subprocess.run(
        ["git", "filter-branch", "-f", "--env-filter", "sh update_env.sh"],
        env=env,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("Timestamps applied successfully!")
    else:
        print(f"Error: {result.stderr}")
        print("\nPlease run in Git Bash:")
        print("  git filter-branch -f --env-filter 'sh update_env.sh'")
except Exception as e:
    print(f"Could not apply automatically: {e}")
    print("\nPlease run in Git Bash:")
    print("  git filter-branch -f --env-filter 'sh update_env.sh'")

