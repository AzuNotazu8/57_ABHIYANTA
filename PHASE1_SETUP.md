# AETHERA – PHASE 1 SETUP GUIDE (Windows 11, PowerShell)

---

## STEP 1 — Create your project folder

Open PowerShell and run:

```powershell
cd C:\
mkdir aethera
cd aethera
```

---

## STEP 2 — Extract the zip

Copy the downloaded `aethera_phase1.zip` into `C:\aethera\` and extract it there.
Your folder should look like:

```
C:\aethera\
  backend\
    app\
    alembic\
    requirements.txt
    .env
    alembic.ini
```

---

## STEP 3 — Create and activate a virtual environment

```powershell
cd C:\aethera\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If you get a policy error, run this first (once):
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then re-run the activate command.

---

## STEP 4 — Install dependencies

```powershell
pip install -r requirements.txt
```

---

## STEP 5 — Create the PostgreSQL database

Open the PostgreSQL shell (search "psql" in Start menu) or use pgAdmin.

Run this SQL:
```sql
CREATE DATABASE aethera;
```

If using psql terminal:
```powershell
psql -U postgres
CREATE DATABASE aethera;
\q
```

---

## STEP 6 — Edit your .env file

Open `C:\aethera\backend\.env` in Notepad and update:

```
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/aethera
SECRET_KEY=any_random_string_here
ALLOWED_ORIGINS=http://localhost:5173
```

Replace `YOUR_ACTUAL_PASSWORD` with your PostgreSQL password.

---

## STEP 7 — Run Alembic migrations

In PowerShell (make sure venv is still active):

```powershell
cd C:\aethera\backend
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade  -> xxxx, initial_schema
```

---

## STEP 8 — Start the backend server

```powershell
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## STEP 9 — Verify it works

Open your browser and visit:

- http://127.0.0.1:8000  → should show `{"status":"AETHERA backend running"}`
- http://127.0.0.1:8000/docs → interactive API documentation

---

## STEP 10 — Test the simulation

In the Swagger UI at `/docs`:

1. Go to `POST /api/simulation/run`
2. Click "Try it out"
3. Use default body:
```json
{
  "year_start": 2014,
  "year_end": 2023,
  "scenario": "baseline"
}
```
4. Click Execute
5. You should get back 10 years of simulation results.

Then check `GET /api/simulation/results` to see all saved results.

---

## TROUBLESHOOTING

**"ModuleNotFoundError"** — Make sure your venv is active: `.\venv\Scripts\Activate.ps1`

**"password authentication failed"** — Check your password in `.env`

**"database aethera does not exist"** — Run `CREATE DATABASE aethera;` in psql

**"alembic command not found"** — Install again: `pip install alembic`

**Port 8000 in use** — Use a different port: `uvicorn app.main:app --reload --port 8001`

---

## WHAT PHASE 1 GIVES YOU

- PostgreSQL database with 2 tables: `climate_data` and `simulation_results`
- Auto-seeded 10-year synthetic climate data (2014–2023, labeled synthetic)
- Working simulation engine with all 6 cascade formulas
- REST API with full CRUD for climate data and simulation runs
- `/docs` Swagger UI for testing

---

## NEXT: Confirm Phase 1 works, then request PHASE 2

Phase 2 adds: projection engine (2024–2033), historical validation with MAE scoring, and validation endpoints.
