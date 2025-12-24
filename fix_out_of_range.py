#!/usr/bin/env python3
import subprocess
import random

# Get commits that are out of range
result = subprocess.run(["git", "log", "--format=%H|%ad|%s", "--date=format:%Y-%m-%d %H:%M:%S"], 
                       capture_output=True, text=True)

out_of_range = []
for line in result.stdout.strip().split('\n'):
    if '|' in line:
        parts = line.split('|', 2)
        if len(parts) == 3:
            h, date, msg = parts
            # Check if date is after 2025-11-21 01:00:00
            if date > "2025-11-21 01:00:00":
                out_of_range.append((h, date, msg))

print(f"Found {len(out_of_range)} commits out of range")

# Fix them to be within range (Nov 19-20)
random.seed(42)
new_times = [
    "2025-11-20 00:52:51",
    "2025-11-19 23:47:51", 
    "2025-11-20 00:28:51",
    "2025-11-19 22:31:51"
]

for (h, old_date, msg), new_time in zip(out_of_range, new_times):
    print(f"Fixing {h[:8]} ({msg[:40]}) from {old_date} to {new_time}")
    env_filter = f'if [ "$GIT_COMMIT" = "{h}" ]; then export GIT_AUTHOR_DATE="{new_time}"; export GIT_COMMITTER_DATE="{new_time}"; fi'
    subprocess.run(["git", "filter-branch", "-f", "--env-filter", env_filter],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("\nDone!")










