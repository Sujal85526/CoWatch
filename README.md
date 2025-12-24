# CoWatch

Simple, friendly README for developers — how to run the project locally and deploy.

## Project Overview

CoWatch is a web application built with Django (backend) and a Vite + React frontend. It uses Django Channels / ASGI for real-time features (rooms, websocket updates). The repo contains two main folders:

- `backend/` — Django project and API
- `frontend/` — Vite + React client

Key features:
- Real-time rooms using WebSockets (Django Channels)
- REST endpoints for persistence
- Vite-based frontend with React

## Project structure (important files)

- `backend/`
  - `manage.py` — Django management entry
  - `cowatch_backend/` — Django settings, ASGI entry (`asgi.py`)
  - `rooms/` — app with models, consumers, views, routing
  - `db.sqlite3` — default local DB (development)

- `frontend/`
  - `package.json` — frontend dependencies & scripts
  - `src/` — React source files (`App.jsx`, `main.jsx`, etc.)
  - `index.html` — Vite entry

## Prerequisites

- macOS (these steps are for zsh)
- Python 3.10+ (or compatible)
- Node.js (16+ recommended) and `npm` or `yarn`
- (Optional for production) Redis or another channel layer backend

## Development: Backend (Django)

1. Open a terminal and go to the backend folder:

```zsh
cd backend
```

2. Create and activate a virtual environment (if you don't already have one):

```zsh
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies. If a `requirements.txt` file exists, run:

```zsh
pip install -r requirements.txt
```

If there is no `requirements.txt`, install the main packages used by the project (example):

```zsh
pip install django djangorestframework channels channels-redis daphne
```

4. Apply migrations and create a superuser (for admin access):

```zsh
python manage.py migrate
python manage.py createsuperuser
```

5. Run the development server:

- For a normal Django dev server (HTTP only):

```zsh
python manage.py runserver
```

- For ASGI / WebSocket support (Django Channels) use Daphne (example port 8000):

```zsh
daphne -b 0.0.0.0 -p 8000 cowatch_backend.asgi:application
```

Note: The repo already shows `daphne` usage for ASGI — use that if you want websocket support in dev.

## Development: Frontend (Vite + React)

1. Open a terminal and go to the frontend folder:

```zsh
cd frontend
```

2. Install Node dependencies:

```zsh
npm install
# or
# yarn
```

3. Start the Vite dev server:

```zsh
npm run dev
```

Vite will provide a local address (usually `http://localhost:5173`). The frontend expects the backend API/websocket endpoints — adjust any environment variables if needed.

## Local environment variables

If the backend uses environment variables, create a `.env` file in `backend/` (or set your shell env vars). Common vars:

- `SECRET_KEY` — Django secret key
- `DEBUG` — `True` or `False`
- `ALLOWED_HOSTS` — comma-separated hosts
- `DATABASE_URL` — production DB connection
- Channel layer settings (e.g. Redis URL) if using channels-redis

Example `.env` (development only):

```text
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## How to test websocket functionality locally

- Start backend with Daphne (ASGI) so websocket endpoints are served:

```zsh
daphne -b 0.0.0.0 -p 8000 cowatch_backend.asgi:application
```

- Start the frontend dev server and open the site in your browser. Create or join a room to verify real-time updates.

## Production / Deployment (simple guide)

Below are two common deployment approaches. Choose one that fits your environment.

Option A — Daphne + Nginx + systemd (Linux server):
- Build the frontend: `cd frontend && npm run build`.
- Serve the built frontend with Nginx (or an object store / static host).
- Run Daphne behind Nginx for ASGI & websockets.
- Use Redis for the channel layer (install and configure `channels_redis`).
- Use `systemd` to run Daphne as a service and have Nginx reverse-proxy websocket traffic to Daphne.

Option B — Dockerized deployment:
- Create Dockerfiles for backend and frontend.
- Use `docker-compose` to run Django, Daphne, Redis, and an Nginx reverse proxy.
- Example services: `web` (Daphne), `redis`, `nginx`, `frontend` (static files build).

General production notes:
- Use a proper production database (Postgres recommended).
- Keep `DEBUG=False` and configure `ALLOWED_HOSTS`.
- Use HTTPS (TLS) via Nginx, Cloudflare, or a cloud load balancer.
- Secure and rotate `SECRET_KEY` and other sensitive env vars.

## Quick commands summary

```zsh
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
# For websockets
daphne -b 0.0.0.0 -p 8000 cowatch_backend.asgi:application

# Frontend
cd frontend
npm install
npm run dev
# Build for production
npm run build
```

## Troubleshooting

- If websockets fail, ensure Daphne is running and the channel layer is configured (Redis + `channels_redis`).
- If you see database errors, check `DATABASES` in `backend/cowatch_backend/settings.py` or set `DATABASE_URL`.
- If dependencies are missing, check for a `requirements.txt` in `backend/` and `package.json` in `frontend/`.

## Next steps / Contribution

- Add a `requirements.txt` to `backend/` (if missing) listing the Python dependencies used in the project.
- Add a `Dockerfile` and `docker-compose.yml` for easier deployment.

---

If you'd like, I can:
- Create a `requirements.txt` from the environment used here,
- Add a Dockerfile + docker-compose example,
- Or commit this `README.md` and open a PR for review.

Path: `./README.md`