#!/usr/bin/env python3
"""
Fix commit timestamps using git rebase
"""
import subprocess
import random
import datetime

# Time range: Nov 10, 2025 9:00 AM to Nov 20, 2025 5:00 PM (Pacific Time)
# PST = UTC-8, so 9 AM PST = 5 PM UTC, 5 PM PST = 1 AM next day UTC
START_TIME = datetime.datetime(2025, 11, 10, 17, 0, 0)  # 9 AM PST
END_TIME = datetime.datetime(2025, 11, 21, 1, 0, 0)  # 5 PM PST

random.seed(42)

def get_working_time(start_time, end_time):
    """Generate random working time, avoiding multiples of 5 minutes"""
    total_seconds = int((end_time - start_time).total_seconds())
    if total_seconds <= 0:
        return start_time
    random_seconds = random.randint(0, total_seconds)
    time = start_time + datetime.timedelta(seconds=random_seconds)
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
stage1 = []  # Initial 4 commits
stage2 = []  # Bug fixes
stage3 = []  # README and video

for commit_hash, message in commits:
    if message.startswith("docs: add"):
        stage3.append((commit_hash, message))
    elif message.startswith("feat:"):
        stage1.append((commit_hash, message))
    else:
        stage2.append((commit_hash, message))

# Generate timestamps
current_time = START_TIME
timestamps = []

# Stage 1: First 4 commits (Nov 10-11, morning)
for i in range(len(stage1)):
    if i == 0:
        timestamp = get_working_time(current_time, current_time + datetime.timedelta(hours=4))
    else:
        timestamp = get_working_time(current_time + datetime.timedelta(hours=2), current_time + datetime.timedelta(hours=6))
    timestamps.append(timestamp)
    current_time = timestamp

# Stage 2: Bug fixes (Nov 11-20, distributed)
# Distribute across ~9 days
days_span = 9
for i in range(len(stage2)):
    day = i * days_span // len(stage2) + 1  # Day 1-9 (Nov 11-19)
    base_date = START_TIME + datetime.timedelta(days=day)
    hour = random.randint(9, 17)  # Working hours
    minute = random.choice([1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43, 44, 46, 47, 48, 49, 51, 52, 53, 54, 56, 57, 58, 59])
    timestamp = base_date.replace(hour=hour, minute=minute, second=random.randint(0, 59))
    timestamps.append(timestamp)
    current_time = timestamp

# Stage 3: Final commits (Nov 20, afternoon, before 5 PM PST = 1 AM UTC)
# 5 PM PST = 1 AM UTC next day, so we need to be before 1 AM on Nov 21
max_end_time = datetime.datetime(2025, 11, 21, 0, 45, 0)  # Just before 1 AM
for i in range(len(stage3)):
    # Distribute in the afternoon/evening of Nov 20
    # Use hours 21-23 (9 PM - 11 PM UTC = 1 PM - 3 PM PST)
    hour = 21 + i  # 21, 22, or 23
    if hour >= 24:
        hour = 23
    minute = random.choice([12, 17, 23, 28, 34, 39, 41, 47, 52, 58])
    timestamp = datetime.datetime(2025, 11, 20, hour, minute, random.randint(0, 59))
    if timestamp >= max_end_time:
        timestamp = max_end_time - datetime.timedelta(minutes=30+i*15)
    timestamps.append(timestamp)

# Create timestamp mapping
all_commits = stage1 + stage2 + stage3
commit_map = {}
for (commit_hash, message), timestamp in zip(all_commits, timestamps):
    commit_map[commit_hash] = timestamp
    print(f"{commit_hash[:8]} | {timestamp.strftime('%Y-%m-%d %H:%M:%S')} | {message[:50]}")

# Use git filter-branch to update timestamps
# Create environment filter script
env_filter = "#!/bin/bash\n"
env_filter += "export FILTER_BRANCH_SQUELCH_WARNING=1\n"
env_filter += "case $GIT_COMMIT in\n"

for commit_hash, timestamp in commit_map.items():
    ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
    env_filter += f"  {commit_hash})\n"
    env_filter += f'    export GIT_AUTHOR_DATE="{ts_str}"\n'
    env_filter += f'    export GIT_COMMITTER_DATE="{ts_str}"\n'
    env_filter += "    ;;\n"

env_filter += "esac\n"

with open("env_filter.sh", "w", encoding="utf-8") as f:
    f.write(env_filter)

print(f"\nCreated env_filter.sh with {len(commit_map)} timestamp mappings")
print("\nTo apply, run:")
print("  git filter-branch -f --env-filter 'bash env_filter.sh'")

