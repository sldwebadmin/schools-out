# SETUP_GUIDE.md — One-Time Setup (Non-Developer Edition)

Total setup: roughly 30 minutes, once. After this, your loop is: open Claude Code → paste a prompt from PROMPTS.md → play the result at your live URL.

## The direct answer to "can this work?"

Yes, fully. Claude Code runs **locally on your machine** and does the development; it also drives **git and GitHub** itself (creating the repo, committing, pushing), and a small **GitHub Actions** workflow it writes in Phase 1 automatically publishes every push to **GitHub Pages** — a free public URL where the game is playable by anyone, on any device, including your phone. You never manually "deploy" anything. Your job is: paste prompts, answer its questions, play the game, give feedback.

## What you need

| Tool | What it's for | Cost |
|---|---|---|
| **Claude Code** | The developer. Desktop app (no terminal needed) or terminal install. | Included with Claude Pro/Max/Team plans (not the free plan), or pay-per-use API billing |
| **Git** | Version history — your undo button. Claude Code uses it for you. | Free |
| **GitHub account** | Hosts the code + the free public demo (GitHub Pages) | Free |
| **GitHub CLI (`gh`)** | Lets Claude Code create the repo and manage GitHub for you | Free (Claude Code will help install it in Phase 1) |
| **Node.js LTS** | Runs Vite (the dev server/build tool) | Free |
| **Tiled** (Phase 4 only) | Visual map editor — drag-and-drop world editing | Free — mapeditor.org |

VS Code is optional. You don't need to read code for this workflow; the live URL is your review tool.

## Setup steps

**1. GitHub account** — github.com → Sign up. Free tier is all you need (public repos get free Pages hosting).

**2. Install Claude Code** — two good options:
   - **Easiest: the Claude Desktop app's Claude Code interface** — no terminal required, point it at a folder and chat. Download from claude.com.
   - **Terminal install:** follow the official setup page at https://code.claude.com/docs/en/setup — the native installer is the recommended path (one command, no prerequisites, auto-updates; Windows PowerShell is supported natively). If anything misbehaves later, run `claude doctor`.
   - First launch opens your browser to sign in with your Claude account.

**3. Install Node.js** — nodejs.org → download the **LTS** version → run the installer with defaults. (To check it worked: open a new terminal and type `node --version`.)

**4. Install Git** — Windows: git-scm.com → installer, accept all defaults. (Check: `git --version`.) When Claude Code first commits, it may ask you to set your name/email — it will give you the exact two commands.

**5. Create your project folder** — e.g. `Documents\schools-out`. Copy **all files from this handoff package** into it (the .html game file, MIGRATION_BRIEF.md, CLAUDE.md, PROMPTS.md, DESIGN_DOC.md).

**6. Start Phase 0** — open Claude Code in that folder and paste the Phase 0 prompt from PROMPTS.md.

## How GitHub fits (so the magic isn't mysterious)

- **Repo** = your project's home on GitHub, with full history of every change.
- **Push** = Claude Code uploading the latest commits there.
- **GitHub Actions** = a robot GitHub runs on every push; ours runs the build.
- **GitHub Pages** = free static hosting; the Action publishes the build there, giving you a permanent URL like `https://<your-username>.github.io/schools-out/` — that's your demo link to text to anyone.

In Phase 1, Claude Code sets all of this up and walks you through the one-time `gh auth login` (it shows a code, you approve it in your browser — that's it).

## When something goes wrong

1. Tell Claude Code exactly what you saw — paste the error or describe the behavior. Fixing its own messes is a core skill.
2. The panic button: *"Revert to the last commit where the game worked."*
3. Install/auth weirdness: run `claude doctor`, or check https://code.claude.com/docs/en/setup.
4. Nothing you do can break the published game silently — the live URL only updates when a push succeeds, and the previous version stays in git history forever.

## Cost reality check

Hosting: $0 (GitHub Pages). Tools: $0. The only cost is your Claude plan — Claude Code usage draws from your subscription's limits (or API billing if you go that route). One phase per session fits comfortably in normal usage patterns.
