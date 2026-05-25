# Git Cleanup Plan for ai-wallet-assistant

**Approved Plan Steps:**

1. ✅ Install Git for Windows - **Download https://git-scm.com/download/win → Run installer → Restart VSCode**
2. ❌ `git --version` still fails (install pending)
3. [ ] Check `git status` for CapCut files
4. ✅ Created .gitignore with AppData/CapCut exclusions
5. [ ] `git rm --cached -r "AppData/Local/CapCut/"` (remove from index)
6. [ ] `git commit -m "Cleanup: remove CapCut cache files, add .gitignore"`
7. [ ] Verify clean `git status`
8. [ ] Test project run (backend/frontend)

**Status**: .gitignore ✅ | Git install needed (`git` not in PATH). VSCode Git panel should now ignore new CapCut files. Check if warnings gone.

