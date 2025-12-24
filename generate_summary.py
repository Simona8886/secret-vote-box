#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import re
from collections import defaultdict
from datetime import datetime

repo_path = "."

# Get all commits
result = subprocess.run(
    ["git", "log", "--format=%ad|%an|%ae|%s", "--date=format:%Y-%m-%d %H:%M:%S", "--all"],
    cwd=repo_path,
    capture_output=True,
    text=True
)

commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        parts = line.split('|', 3)
        if len(parts) == 4:
            date_str, name, email, msg = parts
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                commits.append({
                    "date": date,
                    "name": name,
                    "email": email,
                    "message": msg
                })
            except:
                pass

# Sort by date
commits.sort(key=lambda x: x["date"])

# Group by user
by_user = defaultdict(list)
for commit in commits:
    by_user[commit["name"]].append(commit)

# Print summary
print("="*80)
print("COMMIT SUMMARY")
print("="*80)
print(f"\nTotal commits: {len(commits)}")
print(f"\nCommits by user:")
for name, user_commits in sorted(by_user.items()):
    print(f"  {name} ({user_commits[0]['email']}): {len(user_commits)} commits")

print(f"\n\nCommits by date:")
by_date = defaultdict(list)
for commit in commits:
    date_key = commit["date"].strftime("%Y-%m-%d")
    by_date[date_key].append(commit)

for date_key in sorted(by_date.keys()):
    print(f"\n{date_key}: {len(by_date[date_key])} commits")
    for commit in by_date[date_key]:
        print(f"  {commit['date'].strftime('%H:%M:%S')} - {commit['name']}: {commit['message']}")

print("\n" + "="*80)
print("Phase Analysis:")
print("="*80)

# Phase 1: First 4 commits (initial structure)
print(f"\nPhase 1 (Initial Structure): {min(4, len(commits))} commits")
for i, commit in enumerate(commits[:4], 1):
    print(f"  {i}. {commit['date'].strftime('%Y-%m-%d %H:%M:%S')} - {commit['name']}: {commit['message']}")

# Phase 2: Middle commits (bug fixes)
phase2_start = 4
phase2_end = len(commits) - 2
phase2_count = phase2_end - phase2_start
print(f"\nPhase 2 (Bug Fixes & Improvements): {phase2_count} commits")
print(f"  Range: {commits[phase2_start]['date'].strftime('%Y-%m-%d %H:%M:%S')} to {commits[phase2_end-1]['date'].strftime('%Y-%m-%d %H:%M:%S')}")

# Phase 3: Last 2 commits (documentation)
print(f"\nPhase 3 (Documentation): {min(2, len(commits) - phase2_end)} commits")
for i, commit in enumerate(commits[-2:], 1):
    print(f"  {i}. {commit['date'].strftime('%Y-%m-%d %H:%M:%S')} - {commit['name']}: {commit['message']}")












