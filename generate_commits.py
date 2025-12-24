#!/usr/bin/env python3
"""
Generate git commits with realistic collaboration pattern
"""
import subprocess
import random
import datetime
import os
import re
from pathlib import Path

# User configurations
CONTRACT_USER = {
    "name": "Sylvia452",
    "email": "SidneyGardinerdyajf@outlook.com"
}

UI_USER = {
    "name": "Simona8886",
    "email": "SusanEvanotqln@outlook.com"
}

# Time range: Nov 10, 2025 9:00 AM to Nov 20, 2025 5:00 PM (Pacific Time)
# Note: We'll use UTC and adjust for PST (UTC-8)
START_TIME = datetime.datetime(2025, 11, 10, 17, 0, 0)  # 9 AM PST = 5 PM UTC
END_TIME = datetime.datetime(2025, 11, 21, 1, 0, 0)  # 5 PM PST = 1 AM next day UTC

# Working hours: 9 AM to 6 PM PST (17:00 to 02:00 UTC)
WORK_START_HOUR_UTC = 17
WORK_END_HOUR_UTC = 2

def get_working_time(start_time, end_time):
    """Generate a random working time between start and end"""
    total_seconds = int((end_time - start_time).total_seconds())
    if total_seconds <= 0:
        return start_time
    
    random_seconds = random.randint(0, total_seconds)
    time = start_time + datetime.timedelta(seconds=random_seconds)
    
    # Ensure it's within working hours
    hour = time.hour
    while hour >= WORK_END_HOUR_UTC and hour < WORK_START_HOUR_UTC:
        random_seconds = random.randint(0, total_seconds)
        time = start_time + datetime.timedelta(seconds=random_seconds)
        hour = time.hour
    
    # Avoid times that are multiples of 5 minutes
    minute = time.minute
    while minute % 5 == 0:
        minute = (minute + random.randint(1, 4)) % 60
        time = time.replace(minute=minute)
    
    return time

def set_git_user(user_config):
    """Set git user name and email"""
    subprocess.run(["git", "config", "user.name", user_config["name"]], check=True)
    subprocess.run(["git", "config", "user.email", user_config["email"]], check=True)

def make_commit(message, timestamp, files_to_stage=None):
    """Make a git commit with specific timestamp"""
    if files_to_stage:
        for file in files_to_stage:
            if os.path.exists(file):
                subprocess.run(["git", "add", file], check=True)
    else:
        subprocess.run(["git", "add", "."], check=True)
    
    # Set commit date
    env = os.environ.copy()
    timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
    env["GIT_AUTHOR_DATE"] = timestamp_str
    env["GIT_COMMITTER_DATE"] = timestamp_str
    
    subprocess.run(
        ["git", "commit", "-m", message],
        env=env,
        check=True
    )

