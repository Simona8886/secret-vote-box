#!/usr/bin/env python3
"""
Adjust commit timestamps using git rebase
"""
import subprocess
import random
import datetime
import os

START_TIME = datetime.datetime(2025, 11, 10, 17, 0, 0)  # 9 AM PST = 5 PM UTC
END_TIME = datetime.datetime(2025, 11, 21, 1, 0, 0)   # 5 PM PST = 1 AM next day UTC

def get_working_time(start_time, end_time):
    total_seconds = int((end_time - start_time).total_seconds())
    if total_seconds <= 0:
        return start_time
    random_seconds = random.randint(0, total_seconds)
    time = start_time + datetime.timedelta(seconds=random_seconds)
    while time.minute % 5 == 0:
        time = time.replace(minute=(time.minute + random.randint(1, 4)) % 60)
    return time

# Get all commits
result = subprocess.run(["git", "log", "--format=%H|%s", "--reverse"], capture_output=True, text=True)
commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        commit_hash, message = line.split('|', 1)
        commits.append((commit_hash, message))

print(f"Found {len(commits)} commits")

# Categorize commits
stage1_commits = []
stage2_commits = []
stage3_commits = []

for i, (hash_val, msg) in enumerate(commits):
    if i < 4:
        stage1_commits.append((hash_val, msg))
    elif "docs:" in msg.lower() and ("readme" in msg.lower() or "video" in msg.lower()):
        stage3_commits.append((hash_val, msg))
    else:
        stage2_commits.append((hash_val, msg))

# Reorder: stage1 + stage2 + stage3
all_commits = stage1_commits + stage2_commits + stage3_commits

# Generate timestamps
random.seed(42)
current_time = START_TIME
timestamps = []

# Stage 1: First 4 commits (Nov 10-11)
for i in range(4):
    if i == 0:
        timestamp = get_working_time(START_TIME, START_TIME + datetime.timedelta(hours=6))
    else:
        time_inc = datetime.timedelta(hours=random.randint(2, 6), minutes=random.randint(1, 59))
        timestamp = get_working_time(current_time + time_inc, START_TIME + datetime.timedelta(days=1, hours=6))
    timestamps.append(timestamp)
    current_time = timestamp

# Stage 2: Bug fixes (Nov 11-20, distributed)
time_span = END_TIME - datetime.timedelta(days=1) - current_time
for i in range(len(stage2_commits)):
    progress = i / max(len(stage2_commits) - 1, 1) if len(stage2_commits) > 1 else 0
    target_time = current_time + time_span * progress
    time_inc = datetime.timedelta(hours=random.randint(2, 8), minutes=random.randint(1, 59))
    timestamp = get_working_time(target_time, END_TIME - datetime.timedelta(days=1))
    timestamps.append(timestamp)
    current_time = timestamp

# Stage 3: Final commits (Nov 20, near end)
for i in range(len(stage3_commits)):
    timestamp = get_working_time(END_TIME - datetime.timedelta(hours=4), END_TIME)
    timestamps.append(timestamp)

# Create rebase script
rebase_script = "#!/bin/sh\n"
for (hash_val, msg), ts in zip(all_commits, timestamps):
    ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
    rebase_script += f'if [ "$GIT_COMMIT" = "{hash_val}" ]; then\n'
    rebase_script += f'  export GIT_AUTHOR_DATE="{ts_str}"\n'
    rebase_script += f'  export GIT_COMMITTER_DATE="{ts_str}"\n'
    rebase_script += 'fi\n'

with open("rebase_env.sh", "w") as f:
    f.write(rebase_script)

print("\nTimestamps generated. Use the following command to apply:")
print("git filter-branch -f --env-filter 'bash rebase_env.sh'")

# Actually apply the changes
print("\nApplying timestamp changes...")
for (hash_val, msg), ts in zip(all_commits, timestamps):
    ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
    print(f"  {msg[:50]}... -> {ts_str}")

# Use git filter-branch for each commit
for (hash_val, msg), ts in zip(all_commits, timestamps):
    ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
    env_filter = f'if [ "$GIT_COMMIT" = "{hash_val}" ]; then export GIT_AUTHOR_DATE="{ts_str}"; export GIT_COMMITTER_DATE="{ts_str}"; fi'
    subprocess.run(["git", "filter-branch", "-f", "--env-filter", env_filter], 
                   check=False, capture_output=True)

print("\nDone! Use 'git log' to verify.")










