#!/usr/bin/env python3
"""
Apply timestamps directly using git rebase
"""
import subprocess
import datetime
import os

# Read the timestamp mapping from env_filter.sh
commit_timestamps = {}
if os.path.exists("env_filter.sh"):
    with open("env_filter.sh", "r", encoding="utf-8") as f:
        current_hash = None
        for line in f:
            line = line.strip()
            if line.endswith(")"):
                # Extract commit hash
                current_hash = line.split("(")[0].strip()
            elif line.startswith("export GIT_AUTHOR_DATE=") and current_hash:
                # Extract timestamp
                timestamp_str = line.split('"')[1]
                commit_timestamps[current_hash] = timestamp_str

print(f"Loaded {len(commit_timestamps)} timestamp mappings")

# Get all commits in order
result = subprocess.run(["git", "log", "--format=%H|%s", "--reverse"], capture_output=True, text=True)
commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        commit_hash, message = line.split('|', 1)
        commits.append((commit_hash, message))

print(f"Found {len(commits)} commits")

# Apply timestamps using git rebase
# We'll need to create a rebase script
print("\nApplying timestamps...")

# Use git filter-branch with a Python-based env filter
env_filter_content = ""
for commit_hash, timestamp in commit_timestamps.items():
    env_filter_content += f'if [ "$GIT_COMMIT" = "{commit_hash}" ]; then\n'
    env_filter_content += f'  export GIT_AUTHOR_DATE="{timestamp}"\n'
    env_filter_content += f'  export GIT_COMMITTER_DATE="{timestamp}"\n'
    env_filter_content += 'fi\n'

with open("env_filter_simple.sh", "w", encoding="utf-8") as f:
    f.write("#!/bin/bash\n")
    f.write(env_filter_content)

print("Created env_filter_simple.sh")

# Try using git filter-branch with the simple script
# For Windows, we might need to use git rebase instead
print("\nTo apply timestamps on Windows:")
print("1. Open Git Bash")
print("2. Run: git filter-branch -f --env-filter 'bash env_filter_simple.sh'")
print("\nOr use git rebase to modify each commit individually")

# Alternative: Create a PowerShell script
ps_script = "$commits = @{\n"
for commit_hash, timestamp in commit_timestamps.items():
    ps_script += f'  "{commit_hash}" = "{timestamp}";\n'
ps_script += "}\n"
ps_script += """
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"
git filter-branch -f --env-filter "
  if [ -n \"$commits[$GIT_COMMIT]\" ]; then
    export GIT_AUTHOR_DATE=\"$commits[$GIT_COMMIT]\"
    export GIT_COMMITTER_DATE=\"$commits[$GIT_COMMIT]\"
  fi
" -- --all
"""

with open("apply_timestamps.ps1", "w", encoding="utf-8") as f:
    f.write(ps_script)

print("Created apply_timestamps.ps1")

