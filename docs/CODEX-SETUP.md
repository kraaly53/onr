# Setting up ChatGPT Codex for the Overnight Radio website

This guide gets someone from zero to making their first website change with ChatGPT Codex. It takes about
15 minutes. You don't need to install anything on your computer.

**How it works, in one line:** you ask Codex for a change in plain English → Codex makes it and opens a
*pull request* on GitHub → you check it and click **Merge** → the test site updates a few minutes later.

> ChatGPT's menus change from time to time. If a button below is named slightly differently, look for the
> closest match — the steps stay the same.

---

## Before you start (one-off, for each person)

You need two accounts:

1. **A ChatGPT plan that includes Codex** — Plus, Pro, Business, Edu or Enterprise. (The free plan has limited
   Codex use.)
2. **A GitHub account** — free at [github.com/signup](https://github.com/signup).

**The repository owner (kraaly53) then gives that GitHub account access:**

1. Open [github.com/kraaly53/onr](https://github.com/kraaly53/onr) → **Settings** → **Collaborators**
   → **Add people**.
2. Type the person's GitHub username or email and send the invite.
3. The person accepts the invite from the email (or from their GitHub notifications).

---

## Step 1 — Open Codex

1. Go to [chatgpt.com](https://chatgpt.com) and sign in.
2. Open **Codex** (in the left sidebar), or go straight to [chatgpt.com/codex](https://chatgpt.com/codex).
3. When starting a task, choose **Work in → Cloud**. (Cloud means Codex works on its own computer in the
   cloud — nothing runs on yours.)

## Step 2 — Connect GitHub

1. Open the **Select environment** picker and choose **Create environment**
   (or **Settings → Codex Cloud → Environments → Create environment**).
2. When asked, choose **Connect GitHub**. GitHub opens and asks you to install/authorize the ChatGPT app.
3. Under repository access, choose **Only select repositories** and pick **kraaly53/onr**. Approve.

## Step 3 — Create the environment for this website

1. Back in Codex, select the repository **kraaly53/onr** and choose **Get started**.
   Codex looks at the project and prepares it. It should find everything it needs on its own.
2. Check these settings (Codex usually fills them in for you):

   | Setting | What to use |
   |---|---|
   | **Repository** | `kraaly53/onr` |
   | **Install script** (setup script) | `npm ci` |
   | **Node.js version** | 20 (the project says so in a file called `.nvmrc`). If there's a "package versions" setting, pick Node 20. |
   | **Environment variables / Secrets** | **None.** Leave empty. Never add the website's FTP password here. |
   | **Internet access** | Turn on **package manager domains** (needed to install the build tool). Optionally add `overnightradio.com` so photos and audio show up in Codex's previews. |
   | **Who can use** | **Only me** is fine. On a Business/Enterprise workspace you can share it with the workspace instead. |

3. If Codex asks a question during setup, answer it (for example "use npm ci", "Node 20").
4. Review the setup summary and choose **Publish**.

## Step 4 — Your first test task

Start a new task (**Work in → Cloud**, environment: the one you just published) and send:

> Read AGENTS.md and README.md, run `npm run build`, and tell me in plain English what this project is
> and how changes get published. Don't change anything.

You should get a short summary and a successful build ("Wrote 248 files" or similar). If the build fails,
see *Troubleshooting* below.

## Step 5 — Make a real change

Try something small, for example:

> Change the Large Market Gold price to $2450, then open a pull request.

Codex will:
1. make the change and build the site to check it,
2. show you what it changed (a "diff"),
3. open a **pull request** on GitHub (if it doesn't, choose **Create PR** / **Open pull request** in the task).

## Step 6 — Review and publish

1. Open the pull request link (or [github.com/kraaly53/onr/pulls](https://github.com/kraaly53/onr/pulls)).
2. Wait for the **Build check** at the bottom to turn **green** ✓ (about 30 seconds).
3. Read Codex's description of what changed. If it looks right, click **Merge pull request** → **Confirm merge**.
4. About 3–6 minutes later the change is live at
   **https://www.ordinaryspoon.com/testing/onr/**. (Progress shows under the repository's **Actions** tab.)

Don't want it after all? Click **Close pull request** instead — nothing goes live.

---

## Things you can ask Codex

- "Add this as a new blog post: … " (paste the text — add a title, date or category if you like)
- "Add a new announcer called Jordan — here's the bio" (attach their photo and voice sample)
- "Update Mike's bio to …"
- "Move Sarah to the top of the Talent list"
- "Mark Patrick as roster" / "Mark Patrick as non-roster"
- "Change the phone number on the site to …"
- "Work on GitHub issue #2" (the go-live tasks are issues labelled `launch`)

Codex follows the project's rules automatically (they're in `AGENTS.md`): it keeps your wording as written,
keeps page addresses the same, and opens a pull request rather than publishing directly.

---

## Troubleshooting

| What you see | What to do |
|---|---|
| Codex can't find the repository | Make sure your GitHub invite to `kraaly53/onr` was accepted, and that the ChatGPT app on GitHub has access to it (GitHub → Settings → Applications → ChatGPT → Configure). |
| `npm ci` fails during setup | Turn on **package manager domains** (or full internet access) for the environment, then republish. |
| The build fails | Ask Codex: "The build failed — read the error, fix it and try again." Usually it's a typo in a file's settings at the top. |
| Build check is red on the pull request | Don't merge. Click **Details** to see the error, or paste the link to Codex and ask it to fix the same pull request. |
| Photos don't show in Codex's preview | Expected unless `overnightradio.com` is allowed in internet access — the live site is fine. |
| The website deploy failed with `550 … No such file or directory` | Harmless. Repository → **Actions** → open the failed run → **Re-run jobs**. |
| The test site looks out of date | Wait a minute and refresh, or add `?v=1` to the end of the address. |
| You only see "Codex Cloud (Legacy)" settings | Same idea: at [chatgpt.com/codex/settings/environments](https://chatgpt.com/codex/settings/environments) create an environment for `kraaly53/onr`, set **Setup script** to `npm ci` and the Node.js version to 20. |

---

More detail on every file and setting: [README.md](../README.md). Rules Codex follows: [AGENTS.md](../AGENTS.md).
