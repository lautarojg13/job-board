# Django REST Framework & React Job Board with Local AI

A full-stack, AI-enhanced job board application built with Django REST Framework and React 19. The platform solves the hiring friction between job seekers and employers by providing structured job discovery, application tracking, and asynchronous AI-powered resume screening and natural language job search using a local LLM (Ollama).

---

## Architecture & System Design

The application is split into two independent services containerized via Docker Compose:
- **Backend (`/backend`)**: Django 5.2 REST API handling business logic, authentication, relational data models (MySQL), and background job processing (Celery + Redis).
- **Frontend (`/frontend`)**: React 19 SPA (Vite + TypeScript + Tailwind CSS v4) communicating via REST endpoints, featuring a client-side Demo Mode for isolated UI development.
  > **Developer Note:** This user interface was largely generated using Google AI Studio to rapidly deliver a functional and polished frontend. The core technical focus, architectural design, and handcrafted codebase of this project reside entirely in the backend services (Django/DRF, Celery, Redis, MySQL, Ollama, and Docker orchestration).

---

## Technical Features & Workflows

### 1. Authentication & Authorization
- **JWT Authentication**: Managed via `djangorestframework-simplejwt` and `dj-rest-auth`. Access and refresh tokens handle session state.
- **Email Verification**: Mandatory email verification workflow implemented using `django-allauth`.
- **Role Separation**: Endpoints are secured via DRF permission classes distinguishing between job seekers and employers.

### 2. Job Posting & Application Workflow
- **Job Lifecycle**: Employers can register companies, post, edit, and archive job listings. Deletion utilizes soft-deleting (`status=ARCHIVED`, returning `204 No Content`).
- **Application Tracking**: Job seekers upload resumes and cover letters. Applications track statuses (`Pending`, `Reviewed`, `Accepted`, etc.).

### 3. Asynchronous AI Tasks (Celery & Ollama)
- **Non-blocking Operations**: CPU-heavy or network-bound AI analysis (resume compatibility scoring and natural language parsing) are offloaded to Celery background workers via Redis broker.
- **Task Polling**: AI endpoints return an HTTP `202 Accepted` with a `task_id`. The frontend polls `GET /jobs/task-status/<task_id>/` until completion.
- **Bridge Service**: Synchronous Django views bridge to asynchronous agent execution using `async_to_sync` (asgiref).

### 4. Frontend Demo Mode
- **Zero-Backend Development**: `apiFetch` routes requests to `demoService.ts` (`localStorage` mocks) by default unless `VITE_ENABLE_DEMO_MODE=false`.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Python 3.12 (Docker) / 3.14 (local venv), Django 5.2, Django REST Framework 3.16 |
| **Database & Broker** | MySQL 8.0 (`pymysql`), Redis 7 |
| **Async Tasks** | Celery 5 |
| **AI Integration** | Local Ollama service (`http://ollama:11434/api/generate` in Docker, `OLLAMA_API_URL`) |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **API Documentation** | `drf-spectacular` (Swagger UI & ReDoc) |
| **Authentication** | `dj-rest-auth`, `django-allauth`, `djangorestframework-simplejwt` |
| **Testing** | **Backend:** `pytest`<br>**Frontend:** Vitest (Unit/Component), Playwright (E2E) |
| **Containerization** | Docker, Docker Compose |

---

## API Documentation

Interactive API schemas and documentation are auto-generated using `drf-spectacular`:
- **OpenAPI Schema**: `/api/schema/`
- **Swagger UI**: `/api/docs/`

---

## Environment Variables

The project uses a single root `.env` file (copied from `.env.example`). Key configuration variables:

```ini
# Django Core
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,backend

# MySQL Database
DB_NAME=jobboard
DB_USER=root
DB_PASSWORD=secret
DB_HOST=db
DB_PORT=3306
MYSQL_ROOT_PASSWORD=secret

# Celery & Redis
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# JWT Settings
JWT_SIGNING_KEY=your-jwt-signing-key

# AI Model
OLLAMA_MODEL_NAME=llama3.2:3b   # light default for quick start; llama3:8b for a more realistic experience
# OLLAMA_API_URL=http://localhost:11434/api/generate   # optional; overridden to http://ollama:11434/api/generate in Docker

# AI Provider
AI_PROVIDER=ollama   # ollama (local) | openai | deepseek | gemini (cloud, OpenAI-compatible)

# Email (Required for allauth verification)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=user@example.com
EMAIL_HOST_PASSWORD=password
DEFAULT_FROM_EMAIL=webmaster@localhost

# CORS & Startup
CORS_ALLOWED_ORIGINS=http://localhost:3000
SEED_ON_START=true
```

---

## Local Development & Setup

