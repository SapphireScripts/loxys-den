# Loxys Den

Fun Discord community casino - Mines & Crash games. Virtual currency only, no real money.

## Quick Start (Local)

### 1. Open Command Prompt or PowerShell

### 2. Go to the backend folder:
```
cd C:\Users\parke\loxys-den\backend
```

### 3. Install dependencies (first time only):
```
npm install
```

### 4. Start the server:
```
npm start
```

You should see:
```
============================================
  LOXY'S DEN - Backend API
============================================
  Database: SQLite (sql.js)
  API:     http://localhost:3000
============================================
```

**Keep this window open!** The server must stay running.

### 5. Open the website

Double-click **index.html** in the `loxys-den` folder, or run:
```
cd C:\Users\parke\loxys-den
npx serve .
```
Then open http://localhost:3000 (or whatever port it shows).

---

## Or use the batch file

Double-click **start-backend.bat** in the loxys-den folder. It will install dependencies if needed and start the server.

---

## Pages

- **index.html** - Home
- **login.html** - Login / Register
- **mines.html** - Mines game
- **crash.html** - Crash game  
- **admin.html** - Give balance (only works from IP 38.34.89.217)
- **leaderboard.html** - Top players

---

## Troubleshooting

**"Could not reach server"** - Make sure the backend is running (step 4 above). The black window must stay open.

**"Cannot find module"** - Run `npm install` in the backend folder first.

**Port 3000 in use** - Something else is using it. Close other apps or change PORT in server.js.
