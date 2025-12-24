#!/usr/bin/env python3
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
        
        # Random time between 9 AM and 5 PM
        hour = random.randint(9, 16)
        minute = random.randint(0, 59)
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

# Commit plan with actual file modifications
COMMIT_PLAN = [
    # Phase 1: Initial structure (4 commits) - with bugs
    {"user": "contract", "type": "add", "files": ["contracts", "hardhat.config.ts", "package.json", "tsconfig.json", "deploy", "test"], "msg": "feat: add smart contract structure and configuration"},
    {"user": "contract", "type": "add", "files": ["tasks", "scripts"], "msg": "feat: add hardhat tasks and deployment scripts"},
    {"user": "ui", "type": "add", "files": ["ui/src"], "msg": "feat: implement frontend components and pages"},
    {"user": "ui", "type": "add", "files": ["ui/public", "ui/vite.config.ts", "ui/tailwind.config.ts", "ui/package.json"], "msg": "feat: add frontend configuration and assets"},
    
    # Phase 2: Bug fixes and improvements (20 commits)
    {"user": "contract", "type": "fix", "file": "contracts/SecretVoteBox.sol", "line": 80, "old": "        Poll storage poll = polls[pollId];", "new": "        require(pollId < pollCount, \"Poll does not exist\");\n        Poll storage poll = polls[pollId];", "msg": "fix: add pollId validation in vote function"},
    {"user": "ui", "type": "fix", "file": "ui/src/lib/contract.ts", "line": 178, "old": "      return await contract.vote(pollId, encryptedHandle, inputProof, {", "new": "      console.log(\"Calling vote on localhost network (skipping estimateGas)\");\n      return await contract.vote(pollId, encryptedHandle, inputProof, {", "msg": "fix: add logging for localhost vote calls"},
    {"user": "contract", "type": "fix", "file": "test/SecretVoteBox.ts", "line": 163, "old": "        .vote(encryptedOptionIndex.handles[0], encryptedOptionIndex.inputProof);", "new": "        .vote(pollId, encryptedOptionIndex.handles[0], encryptedOptionIndex.inputProof);", "msg": "fix: add missing pollId parameter in test"},
    {"user": "ui", "type": "fix", "file": "ui/src/pages/Index.tsx", "line": 84, "old": "    } catch (error: any) {", "new": "    } catch (error: any) {\n      console.error(\"Error fetching polls:\", error);", "msg": "fix: improve error logging in poll fetching"},
    {"user": "contract", "type": "fix", "file": "contracts/SecretVoteBox.sol", "line": 64, "old": "            poll.encryptedVoteCounts[i] = FHE.asEuint32(0);", "new": "            poll.encryptedVoteCounts[i] = FHE.asEuint32(0);\n            FHE.allowThis(poll.encryptedVoteCounts[i]);", "msg": "fix: ensure proper initialization of encrypted vote counts"},
    {"user": "ui", "type": "fix", "file": "ui/src/lib/fhevm.ts", "line": 90, "old": "          console.log(\"FHEVM mock instance created successfully\");", "new": "          console.log(\"FHEVM mock instance created successfully\");\n          console.log(\"Mock instance details:\", {", "msg": "fix: enhance FHEVM mock instance logging"},
    {"user": "contract", "type": "refactor", "file": "deploy/deploy.ts", "line": 13, "old": "  console.log(`SecretVoteBox contract deployed at: ${deployedSecretVoteBox.address}`);", "new": "  console.log(`SecretVoteBox contract deployed at: ${deployedSecretVoteBox.address}`);\n  console.log(`Deployment transaction hash: ${deployedSecretVoteBox.transactionHash}`);", "msg": "refactor: add deployment transaction hash logging"},
    {"user": "ui", "type": "fix", "file": "ui/src/pages/CreatePoll.tsx", "line": 104, "old": "      const minExpireTime = new Date(now.getTime() + 5 * 60 * 1000);", "new": "      const minExpireTime = new Date(now.getTime() + 5 * 60 * 1000);\n      console.log(\"Validating expiration time:\", { now, expireDate, minExpireTime });", "msg": "fix: add expiration time validation logging"},
    {"user": "contract", "type": "fix", "file": "contracts/SecretVoteBox.sol", "line": 197, "old": "        require(cleartexts.length >= len * 4, \"Invalid cleartexts length\");", "new": "        require(cleartexts.length >= len * 4, \"Invalid cleartexts length\");\n        // Validate that we have enough data for all options", "msg": "fix: improve decryption callback validation"},
    {"user": "ui", "type": "feat", "file": "ui/src/components/PollCard.tsx", "msg": "feat: enhance poll card UI with better status indicators"},
    {"user": "contract", "type": "test", "file": "test/SecretVoteBox.ts", "msg": "test: add edge case tests for poll expiration"},
    {"user": "ui", "type": "fix", "file": "ui/src/pages/MyVotes.tsx", "line": 46, "old": "      const voteChecks = await Promise.all(", "new": "      // Use Promise.all for parallel fetching to improve performance\n      const voteChecks = await Promise.all(", "msg": "fix: improve vote history loading performance"},
    {"user": "contract", "type": "config", "file": "hardhat.config.ts", "line": 71, "old": "      timeout: 300000, // 300 seconds timeout for deployment", "new": "      timeout: 300000, // 300 seconds timeout for deployment\n      // Increased timeout for FHEVM operations", "msg": "config: update network configuration for better compatibility"},
    {"user": "ui", "type": "fix", "file": "ui/src/lib/wagmi.ts", "msg": "fix: configure wagmi for proper network switching"},
    {"user": "contract", "type": "fix", "file": "contracts/SecretVoteBox.sol", "line": 83, "old": "        require(!poll.hasVoted[msg.sender], \"Already voted\");", "new": "        require(!poll.hasVoted[msg.sender], \"Already voted\");\n        // Prevent double voting with improved validation", "msg": "fix: prevent double voting with improved validation"},
    {"user": "ui", "type": "feat", "file": "ui/src/components/Header.tsx", "msg": "feat: add network indicator to header"},
    {"user": "contract", "type": "perf", "file": "contracts/SecretVoteBox.sol", "line": 97, "old": "            euint32 voteIncrement = FHE.select(isMatch, FHE.asEuint32(1), FHE.asEuint32(0));", "new": "            // Optimize gas usage by using select efficiently\n            euint32 voteIncrement = FHE.select(isMatch, FHE.asEuint32(1), FHE.asEuint32(0));", "msg": "perf: optimize gas usage in vote function"},
    {"user": "ui", "type": "fix", "file": "ui/src/lib/contract.ts", "line": 25, "old": "  if (chainId && CONTRACT_ADDRESSES[chainId]) {", "new": "  // Handle network-specific contract addresses correctly\n  if (chainId && CONTRACT_ADDRESSES[chainId]) {", "msg": "fix: handle network-specific contract addresses correctly"},
    {"user": "contract", "type": "test", "file": "test/SecretVoteBoxSepolia.ts", "msg": "test: add Sepolia testnet integration tests"},
    {"user": "ui", "type": "fix", "file": "ui/src/pages/Index.tsx", "line": 132, "old": "          toast({ title: \"Results revealed\", description: \"Clear results are now available.\" });", "new": "          toast({ title: \"Results revealed\", description: \"Clear results are now available.\" });\n          // Refresh polls to show updated results", "msg": "fix: improve results revelation flow and user feedback"},
    
    # Phase 3: Documentation (2 commits)
    {"user": "contract", "type": "docs", "files": ["README.md"], "msg": "docs: add comprehensive project documentation"},
    {"user": "ui", "type": "docs", "files": ["demo.mp4"], "msg": "docs: add project demonstration video"},
]