### Prerequisites
- Docker and Docker Compose
- **Ollama**: Runs as a Docker Compose service (`ollama`) and pulls `OLLAMA_MODEL_NAME` on first start only if it isn't already present. For local (non-Docker) development, run Ollama on the host at `http://localhost:11434`.
- Note: Inside Docker, Ollama runs on CPU by default. To use GPU acceleration on Linux, add a `gpus: all` / device mapping to the `ollama` service in `docker-compose.yml`.

### Choosing an AI Model (Ollama)

The default `OLLAMA_MODEL_NAME=llama3.2:3b` (~2 GB download) is a good balance of speed and quality for testing on CPU. Swap it for a lighter or heavier model depending on your hardware and how close to the "real" experience you want to get:

| Use case | Model | Download size | Notes |
| --- | --- | --- | --- |
| Quick start / testing | `llama3.2:3b` | ~2 GB | Fast on CPU, good JSON output |
| Lightest | `llama3.2:1b` | ~1.3 GB | For very limited machines |
| Realistic experience | `llama3:8b` | ~4.7 GB | More accurate, closer to production |

To switch models, set `OLLAMA_MODEL_NAME` in `.env` and recreate the container: `docker compose up -d ollama`. The model download happens only once; the rest of the stack (backend, Celery, frontend) starts regardless, so AI endpoints simply return an error until the model is ready.

### Swapping the AI Provider (Cloud)

The LLM call is abstracted behind a provider layer (`backend/agents/agent_bridge.py` + `backend/agents/providers/`), so Ollama is not the only option. Set `AI_PROVIDER` in `.env` to one of:

| Provider | `AI_PROVIDER` | Default model | Requires |
| --- | --- | --- | --- |
| Ollama (local) | `ollama` | `llama3.2:3b` | nothing extra |
| OpenAI | `openai` | `gpt-4o-mini` | `AI_API_KEY` |
| DeepSeek | `deepseek` | `deepseek-chat` | `AI_API_KEY` |
| Gemini | `gemini` | `gemini-2.0-flash` | `AI_API_KEY` |

All cloud providers use OpenAI-compatible chat-completions endpoints, so no code changes are needed — restart the backend after editing `.env`. `AI_BASE_URL` and `AI_MODEL` optionally override the per-provider defaults (see `backend/agents/providers/openai_compat.py`). To support a new provider, implement the `Agent.call_model` contract and register it in `PROVIDERS` (`backend/agents/providers/__init__.py`).

### Installation & Running via Docker
1. Clone the repository and configure environment variables:
   ```sh
   git clone https://github.com/lautarojg13/job-board.git
   cd job-board
   cp .env.example .env
   ```
2. Build and launch all services (`db`, `redis`, `ollama`, `backend`, `celery_worker`, `frontend`):
   ```sh
   docker-compose up --build
   ```
   *(When no seed data exists, `SEED_ON_START=true` populates sample data, and the `ollama` service pulls `OLLAMA_MODEL_NAME` only on first start, if not already downloaded).*

3. Access the services:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:8000](http://localhost:8000)
   - **API Docs:** [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
   - **Ollama API:** [http://localhost:11434](http://localhost:11434)

---

## Testing & Management Commands

You can run backend tests and management commands either using local base commands (via virtual environment) or inside the running Docker containers.

> Note: the local virtual environment (`backend/env/`) is not included in the repo — create it first, e.g. `python3 -m venv backend/env && backend/env/bin/pip install -r backend/requirements.txt`.

### Backend Tests (`pytest`)

- **Option A: Local Virtual Environment**
  ```sh
  backend/env/bin/pytest
  ```
- **Option B: Docker Compose (Running container)**
  ```sh
  docker-compose exec backend pytest
  ```

#### API Contract Test Suite (No Database Required)
- **Local Virtual Environment:**
  ```sh
  backend/env/bin/pytest core/tests/test_api_contract.py -q
  ```
- **Docker Compose:**
  ```sh
  docker-compose exec backend pytest core/tests/test_api_contract.py -q
  ```

#### Seed Test Users for E2E Testing
- **Local Virtual Environment:**
  ```sh
  backend/env/bin/python manage.py make_test_user
  ```
- **Docker Compose:**
  ```sh
  docker-compose exec backend python manage.py make_test_user
  ```
  *(Creates `e2e-seeker@jobboard.test` and `e2e-employer@jobboard.test` with password `E2ePass123!`)*.

### Frontend Tests & Quality Checks
```sh
cd frontend

# TypeScript typecheck
npm run lint

# Production build check
npm run build

# Unit & Component tests (Vitest)
npm test

# Test Coverage
npm run test:coverage

# End-to-End tests (Playwright - requires backend and redis running via Docker Compose)
npm run test:e2e
```
*(Alternatively, you can run E2E tests via Docker Compose profile)*:
```sh
docker-compose --profile e2e run --rm frontend-e2e
```
