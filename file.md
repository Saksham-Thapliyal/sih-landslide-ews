# The Complete Git & GitHub Tutorial: Beginner to Advanced

---

## Part 0: The Big Picture

**Git** is a *version control system* — a program that runs on your computer and tracks every change made to a set of files over time. It lets you save "snapshots" of your project, go back to any previous snapshot, see exactly what changed and when, and let multiple people work on the same files without overwriting each other's work.

**GitHub** is a *website/service* that hosts Git repositories online. Git is the engine; GitHub is a garage where you park the car, show it to others, and collaborate on it. GitHub adds features Git itself doesn't have: a web UI, issue tracking, pull requests, code review tools, CI/CD (GitHub Actions), project boards, and social/discovery features (stars, forks).

**Analogy:** Git is like Microsoft Word's "Track Changes + Version History" but far more powerful and built for teams and code. GitHub is like Google Drive — a place to store, share, and collaborate on those tracked documents.

Other Git hosts exist (GitLab, Bitbucket) — the Git commands are identical; only the web platform differs.

---

## Part 1: Core Concepts & Vocabulary

Understand these before touching commands — 90% of Git confusion comes from not knowing these terms.

| Term | Meaning |
|---|---|
| **Repository (repo)** | A folder tracked by Git; contains your files plus a hidden `.git` folder storing all history. |
| **Working directory** | The actual files on your disk as you see and edit them right now. |
| **Staging area (index)** | A "waiting room" where you place changes you want to include in your next snapshot. |
| **Commit** | A saved snapshot of the staged changes, with a unique ID (hash), author, timestamp, and message. |
| **Repository history** | The chain of all commits, each pointing to its parent commit. |
| **Branch** | A movable pointer to a commit; lets you work on different lines of development in parallel. |
| **HEAD** | A pointer to the commit/branch you currently have checked out ("where you are right now"). |
| **Remote** | A version of your repository hosted elsewhere (e.g., on GitHub). Usually named `origin`. |
| **Clone** | Downloading a full copy of a remote repository, including all history. |
| **Fork** | (GitHub concept) Your own copy of someone else's repository, hosted under your account. |
| **Pull Request (PR)** | (GitHub concept) A request to merge changes from one branch/fork into another, with review/discussion attached. |
| **Merge** | Combining changes from one branch into another. |
| **Rebase** | Replaying your commits on top of another branch's tip, creating a cleaner, linear history. |
| **Conflict** | When Git can't automatically combine changes because two people edited the same lines differently. |
| **Tag** | A permanent label on a specific commit, usually used for releases (e.g., `v1.0.0`). |
| **.gitignore** | A file listing patterns of files Git should never track (e.g., `node_modules/`, `.env`). |
| **Hash (SHA)** | A unique 40-character ID for every commit, generated from its content. |
| **Upstream** | The remote branch that your local branch is linked to, for push/pull tracking. |
| **Fast-forward** | A merge where the target branch just moves forward, since there's no divergent history. |
| **Detached HEAD** | When HEAD points directly at a commit instead of a branch — you're "floating," not on any branch. |

**The Three Trees mental model** (this single idea unlocks Git):

```
Working Directory  --git add-->  Staging Area  --git commit-->  Repository (history)
     (edit files)                 (what will be                  (permanent
                                    in next commit)                 snapshots)
```

Every Git command essentially moves data between these three areas.

---

## Part 2: Installation & First-Time Setup

```bash
# Check if installed
git --version

# Install (if needed)
# macOS:      brew install git
# Windows:    download from git-scm.com
# Ubuntu:     sudo apt install git

# One-time identity setup (used in every commit you make)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Nice defaults
git config --global init.defaultBranch main
git config --global core.editor "code --wait"   # use VS Code as commit editor
git config --list                                 # view all settings
```

---

## Part 3: Starting a Repository

**Option A — Start fresh locally:**
```bash
mkdir myproject && cd myproject
git init                 # creates the hidden .git folder — now tracked by Git
```

