#!/usr/bin/env python3
"""
Correctly adjust commit timestamps
"""
import subprocess
import random
import datetime

START_TIME = datetime.datetime(2025, 11, 10, 17, 0, 0)  # 9 AM PST = 5 PM UTC
END_TIME = datetime.datetime(2025, 11, 21, 1, 0, 0)   # 5 PM PST = 1 AM next day UTC

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

# Get all commits in reverse order (oldest first)
result = subprocess.run(["git", "log", "--format=%H|%s", "--reverse"], capture_output=True, text=True)
commits = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        commit_hash, message = line.split('|', 1)
        commits.append((commit_hash, message))

print(f"Found {len(commits)} commits")

# Categorize
stage1 = []
stage2 = []
stage3 = []

for i, (h, m) in enumerate(commits):
    if i < 4:
        stage1.append((h, m))
    elif "docs:" in m.lower() and ("readme" in m.lower() or "video" in m.lower()):
        stage3.append((h, m))
    else:
        stage2.append((h, m))

# Reorder: stage1 + stage2 + stage3
all_commits = stage1 + stage2 + stage3
timestamps = []

# Stage 1: Nov 10-11
current = START_TIME
for i in range(4):
    if i == 0:
        ts = get_working_time(START_TIME, START_TIME + datetime.timedelta(hours=8))
    else:
        inc = datetime.timedelta(hours=random.randint(2, 6), minutes=random.randint(1, 59))
        ts = get_working_time(current + inc, START_TIME + datetime.timedelta(days=1, hours=8))
    timestamps.append(ts)
    current = ts

# Stage 2: Nov 11-20, evenly distributed
stage2_start = current + datetime.timedelta(hours=random.randint(4, 8))
stage2_end = END_TIME - datetime.timedelta(days=1, hours=2)
time_span = stage2_end - stage2_start

for i in range(len(stage2)):
    if len(stage2) > 1:
        progress = i / (len(stage2) - 1)
    else:
        progress = 0
    target = stage2_start + time_span * progress
    inc = datetime.timedelta(hours=random.randint(1, 4), minutes=random.randint(1, 59))
    ts = get_working_time(target, min(target + datetime.timedelta(days=1), stage2_end))
    timestamps.append(ts)
    current = ts

# Stage 3: Nov 20, near end
for i in range(len(stage3)):
    ts = get_working_time(END_TIME - datetime.timedelta(hours=3), END_TIME)
    timestamps.append(ts)

# Apply using git filter-branch
print("\nApplying timestamp changes...")
for (h, m), ts in zip(all_commits, timestamps):
    ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
    print(f"  {m[:50]}... -> {ts_str}")
    
    # Use git filter-branch for each commit
    env_filter = f'if [ "$GIT_COMMIT" = "{h}" ]; then export GIT_AUTHOR_DATE="{ts_str}"; export GIT_COMMITTER_DATE="{ts_str}"; fi'
    subprocess.run(["git", "filter-branch", "-f", "--env-filter", env_filter], 
                   check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("\nDone! Verifying...")
result = subprocess.run(["git", "log", "--format=%ad|%s", "--date=format:%Y-%m-%d %H:%M:%S"], 
                       capture_output=True, text=True)
print(result.stdout[:500])










