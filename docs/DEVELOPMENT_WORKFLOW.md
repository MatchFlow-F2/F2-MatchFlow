# 🔄 Development Workflow - MatchFlow Team

**Objetivo:** Mantener orden, evitar conflictos, trackear cambios  
**VCS:** Git + GitHub  
**Estrategia:** Git Flow con feature branches

---

## 📦 BRANCH STRUCTURE

```
main (production, protected)
  ↑
  └← develop (staging, where we test)
       ↑
       └← refactor (work in progress, 5 sprint branches)
            ├── feature/sprint-1-matches
            ├── feature/sprint-2-states
            ├── feature/sprint-3-reservations
            ├── feature/sprint-4-privacy
            └── feature/sprint-5-polish
```

---

## 🚀 HOW TO START WORKING

### Step 1: Clone (First Time Only)
```bash
git clone https://github.com/MatchFlow-F2/F2-MatchFlow.git
cd F2-MatchFlow
git branch -a  # Ver todas las branches
```

### Step 2: Create Your Feature Branch
```bash
# Ir a refactor (base branch para todos)
git checkout refactor

# Actualizar locales
git pull origin refactor

# Crear tu rama
git checkout -b feature/sprint-X-description
# Example:
git checkout -b feature/sprint-1-matches
git checkout -b feature/sprint-3-reservations
```

### Step 3: Do Your Work
```bash
# Edit files, create code
# Test locally

# See what changed
git status

# Stage your changes
git add .
# OR stage specific files:
git add src/utils/match-logic.js docs/CUMPLIMIENTO_CRUDZASO.md

# Commit with good message
git commit -m "feat(sprint-3): createReservation validation function"
# OR
git commit -m "fix: hardcoded companyId in jobs.js"
# OR
git commit -m "test: add integration test for reservation flow"
```

### Step 4: Push to GitHub
```bash
# Push tu rama por primera vez
git push -u origin feature/sprint-X-something

# Push cambios siguientes (ya tienes -u set)
git push origin feature/sprint-X-something
```

### Step 5: Create Pull Request
```
1. Go to https://github.com/MatchFlow-F2/F2-MatchFlow
2. Click "Compare & pull request"
3. Title: "feat(sprint-X): description"
4. Description: What did you do, any blockers?
5. Request review from @Dev4 (Tech Lead)
6. Wait for approval
```

---

## 💬 GIT COMMIT MESSAGE FORMAT

### Template
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples
```
feat(sprint-1): add createMatch() function with validation

- Validate duplicate matches
- Return created match with ID
- Error handling for business rules
- Tested with sample jobs

Closes #123
```

```
fix(hardcoded): remove companyId=1 hardcoding in jobs.js

Replace hardcoded `companyId: 1` with dynamic fetch from localStorage
to allow multi-company support.

Fixes #456
```

```
test(sprint-3): add integration test for reservation flow

- Test creation with job selection
- Test conflict detection
- Test release functionality

Related to #789
```

### Types (pick one)
- **feat:** Nueva feature
- **fix:** Bug fix
- **docs:** Cambios documentación
- **test:** Tests o test cases
- **refactor:** Refactoring sin feature nueva
- **perf:** Performance improvements
- **style:** Formatting, missing semicolons, etc.

### Scopes (pick one)
- **sprint-1, sprint-2, sprint-3, sprint-4, sprint-5**
- **hardcoded, performance, docs, testing, etc.**

---

## ✅ CODE REVIEW PROCESS

### As a Developer (Reviewer Role)
```
1. Someone creates PR
2. You get notified
3. Click "Files changed"
4. Review the code:
   - Does it do what it says?
   - Is it well-written?
   - Any security issues?
   - Any performance issues?
5. Comment on specific lines if needed
6. Click "Approve" if looks good
   OR "Request changes" if not
```

### As a Reviewer (Tech Lead / Dev 4)
```
1. Check if PR solves the problem
2. Run locally if needed:
   git fetch origin
   git checkout feature/sprint-X-something
   npm install (if needed)
   # Test manually

3. Look for:
   - ✅ Code quality
   - ✅ No breaking changes
   - ✅ Error handling
   - ✅ Tests included
   - ✅ Follows naming conventions
   - ✅ Documentation updated

4. Approve or request changes

5. After approval: Click "Merge pull request"
```

### After Merge
```bash
# Developer syncs local with latest
git checkout refactor
git pull origin refactor

# Continue with next sprint
git checkout -b feature/sprint-X-next
```

---

## 🚨 HANDLING CONFLICTS

