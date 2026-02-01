# Deploy Loxys Den to Render.com

Step-by-step guide to put your site online (no PC needed to run it).

---

## Part 1: Create a GitHub Account & Repo

### 1.1 Sign up for GitHub
- Go to [github.com](https://github.com) and create a free account

### 1.2 Create a new repository
- Click the **+** in the top right → **New repository**
- Name it: **loxys-den**
- Set to **Public**
- Click **Create repository**

### 1.3 Upload your files
You need to put your code in the repo. Two options:

**Option A: Using GitHub Desktop (easiest)**
1. Download [GitHub Desktop](https://desktop.github.com)
2. Sign in, then File → Add Local Repository
3. Create a new folder like `C:\Users\parke\loxys-den`
4. Copy these files into it:
   - From Desktop: index.html, crash.html, mines.html, leaderboard.html, login.html, auth-api.js, config.js
   - From loxys-den-backend: server.js, db.js, package.json (and the whole backend folder)
5. Create this folder structure:
   ```
   loxys-den/
   ├── index.html
   ├── crash.html
   ├── mines.html
   ├── leaderboard.html
   ├── login.html
   ├── auth-api.js
   ├── config.js
   └── backend/
       ├── server.js
       ├── db.js
       ├── package.json
       └── (other backend files)
   ```
6. In GitHub Desktop: Publish repository

**Option B: Using git in terminal**
```bash
cd C:\Users\parke
mkdir loxys-den
cd loxys-den
# Copy files into loxys-den folder (structure above)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/loxys-den.git
git push -u origin main
```

---

## Part 2: Deploy Backend on Render

### 2.1 Create a PostgreSQL database
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Name it: **loxys-den-db**
4. Choose **Free** plan
5. Click **Create Database**
6. Wait for it to spin up, then copy the **Internal Database URL** (you'll need it)

### 2.2 Create the Web Service (backend)
1. Click **New +** → **Web Service**
2. Connect your GitHub account if prompted
3. Select your **loxys-den** repo
4. Configure:
   - **Name:** loxys-den-api
   - **Region:** Oregon (or closest to you)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 2.3 Add environment variables
In the Web Service, go to **Environment**:
- Add **DATABASE_URL** → paste the Internal Database URL from step 2.1
- Add **JWT_SECRET** → type a random long string (e.g. `my-super-secret-key-change-this-12345`)

Click **Save Changes**

### 2.4 Deploy
Click **Create Web Service**. Wait for the deploy to finish (2–5 min).

Copy your backend URL (e.g. `https://loxys-den-api.onrender.com`). You’ll use this next.

---

## Part 3: Deploy Frontend on Render

### 3.1 Create a Static Site
1. Click **New +** → **Static Site**
2. Select your **loxys-den** repo
3. Configure:
   - **Name:** loxys-den
   - **Root Directory:** leave empty (or `.` if it asks)
   - **Build Command:** leave empty
   - **Publish Directory:** `.` (or leave empty)

### 3.2 Point frontend to your backend
Before deploying, set the backend URL in `config.js`:

1. In your repo (on GitHub), open **config.js**
2. Change the line to:
   ```javascript
   window.LOXYS_API = 'https://loxys-den-api.onrender.com';
   ```
   (Use your actual backend URL from Part 2.4)
3. Commit and push the change

### 3.3 Deploy
Click **Create Static Site**. Wait for the deploy.

Your site will be at something like `https://loxys-den.onrender.com`

---

## Part 4: Test

1. Open your frontend URL (e.g. `https://loxys-den.onrender.com`)
2. Register a new account
3. Play a game
4. Check the leaderboard

It should work without your PC running.

---

## Notes

- **Free tier:** Render may sleep your backend after ~15 minutes of no traffic. The first request can take ~30 seconds to wake it.
- **Database:** PostgreSQL is free and keeps your data.
- **HTTPS:** Both frontend and backend use HTTPS by default.

---

## Troubleshooting

**"Can't connect to API"** – Check that `config.js` has the correct backend URL (with `https://` and no trailing slash).

**"User not found" / login fails** – Make sure DATABASE_URL is set in the backend environment variables.

**Backend errors** – In Render, open your Web Service → **Logs** to see errors.
