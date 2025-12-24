#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate and execute git commits with realistic collaboration pattern
"""
import subprocess
import random
from datetime import datetime, timedelta
import pytz
import os

# User configurations
CONTRACT_USER = {
    "name": "Sylvia452",
    "email": "SidneyGardinerdyajf@outlook.com"
}

UI_USER = {
    "name": "Simona8886",
    "email": "SusanEvanotqln@outlook.com"
}

# Time range: 2025-11-10 9:00 AM to 2025-11-20 5:00 PM (Pacific Time)
START_TIME = datetime(2025, 11, 10, 9, 0, 0, tzinfo=pytz.timezone('America/Los_Angeles'))
END_TIME = datetime(2025, 11, 20, 17, 0, 0, tzinfo=pytz.timezone('America/Los_Angeles'))

def generate_commit_times(num_commits):
    """Generate random commit times within work hours"""
    times = []
    current = START_TIME
    
    while len(times) < num_commits:
        # Skip weekends
        if current.weekday() >= 5:
            current += timedelta(days=1)
            current = current.replace(hour=9, minute=0, second=0)
            continue
        
        # Random time between 9 AM and 5 PM (not multiples of 5)
        hour = random.randint(9, 16)
        minute = random.choice([x for x in range(0, 60) if x % 5 != 0] + [random.randint(0, 59)])
        second = random.randint(0, 59)
        
        commit_time = current.replace(hour=hour, minute=minute, second=second)
        
        if commit_time > END_TIME:
            break
            
        times.append(commit_time)
        
        # Next commit: 30 minutes to 4 hours later
        delta_hours = random.uniform(0.5, 4.0)
        current += timedelta(hours=delta_hours)
        
        # If past 5 PM, move to next day
        if current.hour >= 17:
            current += timedelta(days=1)
            current = current.replace(hour=9, minute=0, second=0)
    
    return sorted(times[:num_commits])

# Simplified commit plan - we'll make actual file changes
COMMIT_PLAN = [
    # Phase 1: Initial structure (4 commits)
    {"user": "contract", "action": "add", "paths": ["contracts/", "hardhat.config.ts", "package.json", "tsconfig.json", "deploy/", "test/", "tasks/", "scripts/"], "msg": "feat: add smart contract structure and configuration"},
    {"user": "contract", "action": "add", "paths": [".eslintrc.yml", ".prettierrc.yml", ".solhint.json", "LICENSE"], "msg": "feat: add project configuration and license"},
    {"user": "ui", "action": "add", "paths": ["ui/src/", "ui/public/"], "msg": "feat: implement frontend components and pages"},
    {"user": "ui", "action": "add", "paths": ["ui/vite.config.ts", "ui/tailwind.config.ts", "ui/package.json", "ui/tsconfig.json"], "msg": "feat: add frontend configuration and build setup"},
]

def make_commit(commit_info, commit_time, repo_path, commit_num):
    """Make a single commit"""
    user = CONTRACT_USER if commit_info["user"] == "contract" else UI_USER
    
    # Set git config
    subprocess.run(["git", "config", "user.name", user["name"]], cwd=repo_path, check=True)
    subprocess.run(["git", "config", "user.email", user["email"]], cwd=repo_path, check=True)
    
    # Format time for git
    time_str = commit_time.strftime("%Y-%m-%d %H:%M:%S %z")
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = time_str
    env["GIT_COMMITTER_DATE"] = time_str
    
    # Stage files
    for path in commit_info["paths"]:
        full_path = os.path.join(repo_path, path)
        if os.path.exists(full_path):
            subprocess.run(["git", "add", path], cwd=repo_path, check=False, capture_output=True)
    
    # Commit
    result = subprocess.run(
        ["git", "commit", "-m", commit_info["msg"]],
        cwd=repo_path,
        env=env,
        capture_output=True
    )
    
    if result.returncode == 0:
        print(f"[{commit_num}] {commit_time.strftime('%Y-%m-%d %H:%M:%S')} - {user['name']}: {commit_info['msg']}")
        return True
    else:
        # Check if there are changes to commit
        status = subprocess.run(["git", "status", "--porcelain"], cwd=repo_path, capture_output=True, text=True)
        if status.stdout.strip():
            print(f"[{commit_num}] WARNING: {commit_info['msg']} - no changes to commit")
        return False

if __name__ == "__main__":
    import sys
    repo_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    # Generate commit times
    commit_times = generate_commit_times(len(COMMIT_PLAN))
    
    print(f"Creating {len(COMMIT_PLAN)} initial commits...\n")
    
    # Execute Phase 1 commits
    for i, (commit_info, commit_time) in enumerate(zip(COMMIT_PLAN, commit_times), 1):
        make_commit(commit_info, commit_time, repo_path, i)
    
    print("\nPhase 1 complete. Now creating Phase 2 commits with actual code changes...")
    print("(This will be done in the next step)")