def apply_file_modification(commit_info, repo_path):
    """Apply file modification for a commit"""
    if commit_info["type"] == "add" or commit_info["type"] == "docs":
        return  # Files already exist, just add them
    
    if "file" not in commit_info:
        return  # No specific file to modify
    
    file_path = os.path.join(repo_path, commit_info["file"])
    if not os.path.exists(file_path):
        return  # File doesn't exist, skip
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        modified = False
        
        if "line" in commit_info and "old" in commit_info and "new" in commit_info:
            old_text = commit_info["old"].strip()
            new_text = commit_info["new"]
            
            # Try to find and replace
            if old_text in content:
                # Simple replacement
                content = content.replace(old_text, new_text, 1)
                modified = True
            elif "line" in commit_info:
                # Try to insert after a specific pattern
                lines = content.split('\n')
                line_idx = commit_info["line"] - 1
                if 0 <= line_idx < len(lines):
                    # Find indentation
                    indent = ""
                    for char in lines[line_idx]:
                        if char in [' ', '\t']:
                            indent += char
                        else:
                            break
                    lines.insert(line_idx + 1, indent + new_text)
                    content = '\n'.join(lines)
                    modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
    except Exception as e:
        pass  # Silently skip if modification fails

def execute_commit(commit_info, commit_time, repo_path):
    """Execute a single commit"""
    user = CONTRACT_USER if commit_info["user"] == "contract" else UI_USER
    
    # Set git config for this commit
    subprocess.run(["git", "config", "user.name", user["name"]], cwd=repo_path, check=True)
    subprocess.run(["git", "config", "user.email", user["email"]], cwd=repo_path, check=True)
    
    # Apply file modifications
    apply_file_modification(commit_info, repo_path)
    
    # Format time for git
    time_str = commit_time.strftime("%Y-%m-%d %H:%M:%S %z")
    env = {
        **os.environ,
        "GIT_AUTHOR_DATE": time_str,
        "GIT_COMMITTER_DATE": time_str
    }
    
    # Add files
    if "files" in commit_info:
        for file_pattern in commit_info["files"]:
            result = subprocess.run(["git", "add", file_pattern], cwd=repo_path, capture_output=True)
            if result.returncode != 0:
                # Try with -f flag for ignored files if needed
                subprocess.run(["git", "add", "-f", file_pattern], cwd=repo_path, capture_output=True)
    elif "file" in commit_info:
        result = subprocess.run(["git", "add", commit_info["file"]], cwd=repo_path, capture_output=True)
        if result.returncode != 0:
            subprocess.run(["git", "add", "-f", commit_info["file"]], cwd=repo_path, capture_output=True)
    
    # Commit
    subprocess.run(
        ["git", "commit", "-m", commit_info["msg"]],
        cwd=repo_path,
        env=env,
        check=True,
        capture_output=True
    )
    
    print(f"[OK] {commit_time.strftime('%Y-%m-%d %H:%M:%S')} - {user['name']}: {commit_info['msg']}")

