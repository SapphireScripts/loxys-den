# How to Put Loxys Den Online (Free)

This guide walks you through hosting your site on **Render.com** (free tier). Your site will be live 24/7 without running your PC.

---

## What You'll Get

- **Your site:** Something like `https://loxys-den.onrender.com`
- **Works on phones, tablets, anywhere** – anyone with the link can play
- **Free** – no credit card needed for the free tier

---

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to **[github.com](https://github.com)** and click **Sign up**
2. Create a free account

---

## Step 2: Put Your Code on GitHub

You need to upload your project folder to GitHub. Here are two ways:

---

### Option A: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop:** Go to [desktop.github.com](https://desktop.github.com) and download it. Install it and sign in with your GitHub account.

2. **Add your loxys-den folder:**
   - In GitHub Desktop, click **File** (top left) → **Add Local Repository**
   - Click **Choose...** (or "Add" depending on version)
   - In the window that opens, go to: `C:\Users\parke`
   - Click the **loxys-den** folder to select it
   - Click **Select Folder** (or "Add Repository")

3. **If it says "This directory does not appear to be a Git repository":**
   - Click **create a repository**
   - Name: `loxys-den`
   - Leave everything else as default
   - Click **Create Repository**

4. **Publish to GitHub:**
   - Click the blue **Publish repository** button (top right)
   - Uncheck **"Keep this code private"** so it's public (Render needs this)
   - Click **Publish Repository**
   - Your code is now on GitHub!

---

### Option B: Using the GitHub Website (No App Needed)

1. **Create a new empty repository:**
   - Go to [github.com](https://github.com) and sign in
   - Click the **+** icon (top right) → **New repository**
   - **Repository name:** type `loxys-den`
   - Set to **Public**
   - Do NOT check "Add a README" – leave it empty
   - Click **Create repository**

2. **Upload your files:**
   - You'll see a page that says "Quick setup"
   - Click the link that says **"uploading an existing file"** (in gray text)

3. **Open your loxys-den folder on your PC:**
   - Press **Windows key + E** to open File Explorer
   - Go to: `C:\Users\parke\loxys-den`
   - You should see: index.html, mines.html, crash.html, login.html, admin.html, leaderboard.html, auth-api.js, config.js, backend folder, and other files

4. **Drag files into the browser:**
   - Select ALL files and folders EXCEPT:
     - **backend\node_modules** – do NOT upload this (it's huge)
     - **backend\loxys_den.db** – do NOT upload (local database file)
     - **stuff** folder – optional to skip
   - Drag everything else into the dashed box on the GitHub page
   - Wait for the upload to finish (you'll see each file appear)

5. **Commit:**
   - Scroll down
   - In the box that says "Commit message", type: `Initial upload`
   - Click the green **Commit changes** button

6. **If you need to add the backend files:**
   - After the first commit, click **Add file** → **Upload files**
   - Go to `C:\Users\parke\loxys-den\backend` in File Explorer
   - Select: server.js, db.js, package.json (and any other .js files in backend)
   - Do NOT select the **node_modules** folder – skip it!
   - Drag them in, commit again

**Your folder structure on GitHub should look like:**
```
loxys-den/
├── index.html
├── mines.html
├── crash.html
├── login.html
├── admin.html
├── leaderboard.html
├── auth-api.js
├── config.js
├── backend/
│   ├── server.js
│   ├── db.js
│   └── package.json
└── (other files - README, etc.)
```

---

### Where is my code now?

After uploading, go to `https://github.com/YOUR-USERNAME/loxys-den` (replace YOUR-USERNAME with your GitHub username). You should see all your files listed there. That's your "repository" – Render will pull your code from there.

---

## Step 3: Create a Render Account

1. Go to **[render.com](https://render.com)**
2. Click **Get Started**
3. Sign up with your **GitHub** account (easiest – it connects automatically)

---

## Step 4: Create the Database

1. On Render dashboard, click **New +** → **PostgreSQL**
2. **Name:** `loxys-den-db`
3. **Region:** Pick one close to you (e.g. Oregon)
4. Click **Create Database**
5. Wait ~1 minute for it to spin up
6. Copy the **Internal Database URL** (starts with `postgresql://`)
   - Click to copy – you'll need this in the next step

---

## Step 5: Deploy the Backend

1. Click **New +** → **Web Service**
2. **Connect your GitHub** if asked
3. Find and select your **loxys-den** repo
4. **Configure:**
   - **Name:** `loxys-den-api`
   - **Region:** Same as your database
   - **Root Directory:** Type `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Environment Variables** – Click "Add Environment Variable" and add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Paste the Internal Database URL from Step 4 |
   | `JWT_SECRET` | Type any random string (e.g. `mySecretKey123ChangeThis`) |
   | `ADMIN_PASSWORD` | Your admin password (e.g. `P@rkerD3visser2011`) |

6. Click **Create Web Service**
7. Wait 2–5 minutes for it to deploy
8. When it says "Live", copy your backend URL (e.g. `https://loxys-den-api.onrender.com`)

---

## Step 6: Deploy the Website (Frontend)

1. Click **New +** → **Static Site**
2. Select your **loxys-den** repo again
3. **Configure:**
   - **Name:** `loxys-den`
   - **Build Command:** Leave empty
   - **Publish Directory:** `.` (just a dot)

4. Click **Create Static Site**
5. **Before it finishes** – you need to point the website to your backend:
   - Go to your GitHub repo
   - Open `config.js`
   - Click the pencil icon to edit
   - Change the line to:
     ```javascript
     window.LOXYS_API = 'https://loxys-den-api.onrender.com';
     ```
     (Use YOUR backend URL from Step 5 – no slash at the end!)
   - Click **Commit changes**
6. Go back to Render – it will automatically re-deploy with the new config
7. When it's done, your site is at something like `https://loxys-den.onrender.com`

---

## Step 7: Test It!

1. Open your site URL
2. Register a new account
3. Play Mines or Crash
4. Try the Admin page (use your ADMIN_PASSWORD)

---

## Important Notes

**Free tier sleep:** If no one visits for ~15 minutes, Render puts your backend to sleep. The first visit after that might take 20–30 seconds to wake up. That's normal.

**Your URLs:**
- **Website:** `https://loxys-den.onrender.com` (or whatever Render gave you)
- **Admin:** Same URL + `/admin.html` (e.g. `https://loxys-den.onrender.com/admin.html`)

**Changing your site later:** Edit the files in your repo on GitHub, commit, and Render will auto-deploy the changes.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Could not reach server" | Check `config.js` has the correct backend URL (with `https://`) |
| Login/Register doesn't work | Make sure DATABASE_URL is set in the backend's Environment variables |
| Admin password wrong | Set ADMIN_PASSWORD in the backend's Environment variables |
| Site takes forever to load first time | Backend was sleeping – wait 20–30 seconds |

---

## Need Help?

Check the backend **Logs** in Render: go to your Web Service → Logs. Errors will show there.