**Option B — Copy an existing repo (e.g., from GitHub):**
```bash
git clone https://github.com/username/repo.git
cd repo
```

---

## Part 4: The Core Daily Workflow

This is the loop you'll use 95% of the time.

```bash
git status               # see what's changed (untracked/modified/staged)
git add file.txt         # stage a specific file
git add .                # stage everything changed
git commit -m "Add login form"     # save a snapshot of staged changes
git log                  # view commit history
git log --oneline --graph --all    # compact visual history (very useful)
```

**Reading `git status` output:**
- **Untracked files** — Git has never seen these files before.
- **Changes not staged for commit** — Git knows the file, but new edits aren't staged yet.
- **Changes to be committed** — staged and ready for the next commit.

**Good commit message habits:**
- Short summary line (~50 chars), imperative mood: "Fix login bug" not "Fixed" or "Fixes".
- Blank line, then a longer explanation if needed (the *why*, not just the *what*).

**Viewing changes before committing:**
```bash
git diff                 # unstaged changes vs last commit
git diff --staged        # staged changes vs last commit
git show <commit-hash>   # what a specific commit changed
```

---

## Part 5: Branching — Working in Parallel

A branch lets you build a feature or fix a bug without touching the stable code (usually on `main`).

```bash
git branch                       # list branches
git branch feature-login         # create a new branch
git checkout feature-login       # switch to it
# OR, modern shortcut for both:
git checkout -b feature-login
git switch feature-login         # newer, clearer alternative to checkout for switching
git switch -c feature-login      # newer alternative to create+switch

git branch -d feature-login      # delete a branch (safe, only if merged)
git branch -D feature-login      # force delete (even if unmerged)
```

**Why branch?** Each branch is an isolated timeline. You can experiment freely; if it fails, delete the branch and `main` is untouched. If it works, you merge it in.

### Merging

```bash
git checkout main
git merge feature-login          # bring feature-login's changes into main
```

Two outcomes:
1. **Fast-forward merge** — `main` hadn't changed since you branched off, so Git just moves the pointer forward. Clean, no new commit.
2. **Three-way merge** — both branches changed, so Git creates a new "merge commit" combining both histories.

### Merge Conflicts

Happens when the same lines were changed differently on both branches. Git pauses and marks the file:

```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> feature-login
```

Fix it: edit the file to keep what you want, remove the markers, then:
```bash
git add file.txt
git commit                # completes the merge
```

---

## Part 6: Working with Remotes (GitHub)

```bash
git remote add origin https://github.com/username/repo.git   # link a remote
git remote -v                                                  # view remotes

git push origin main             # upload local commits to GitHub
git push -u origin main          # push AND set upstream tracking (do this once per branch)
git push                         # after -u is set, just this works

git fetch                        # download remote changes WITHOUT merging them
git pull                         # fetch + merge in one step (most common)
git pull --rebase                # fetch + rebase instead of merge (cleaner history)
```