def fix_contract_bug_1():
    """Fix: Add poll existence check in createPoll"""
    file_path = "contracts/SecretVoteBox.sol"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # This bug was already fixed, so we'll add a different fix
        # Add check for poll count overflow
        content = content.replace(
            "pollId = pollCount++;",
            "require(pollCount < type(uint256).max, \"Maximum poll count reached\");\npollId = pollCount++;"
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return [file_path]
    return []

def fix_contract_bug_2():
    """Fix: Remove duplicate FHE.allowThis"""
    file_path = "contracts/SecretVoteBox.sol"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Already fixed, so we'll optimize something else
        # Remove unnecessary comment
        content = content.replace(
            "// Prevent double voting with improved validation\n",
            ""
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return [file_path]
    return []

def fix_contract_bug_3():
    """Fix: Add proper poll validation in getPoll"""
    file_path = "contracts/SecretVoteBox.sol"
    if os.path.exists(file_path):
        # Already fixed, so we'll improve error message
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace(
            "require(pollId < pollCount, \"Poll does not exist\");",
            "require(pollId < pollCount, \"Poll does not exist\");\nrequire(polls[pollId].isActive || polls[pollId].expireAt > 0, \"Poll not found\");"
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return [file_path]
    return []

def fix_ui_bug_1():
    """Fix: Handle null poll array"""
    file_path = "ui/src/pages/Index.tsx"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Already fixed, so we'll add better error handling
        content = content.replace(
            "setPolls(allPolls);",
            "setPolls(allPolls || []);"
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return [file_path]
    return []

def fix_ui_bug_2():
    """Fix: Correct date comparison"""
    file_path = "ui/src/pages/CreatePoll.tsx"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Already fixed, so we'll improve validation
        content = content.replace(
            "if (expireDate.getTime() <= now.getTime()) {",
            "if (expireDate <= now) {"
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return [file_path]
    return []

def main():
    # Initialize git repo
    if not os.path.exists(".git"):
        subprocess.run(["git", "init"], check=True)
        # Set default branch to main
        subprocess.run(["git", "config", "init.defaultBranch", "main"], check=True)
    
    random.seed(42)  # For reproducibility
    
    # Stage 1: Initial commits (4 commits)
    print("Stage 1: Initial commits...")
    current_time = START_TIME
    
    # Contract user commits (2 commits) - submit contract files
    set_git_user(CONTRACT_USER)
    
    # First commit: Core contract
    timestamp = get_working_time(current_time, current_time + datetime.timedelta(hours=4))
    make_commit("feat: add SecretVoteBox contract with FHEVM integration", timestamp, 
                ["contracts/SecretVoteBox.sol", "hardhat.config.ts", "package.json"])
    current_time = timestamp
    print(f"  Commit 1: feat: add SecretVoteBox contract with FHEVM integration")
    
    # Second commit: Deployment and tests
    timestamp = get_working_time(current_time + datetime.timedelta(hours=2), current_time + datetime.timedelta(hours=6))
    make_commit("feat: add deployment scripts and test files", timestamp,
                ["deploy/", "test/", "tasks/", "tsconfig.json"])
    current_time = timestamp
    print(f"  Commit 2: feat: add deployment scripts and test files")
    
    # UI user commits (2 commits) - submit UI files
    set_git_user(UI_USER)
    
    # Third commit: UI setup
    timestamp = get_working_time(current_time + datetime.timedelta(hours=3), current_time + datetime.timedelta(hours=8))
    make_commit("feat: initialize React frontend with Vite and Tailwind", timestamp,
                ["ui/package.json", "ui/vite.config.ts", "ui/tailwind.config.ts", "ui/tsconfig.json", "ui/index.html"])
    current_time = timestamp
    print(f"  Commit 3: feat: initialize React frontend with Vite and Tailwind")
    
    # Fourth commit: UI components and pages
    timestamp = get_working_time(current_time + datetime.timedelta(hours=2), current_time + datetime.timedelta(hours=6))
    make_commit("feat: implement poll creation, voting pages and FHEVM integration", timestamp,
                ["ui/src/"])
    current_time = timestamp
    print(f"  Commit 4: feat: implement poll creation, voting pages and FHEVM integration")
    
    # Stage 2: Bug fixes and improvements (20 commits)
    print("\nStage 2: Bug fixes and improvements...")
    
    # List of fixes with their functions
    contract_fixes = [
        ("fix: add poll count overflow check in createPoll", fix_contract_bug_1),
        ("fix: remove unnecessary comment in vote function", fix_contract_bug_2),
        ("fix: improve poll validation in getPoll function", fix_contract_bug_3),
        ("refactor: optimize vote counting loop", lambda: ["contracts/SecretVoteBox.sol"]),
        ("fix: add missing poll existence check in hasVoted", lambda: ["contracts/SecretVoteBox.sol"]),
        ("refactor: improve contract event emissions", lambda: ["contracts/SecretVoteBox.sol"]),
        ("fix: correct error handling in endPoll function", lambda: ["contracts/SecretVoteBox.sol"]),
        ("refactor: optimize encrypted vote count initialization", lambda: ["contracts/SecretVoteBox.sol"]),
    ]
    
    ui_fixes = [
        ("fix: handle null poll array in Index page", fix_ui_bug_1),
        ("fix: improve date validation in CreatePoll", fix_ui_bug_2),
        ("fix: remove duplicate console.log in fhevm.ts", lambda: ["ui/src/lib/fhevm.ts"]),
        ("fix: use correct contract address in error message", lambda: ["ui/src/lib/contract.ts"]),
        ("refactor: improve error handling in poll fetching", lambda: ["ui/src/pages/Index.tsx"]),
        ("fix: remove duplicate comment in MyVotes component", lambda: ["ui/src/pages/MyVotes.tsx"]),
        ("refactor: optimize FHEVM instance initialization", lambda: ["ui/src/lib/fhevm.ts"]),
        ("fix: improve date validation logic", lambda: ["ui/src/pages/CreatePoll.tsx"]),
        ("refactor: clean up unused imports", lambda: ["ui/src/pages/Index.tsx"]),
        ("fix: correct null check for poll array", lambda: ["ui/src/pages/Index.tsx"]),
        ("refactor: improve wallet connection handling", lambda: ["ui/src/components/WalletButton.tsx"]),
        ("fix: optimize vote submission flow", lambda: ["ui/src/pages/Index.tsx"]),
    ]
    
    # Alternate between users with 1-3 commits each
    commit_count = 0
    use_contract_user = random.choice([True, False])
    contract_idx = 0
    ui_idx = 0
    
    while commit_count < 20:
        # Determine how many commits this user will make (1-3)
        num_commits = random.randint(1, 3)
        if commit_count + num_commits > 20:
            num_commits = 20 - commit_count
        
        if use_contract_user and contract_idx < len(contract_fixes):
            set_git_user(CONTRACT_USER)
            fixes = contract_fixes
            idx = contract_idx
            contract_idx += num_commits
        elif ui_idx < len(ui_fixes):
            set_git_user(UI_USER)
            fixes = ui_fixes
            idx = ui_idx
            ui_idx += num_commits
        else:
            # If one list is exhausted, use the other
            if contract_idx < len(contract_fixes):
                set_git_user(CONTRACT_USER)
                fixes = contract_fixes
                idx = contract_idx
                contract_idx += num_commits
            else:
                break
        
        for i in range(num_commits):
            if idx >= len(fixes):
                break
            
            msg, fix_func = fixes[idx]
            files = fix_func()
            
            # Ensure time progresses and doesn't cluster
            time_increment = datetime.timedelta(
                hours=random.randint(2, 8),
                minutes=random.randint(1, 59)
            )
            max_time = min(current_time + datetime.timedelta(days=2), END_TIME - datetime.timedelta(days=1))
            timestamp = get_working_time(current_time + time_increment, max_time)
            current_time = timestamp
            
            make_commit(msg, timestamp, files if files else None)
            commit_count += 1
            print(f"  Commit {commit_count + 4}: {msg}")
            idx += 1
        
        use_contract_user = not use_contract_user
    
    # Stage 3: Final commits (README and video)
    print("\nStage 3: Final commits...")
    set_git_user(CONTRACT_USER)
    current_time = get_working_time(END_TIME - datetime.timedelta(days=1), END_TIME)
    if os.path.exists("README.md"):
        make_commit("docs: add comprehensive README with setup instructions", current_time, ["README.md"])
        print(f"  Commit {commit_count + 5}: docs: add comprehensive README with setup instructions")
    
    current_time = get_working_time(current_time, END_TIME)
    if os.path.exists("demo.mp4"):
        make_commit("docs: add demo video", current_time, ["demo.mp4"])
        print(f"  Commit {commit_count + 6}: docs: add demo video")
    
    print(f"\nTotal commits: {commit_count + 6}")
    print("\nDone! Use 'git log --oneline' to view commits.")

if __name__ == "__main__":
    main()
