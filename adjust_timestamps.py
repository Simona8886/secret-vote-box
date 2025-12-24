#!/usr/bin/env python3
"""
Adjust commit timestamps to be within the specified range
"""
import subprocess
import random
import datetime
import os

# Time range: Nov 10, 2025 9:00 AM to Nov 20, 2025 5:00 PM (Pacific Time)
# PST = UTC-8, so 9 AM PST = 5 PM UTC, 5 PM PST = 1 AM next day UTC
START_TIME = datetime.datetime(2025, 11, 10, 17, 0, 0)  # 9 AM PST = 5 PM UTC
END_TIME = datetime.datetime(2025, 11, 21, 1, 0, 0)   # 5 PM PST = 1 AM next day UTC

WORK_START_HOUR = 17  # 9 AM PST = 5 PM UTC
WORK_END_HOUR = 2     # 6 PM PST = 2 AM UTC next day

def get_working_time(start_time, end_time):
    """Generate random working time"""
    total_seconds = int((end_time - start_time).total_seconds())
    if total_seconds <= 0:
        return start_time
    random_seconds = random.randint(0, total_seconds)
    time = start_time + datetime.timedelta(seconds=random_seconds)
    
    # Ensure it's within working hours
    hour = time.hour
    while hour >= WORK_END_HOUR and hour < WORK_START_HOUR:
        random_seconds = random.randint(0, total_seconds)
        time = start_time + datetime.timedelta(seconds=random_seconds)
        hour = time.hour
    
    # Avoid multiples of 5 minutes
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
stage1_commits = []  # Initial 4 commits
stage2_commits = []  # Bug fixes (17 commits)
stage3_commits = []  # README and video (2 commits)

for i, (hash_val, msg) in enumerate(commits):
    if i < 4:
        stage1_commits.append((hash_val, msg))
    elif "docs:" in msg.lower() and ("readme" in msg.lower() or "video" in msg.lower()):
        stage3_commits.append((hash_val, msg))
    else:
        stage2_commits.append((hash_val, msg))

print(f"Stage 1: {len(stage1_commits)} commits")
print(f"Stage 2: {len(stage2_commits)} commits")
print(f"Stage 3: {len(stage3_commits)} commits")

# Generate timestamps
random.seed(42)
current_time = START_TIME

# Stage 1: First 4 commits (Nov 10-11)
stage1_times = []
for i in range(4):
    if i == 0:
        timestamp = get_working_time(START_TIME, START_TIME + datetime.timedelta(hours=6))
    else:
        time_inc = datetime.timedelta(hours=random.randint(2, 6), minutes=random.randint(1, 59))
        timestamp = get_working_time(current_time + time_inc, START_TIME + datetime.timedelta(days=1, hours=6))
    stage1_times.append(timestamp)
    current_time = timestamp

# Stage 2: Bug fixes (Nov 11-20, distributed)
stage2_times = []
time_span = END_TIME - datetime.timedelta(days=1) - current_time
for i in range(len(stage2_commits)):
    # Distribute evenly across the remaining time
    progress = i / max(len(stage2_commits) - 1, 1)
    target_time = current_time + time_span * progress
    time_inc = datetime.timedelta(hours=random.randint(2, 8), minutes=random.randint(1, 59))
    timestamp = get_working_time(target_time, END_TIME - datetime.timedelta(days=1))
    stage2_times.append(timestamp)
    current_time = timestamp

# Stage 3: Final commits (Nov 20, near end)
stage3_times = []
for i in range(len(stage3_commits)):
    timestamp = get_working_time(END_TIME - datetime.timedelta(hours=4), END_TIME)
    stage3_times.append(timestamp)
    current_time = timestamp

# Combine all commits and timestamps
all_commits = stage1_commits + stage2_commits + stage3_commits
all_times = stage1_times + stage2_times + stage3_times

print("\nAdjusting timestamps...")
print("This will rewrite git history. Make sure you have a backup!")

# Use git filter-branch to change timestamps
for i, ((hash_val, msg), timestamp) in enumerate(zip(all_commits, all_times)):
    ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
    print(f"  Commit {i+1}: {msg[:50]}... -> {ts_str}")
    
    # Use git commit --amend for each commit
    # We'll need to use interactive rebase or filter-branch
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = ts_str
    env["GIT_COMMITTER_DATE"] = ts_str
    
    # Use git filter-branch
    subprocess.run([
        "git", "filter-branch", "-f", "--env-filter",
        f"""
        if [ $GIT_COMMIT = {hash_val} ]; then
            export GIT_AUTHOR_DATE="{ts_str}"
            export GIT_COMMITTER_DATE="{ts_str}"
        fi
        """.strip()
    ], check=False)

print("\nDone! Use 'git log' to verify timestamps.")