**fetch vs pull — the key distinction:**
- `git fetch` = "check what's new on GitHub" (safe, doesn't touch your files)
- `git pull` = "check what's new AND immediately merge it into my current branch"

---

## Part 7: GitHub-Specific Concepts & Workflow

### Creating a repo on GitHub and connecting it
1. On GitHub: New Repository → name it → (don't initialize with README if you already have local code)
2. Locally:
```bash
git remote add origin https://github.com/username/repo.git
git branch -M main
git push -u origin main
```

### Forking vs Cloning
- **Clone** = copy the repo to your computer. You may or may not have permission to push back.
- **Fork** = copy the repo to *your own GitHub account*. Used when you don't have write access to the original (e.g., contributing to open source).

**Typical open-source contribution flow:**
```bash
# 1. Fork the repo on GitHub (via the web UI)
# 2. Clone YOUR fork
git clone https://github.com/YOU/repo.git
cd repo
git remote add upstream https://github.com/ORIGINAL_OWNER/repo.git

# 3. Create a feature branch, make changes, commit
git checkout -b fix-typo
# ... edit files ...
git add .
git commit -m "Fix typo in README"

# 4. Push to YOUR fork
git push -u origin fix-typo

# 5. Open a Pull Request on GitHub: your fork's branch -> original repo's main

# 6. Keep your fork updated with the original later:
git fetch upstream
git checkout main
git merge upstream/main
```

### Pull Requests (PRs)
A PR is a proposal: "please merge my branch into yours." It shows a diff, allows line-by-line comments, supports approvals/reviews, and can trigger automated tests (CI) before merging. This is the heart of collaborative software development on GitHub.

### Issues
GitHub's built-in bug/task tracker. You can reference an issue in a commit message (`Fixes #12`) and GitHub will auto-close it when that commit is merged to the default branch.

### GitHub Actions (CI/CD)
Automation triggered by repo events (push, PR, schedule). Defined in YAML files under `.github/workflows/`. Common uses: run tests automatically on every PR, auto-deploy on merge to main, lint code.

Minimal example (`.github/workflows/test.yml`):
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test
```

### GitHub Pages
Free static website hosting straight from a repo (great for docs, portfolios, project pages).

---

## Part 8: Undoing Things (crucial — and where beginners panic)

| I want to... | Command |
|---|---|
| Discard uncommitted changes in a file | `git restore file.txt` (older: `git checkout -- file.txt`) |
| Unstage a file (keep the edits) | `git restore --staged file.txt` (older: `git reset file.txt`) |
| Edit the last commit's message/content | `git commit --amend` |
| Undo the last commit but keep changes staged | `git reset --soft HEAD~1` |
| Undo the last commit, unstage the changes | `git reset --mixed HEAD~1` (default mode) |
| Undo the last commit and DELETE the changes | `git reset --hard HEAD~1` ⚠️ destructive |
| Undo a commit that's already pushed/shared | `git revert <commit-hash>` — creates a new commit that undoes it (safe for shared history) |
| Temporarily shelve unfinished work | `git stash` then later `git stash pop` |
| Recover "lost" commits | `git reflog` — shows every HEAD movement, even after reset --hard |

**Golden rule:** `reset` rewrites history — safe on your own unpushed local commits. `revert` adds a new commit — safe on shared/pushed history. Never `reset --hard` or force-push on a branch others are also using.

---

## Part 9: Advanced Git

### Rebase (rewriting history for a cleaner story)
```bash
git checkout feature-login
git rebase main          # replay feature-login's commits on top of latest main
```
Produces a linear history (no merge commit) — often preferred for feature branches before merging. **Never rebase commits that have already been pushed and shared** with others, unless everyone agrees (it rewrites commit hashes).

**Interactive rebase** — clean up your commits before sharing them:
```bash
git rebase -i HEAD~3      # edit the last 3 commits
```
Opens an editor where you can `squash` (combine), `reword`, `drop`, or `reorder` commits.

### Cherry-pick
Apply one specific commit from another branch onto your current branch:
```bash
git cherry-pick <commit-hash>
```

### Stash
```bash
git stash                 # save uncommitted work, clean the working directory
git stash list             # see stashed items
git stash pop               # reapply the most recent stash and remove it from the list
git stash apply             # reapply without removing from the list
```

### Bisect (binary-search for the commit that broke something)
```bash
git bisect start
git bisect bad                # current commit is broken
git bisect good v1.0          # this old tag/commit was fine
# Git checks out a commit halfway between — you test it, then:
git bisect good   # or
git bisect bad
# repeat until Git identifies the exact breaking commit
git bisect reset
```

### Tags (marking releases)
```bash
git tag v1.0.0                          # lightweight tag
git tag -a v1.0.0 -m "First release"    # annotated tag (recommended)
git push origin v1.0.0                  # tags don't push automatically
git push origin --tags                  # push all tags
```

### Submodules (a repo inside a repo)
```bash
git submodule add https://github.com/user/lib.git libs/lib
git submodule update --init --recursive   # when cloning a repo that has submodules
```

### Hooks
Scripts in `.git/hooks/` that run automatically on events like `pre-commit` or `pre-push` (e.g., auto-run a linter before every commit). Not synced via Git itself — tools like Husky are used to share hooks with a team.

### Worktrees
Check out multiple branches into separate folders simultaneously without cloning twice:
```bash
git worktree add ../hotfix-dir hotfix-branch
```

---

## Part 10: .gitignore

A plain text file listing patterns Git should never track:
```
node_modules/
.env
*.log
dist/
.DS_Store
```
Use [gitignore.io](https://www.toptal.com/developers/gitignore) to generate templates per language/framework. If a file is already tracked, adding it to `.gitignore` won't stop tracking it — you must run `git rm --cached filename` first.

---

## Part 11: Common Branching Strategies (Team Workflows)

| Strategy | Idea |
|---|---|
| **GitHub Flow** | Simple: `main` is always deployable. Every change is a short-lived feature branch → PR → review → merge → deploy. Most common for web apps/continuous deployment. |
| **Git Flow** | More structured: `main` (production), `develop` (integration), plus `feature/`, `release/`, and `hotfix/` branches. Better for versioned software with scheduled releases. |
| **Trunk-Based Development** | Everyone commits small, frequent changes directly (or via very short-lived branches) to `main`/`trunk`, guarded by feature flags and heavy automated testing. |

---

## Part 12: Practical Activities to Build Real Skill

1. **Solo practice:** Create a repo, make 5 commits, create a branch, cause a merge conflict on purpose (edit the same line on `main` and your branch), then resolve it.
2. **Undo practice:** Make a commit, then practice `reset --soft`, `reset --hard` (on a throwaway repo), `revert`, and `git reflog` to recover a "lost" commit.
3. **GitHub practice:** Push a repo to GitHub, open a PR from a branch to `main` in your own repo, merge it via the GitHub UI, then pull the merge back down locally.
4. **Open source practice:** Fork a small public repo, fix a typo in its README, open a real PR (many repos welcome doc fixes).
5. **Automation practice:** Add a simple GitHub Actions workflow that runs on every push and prints "Hello CI".
6. **Rebase practice:** Create 3 messy commits ("wip", "wip2", "fix typo") and use `git rebase -i HEAD~3` to squash them into one clean commit.
7. **Bisect practice:** Introduce a deliberate bug a few commits back, then use `git bisect` to find it.

---

## Part 13: Quick-Reference Cheat Sheet

```
SETUP           git init | git clone <url>
STATUS/DIFF     git status | git diff | git diff --staged
STAGE/COMMIT    git add <file> | git add . | git commit -m "msg"
HISTORY         git log --oneline --graph --all | git show <hash>
BRANCH          git branch | git switch -c <name> | git branch -d <name>
MERGE           git merge <branch>
REMOTE          git remote -v | git push -u origin <branch> | git pull
UNDO (local)    git restore <file> | git reset --soft/--hard HEAD~1
UNDO (shared)   git revert <hash>
STASH           git stash | git stash pop
REBASE          git rebase <branch> | git rebase -i HEAD~N
TAG             git tag -a v1.0 -m "msg" | git push origin --tags
RECOVER         git reflog
```

---

## Where to Go From Here
- Practice daily with real projects — muscle memory beats memorization.
- Read `git help <command>` (e.g., `git help rebase`) — Git's built-in docs are excellent.
- Once comfortable, explore: signed commits (GPG), `git blame`, GitHub CODEOWNERS, protected branches, semantic-release/versioning automation, and monorepo tooling.

You now have the full map — beginner fundamentals through the workflows professional teams use daily. The fastest way to true mastery from here is repetition: pick a small project and use Git for it deliberately, using this guide as your reference whenever you hit something new.
