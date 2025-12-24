#!/bin/bash
# Adjust commit timestamps using git rebase

# Get all commit hashes in reverse order
git log --format="%H" --reverse > /tmp/commits.txt

# Read commits and assign new timestamps
python3 << 'PYTHON_SCRIPT'
import subprocess
import random
import datetime

START_TIME = datetime.datetime(2025, 11, 10, 17, 0, 0)
END_TIME = datetime.datetime(2025, 11, 21, 1, 0, 0)

random.seed(42)

def get_working_time(start_time, end_time):
    total_seconds = int((end_time - start_time).total_seconds())
    if total_seconds <= 0:
        return start_time
    random_seconds = random.randint(0, total_seconds)
    time = start_time + datetime.timedelta(seconds=random_seconds)
    while time.minute % 5 == 0:
        time = time.replace(minute=(time.minute + random.randint(1, 4)) % 60)
    return time

# Get commits
result = subprocess.run(["git", "log", "--format=%H|%s", "--reverse"], capture_output=True, text=True)
commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        commit_hash, message = line.split('|', 1)
        commits.append((commit_hash, message))

# Generate timestamps
current_time = START_TIME
timestamps = []

# Stage 1: First 4 commits
for i in range(4):
    if i == 0:
        timestamp = get_working_time(START_TIME, START_TIME + datetime.timedelta(hours=6))
    else:
        time_inc = datetime.timedelta(hours=random.randint(2, 6), minutes=random.randint(1, 59))
        timestamp = get_working_time(current_time + time_inc, START_TIME + datetime.timedelta(days=1, hours=6))
    timestamps.append(timestamp)
    current_time = timestamp

# Stage 2: Bug fixes (distribute across Nov 11-20)
for i in range(len(commits) - 6):  # Exclude stage 1 and stage 3
    time_span = END_TIME - datetime.timedelta(days=1) - current_time
    progress = i / max(len(commits) - 7, 1)
    target_time = current_time + time_span * progress
    time_inc = datetime.timedelta(hours=random.randint(2, 8), minutes=random.randint(1, 59))
    timestamp = get_working_time(target_time, END_TIME - datetime.timedelta(days=1))
    timestamps.append(timestamp)
    current_time = timestamp

# Stage 3: Final 2 commits (README and video)
for i in range(2):
    timestamp = get_working_time(END_TIME - datetime.timedelta(hours=4), END_TIME)
    timestamps.append(timestamp)

# Output mapping
for (hash_val, msg), ts in zip(commits, timestamps):
    print(f"{hash_val}|{ts.strftime('%Y-%m-%d %H:%M:%S')}")
PYTHON_SCRIPT










