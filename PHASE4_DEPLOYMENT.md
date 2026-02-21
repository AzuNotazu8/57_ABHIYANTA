# AETHERA — PHASE 4: Docker + Deployment Guide

---

## OPTION A — Docker (Full Stack Locally)

This runs everything in containers: PostgreSQL, backend, and frontend.
No Python venv needed. No local PostgreSQL needed.

### Prerequisites

Install Docker Desktop for Windows:
https://www.docker.com/products/docker-desktop/

After install, open Docker Desktop and wait for it to say "Engine running".

Verify in PowerShell:
```powershell
docker --version
docker compose version
```

---

### Step 1 — Extract the zip

Extract `aethera_phase4.zip` to `C:\aethera\`

---

### Step 2 — Build and start everything

```powershell
cd C:\aethera
docker compose up --build
```

First run takes 3–5 minutes (downloads images, installs dependencies, builds frontend).

You will see logs from 3 services: `db`, `backend`, `frontend`.

Wait until you see:
```
backend  | INFO:     Application startup complete.
```

---

### Step 3 — Open the dashboard

Go to: **http://localhost:3000**

The API is at: **http://localhost:8000/docs**

Click **▶ Run Full Simulation** in the dashboard to populate data.

---

### Step 4 — Stop everything

```powershell
# Press Ctrl+C in the terminal, then:
docker compose down
```

To also delete the database volume (fresh start):
```powershell
docker compose down -v
```

---

### Step 5 — Restart later (no rebuild needed)

```powershell
cd C:\aethera
docker compose up
```

---

### Dev mode (hot-reload backend, local frontend)

Use this during development so you don't rebuild on every change:

```powershell
# Terminal 1 — Docker backend + DB only
docker compose -f docker-compose.dev.yml up --build

# Terminal 2 — Vite frontend with hot reload
cd C:\aethera\frontend
npm run dev
```

Backend runs in Docker on port 8000.
Frontend runs natively on port 5173 with instant refresh.

---

## OPTION B — Deploy to Render (Free Cloud Hosting)

Render offers a free tier that can host both the backend and frontend.

### Step 1 — Push to GitHub

Install Git: https://git-scm.com/download/win

```powershell
cd C:\aethera
git init
git add .
git commit -m "AETHERA initial commit"
```

Create a new repository on https://github.com (click New → name it `aethera` → Create).

Then push:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/aethera.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 2 — Sign up for Render

Go to https://render.com and sign up (free, use GitHub login).

---

### Step 3 — Create the PostgreSQL database

1. In Render dashboard → click **New** → **PostgreSQL**
2. Name: `aethera-db`
3. Plan: **Free**
4. Click **Create Database**
5. Copy the **Internal Database URL** shown on the database page

---

### Step 4 — Deploy the backend

1. Click **New** → **Web Service**
2. Connect your GitHub repo `aethera`
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables (click Add):
   - `DATABASE_URL` → paste the Internal Database URL from Step 3
   - `SECRET_KEY` → type any random string (e.g. `aethera_prod_2024_xk9`)
   - `ALLOWED_ORIGINS` → `https://aethera-frontend.onrender.com`
     *(you'll update this after frontend deploys)*
5. Plan: **Free**
6. Click **Create Web Service**

Wait for deploy. Note your backend URL: `https://aethera-backend-xxxx.onrender.com`

---

### Step 5 — Deploy the frontend

1. Click **New** → **Static Site**
2. Connect your GitHub repo `aethera`
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL` → your backend URL from Step 4 (e.g. `https://aethera-backend-xxxx.onrender.com`)
5. Click **Create Static Site**

---

### Step 6 — Update CORS on backend

Go back to your backend service on Render → Environment tab → update:
- `ALLOWED_ORIGINS` → your frontend URL (e.g. `https://aethera-frontend-xxxx.onrender.com`)

Click **Save Changes** — backend auto-redeploys.

---

### Step 7 — Open your live app

Visit your frontend Render URL. Click **▶ Run Full Simulation**.

⚠️ Free tier note: Render spins down free services after 15 min of inactivity.
First request after idle takes ~30 seconds to wake up. This is normal.

---

## OPTION C — Deploy to Railway (Free Tier)

Railway gives $5/month free credit which covers small projects.

### Step 1 — Sign up

Go to https://railway.app → sign up with GitHub.

### Step 2 — New Project from GitHub repo

1. Click **New Project** → **Deploy from GitHub repo**
2. Select your `aethera` repo
3. Railway detects the project

### Step 3 — Add PostgreSQL

1. In your project → click **+ New** → **Database** → **PostgreSQL**
2. Railway auto-generates the `DATABASE_URL`

### Step 4 — Configure backend service

1. Click your backend service → **Settings**
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt && alembic upgrade head`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Variables tab → add:
   - `DATABASE_URL` → click "Add Reference" → select your PostgreSQL `DATABASE_URL`
   - `SECRET_KEY` → any random string
   - `ALLOWED_ORIGINS` → your frontend Railway URL (set after frontend deploys)

### Step 5 — Configure frontend service

1. Click **+ New** → **GitHub Repo** → select `aethera` again
2. Root directory: `frontend`
3. Build: `npm install && npm run build`
4. Start: leave empty (Railway detects static)
5. Variables: `VITE_API_URL` → your backend Railway URL

---

## TROUBLESHOOTING

**"docker compose" not found** — Use `docker-compose` (older syntax) or update Docker Desktop.

**Port 3000 already in use**:
```powershell
docker compose down
netstat -ano | findstr :3000
```
Or change the port in `docker-compose.yml` from `3000:80` to `3001:80`.

**Backend crashes on startup in Docker** — Check logs:
```powershell
docker compose logs backend
```
Most common cause: migration failed. Check `DATABASE_URL` in docker-compose.yml.

**Frontend shows blank white page on Render** — Check that `VITE_API_URL` is set correctly without trailing slash.

**Alembic migration error on Render** — The free PostgreSQL might take 30s to start. Redeploy the backend service once.

**CORS errors in browser console** — `ALLOWED_ORIGINS` on the backend must exactly match the frontend URL (no trailing slash).
