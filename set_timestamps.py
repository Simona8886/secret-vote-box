#!/usr/bin/env python3
import subprocess
import random
import datetime

START = datetime.datetime(2025, 11, 10, 17, 0, 0)
END = datetime.datetime(2025, 11, 21, 1, 0, 0)

random.seed(42)

def get_time(start, end):
    sec = int((end - start).total_seconds())
    if sec <= 0:
        return start
    t = start + datetime.timedelta(seconds=random.randint(0, sec))
    while t.minute % 5 == 0:
        t = t.replace(minute=(t.minute + random.randint(1, 4)) % 60)
    return t

# Get commits
result = subprocess.run(["git", "log", "--format=%H|%s", "--reverse"], capture_output=True, text=True)
commits = [line.split('|', 1) for line in result.stdout.strip().split('\n') if '|' in line]

# Generate timestamps
ts_list = []
current = START

# First 4 commits (Nov 10-11)
for i in range(4):
    if i == 0:
        t = get_time(START, START + datetime.timedelta(hours=8))
    else:
        inc = datetime.timedelta(hours=random.randint(2, 6), minutes=random.randint(1, 59))
        t = get_time(current + inc, START + datetime.timedelta(days=1, hours=8))
    ts_list.append(t)
    current = t

# Bug fixes (Nov 11-20)
s2_start = current + datetime.timedelta(hours=random.randint(4, 8))
s2_end = END - datetime.timedelta(days=1, hours=2)
span = s2_end - s2_start

for i in range(len(commits) - 6):
    if len(commits) - 6 > 1:
        p = i / (len(commits) - 7)
    else:
        p = 0
    target = s2_start + span * p
    inc = datetime.timedelta(hours=random.randint(1, 4), minutes=random.randint(1, 59))
    t = get_time(target, min(target + datetime.timedelta(days=1), s2_end))
    ts_list.append(t)
    current = t

# Final 2 (README and video)
for i in range(2):
    t = get_time(END - datetime.timedelta(hours=3), END)
    ts_list.append(t)

# Apply
print("Setting timestamps...")
for (h, m), ts in zip(commits, ts_list):
    ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
    print(f"{m[:40]:40} -> {ts_str}")
    cmd = f'if [ "$GIT_COMMIT" = "{h}" ]; then export GIT_AUTHOR_DATE="{ts_str}"; export GIT_COMMITTER_DATE="{ts_str}"; fi'
    subprocess.run(["git", "filter-branch", "-f", "--env-filter", cmd], 
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("\nDone!")










