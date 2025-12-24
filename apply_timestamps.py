#!/usr/bin/env python3
"""
Apply timestamp adjustments to git commits
"""
import subprocess
import datetime
import os

# Read the timestamp mapping
commit_timestamps = {}
if os.path.exists("commit_timestamps.txt"):
    with open("commit_timestamps.txt", "r", encoding="utf-8") as f:
        for line in f:
            if '|' in line:
                commit_hash, timestamp_str = line.strip().split('|', 1)
                commit_timestamps[commit_hash] = timestamp_str

print(f"Loaded {len(commit_timestamps)} timestamp mappings")

# Get all commits in reverse order (oldest first)
result = subprocess.run(["git", "log", "--format=%H|%s", "--reverse"], capture_output=True, text=True)
commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        commit_hash, message = line.split('|', 1)
        commits.append((commit_hash, message))

print(f"Found {len(commits)} commits")

# Use git rebase to update timestamps
# We'll need to create a rebase script
rebase_script = []
for i, (commit_hash, message) in enumerate(commits):
    if commit_hash in commit_timestamps:
        timestamp = commit_timestamps[commit_hash]
        rebase_script.append(f"# Commit {i+1}: {message[:50]}")
        rebase_script.append(f"git commit --amend --date='{timestamp}' --no-edit")
        rebase_script.append("")

with open("rebase_timestamps.sh", "w", encoding="utf-8") as f:
    f.write("#!/bin/bash\n")
    f.write("\n".join(rebase_script))

print("Created rebase_timestamps.sh")
print("\nTo apply timestamps, we'll use git filter-branch instead")

# Use git filter-branch approach
filter_script = "#!/bin/bash\n"
filter_script += "export FILTER_BRANCH_SQUELCH_WARNING=1\n"
filter_script += "case $GIT_COMMIT in\n"

for commit_hash, timestamp in commit_timestamps.items():
    filter_script += f'  {commit_hash})\n'
    filter_script += f'    export GIT_AUTHOR_DATE="{timestamp}"\n'
    filter_script += f'    export GIT_COMMITTER_DATE="{timestamp}"\n'
    filter_script += '    ;;\n'

filter_script += "esac\n"

with open("filter_timestamps.sh", "w", encoding="utf-8") as f:
    f.write(filter_script)

print("Created filter_timestamps.sh")
print("\nFor Windows, we'll use a different approach...")

# For Windows, use git rebase with interactive mode
# Actually, let's use a Python script that directly modifies commits
print("\nUsing git commit --amend approach for each commit...")