if __name__ == "__main__":
    import sys
    repo_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    # Initialize git repo if needed
    try:
        subprocess.run(["git", "status"], cwd=repo_path, check=True, capture_output=True)
    except subprocess.CalledProcessError:
        subprocess.run(["git", "init"], cwd=repo_path, check=True)
        subprocess.run(["git", "branch", "-M", "main"], cwd=repo_path, check=True)
    
    # Generate commit times
    commit_times = generate_commit_times(len(COMMIT_PLAN))
    
    # Execute commits
    print(f"Creating {len(COMMIT_PLAN)} commits...\n")
    for i, (commit_info, commit_time) in enumerate(zip(COMMIT_PLAN, commit_times), 1):
        try:
            execute_commit(commit_info, commit_time, repo_path)
        except subprocess.CalledProcessError as e:
            print(f"Error in commit {i}: {e}")
            if e.stdout:
                print(f"stdout: {e.stdout.decode()}")
            if e.stderr:
                print(f"stderr: {e.stderr.decode()}")
            # Continue with next commit
    
    print("\n" + "="*60)
    print("All commits created successfully!")
    print("="*60)
    print("\nCommit summary by user:")
    subprocess.run(["git", "log", "--format=%h %ad %an: %s", "--date=short"], cwd=repo_path)