### If You Have Merge Conflicts
```bash
# Pull latest develop/refactor
git fetch origin
git rebase origin/refactor
# OR merge if rebase seems complex
git merge origin/refactor

# Git will mark conflicts like:
# <<<<<<< HEAD
#   your changes
# =======
#   their changes
# >>>>>>>

# 1. Edit the file, keep what you want
# 2. Remove the conflict markers
# 3. Test it works
git add .
git commit -m "resolve: merge conflicts in file.js"
git push origin feature/sprint-X-something

# PR will update automatically
```

### Preventing Conflicts
- Keep branches short-lived (< 1 day)
- Pull origin refactor daily: `git pull origin refactor`
- Don't edit same files as teammates simultaneously
- Communicate in channel: "I'm modifying X file, don't touch"

---

## 📊 MON ITORING CHANGES

### See What You Changed
```bash
# Last 5 commits
git log --oneline -5

# Changes not yet committed
git status

# Detailed changes
git diff

# Changes already staged
git diff --staged

# All changes in this branch vs refactor
git diff refactor...HEAD
```

### Undo Things
```bash
# Undo uncommitted changes in a file
git checkout -- filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️
git reset --hard HEAD~1

# Only if you haven't pushed yet!
```

---

## 🔗 WORKING WITH REMOTE

### Sync with Team
```bash
# See what's new on GitHub
git fetch origin

# Update your local develop/refactor
git checkout refactor
git pull origin refactor

# Merge into your feature branch to get latest
git merge refactor
# OR rebase (cleaner history)
git rebase origin/refactor
```

### Push Your Changes
```bash
# First time
git push -u origin feature/sprint-X-something

# After that
git push

# Force push ⚠️ Only if you're squashing commits and no one else is on branch
git push --force-with-lease
```

---

## 🎯 DAILY WORKFLOW EXAMPLE

### Morning
```bash
# Start day standup
# Get assigned tasks from Dev 4 / TEAM_ASSIGNMENT_GUIDE.md

# Update local code
git fetch origin
git checkout refactor
git pull origin refactor

# Create (or switch to) your branch
git checkout feature/sprint-1-matches
git merge refactor  # Stay in sync

# Start coding
code src/utils/match-logic.js
```

### During Day
```bash
# Every couple hours, commit progress
git add src/utils/match-logic.js
git commit -m "feat(sprint-1): add createMatch validation logic"
git push

# Check for new PRs from teammates
# Test their changes locally
```

### End of Day
```bash
# Stage all changes
git add .

# Commit everything
git commit -m "feat(sprint-1): createMatch function complete

- validateReservationConflict working
- createReservation endpoint tested
- releaseReservation ready
- Error handling in place

Ready for code review"

# Push
git push

# Create PR if not already created
# Tag Dev 4 for review
```

---

## 🐛 TROUBLESHOOTING

### "I committed to wrong branch"
```bash
# Say you committed to refactor but should be in feature branch
git reset HEAD~1  # Undo commit, keep changes
git stash  # Save your changes
git checkout -b feature/sprint-X-correct
git stash pop  # Restore changes
git commit -m "..."
git push -u origin feature/sprint-X-correct
```

### "I want to see what my changes will look like in main/develop"
```bash
git log --oneline --graph --decorate --all
# Shows visual tree of all branches and commits
```

### "I want to discard all local changes and start fresh"
```bash
git reset --hard origin/refactor
# ⚠️ This removes all local work! Only if unsaved.
```

### "I want to see when a file was changed"
```bash
git log --oneline -- src/utils/match-logic.js
# Shows all commits that touched this file

git blame src/utils/match-logic.js
# Shows who changed each line last
```

---

## 📋 CHECKLIST BEFORE PUSHING

- [ ] Code is written and working locally
- [ ] No console errors or warnings
- [ ] Tested with actual data (not just sample)
- [ ] No hardcoded values or API keys
- [ ] Error messages are user-friendly
- [ ] Comments/docs for complex logic
- [ ] Commit message is clear and follows format
- [ ] Feature branch name matches your task
- [ ] You've pulled latest refactor before push
- [ ] PR description explains what you did

---

## 📞 QUESTIONS?

Need help? Ask in Discord / WhatsApp:
- `git` questions → Dev 4
- Feature questions → Dev 1 (backend) or Dev 2 (frontend)
- Merge/PR issues → Dev 4
- Architecture questions → Dev 4

**Remember:** It's better to ask than to break something! 💪

---

**Last Updated:** 2026-02-05  
**For Questions:** See TEAM_ASSIGNMENT_GUIDE.md
