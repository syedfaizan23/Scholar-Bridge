# ScholarBridge

A full-stack scholarship management platform for students applying abroad. Students discover scholarships, apply through a guided multi-step form, track their application status, pay via a generated fee challan, and connect with consultants — all from one dashboard. Admins manage scholarships, verify payments, and moderate reviews from a separate admin dashboard.

Built with **Django REST Framework** on the backend and **React + TypeScript** on the frontend, containerized with **Docker**.

---

## Features

- **Scholarship discovery** — 22 seeded scholarships across Germany, UK, Netherlands, Sweden, Switzerland, France, USA, Canada, and more
- **5-step application form** that auto-fills from the student's saved profile
- **Challan-based payment workflow** — apply → receive a challan with a unique reference number → pay → upload proof → admin verifies
- **Auto-expiry** for applications left unpaid past a 20-day window
- **Separate student and admin dashboards** with activity timelines, deadline widgets, and quick actions
- **Review system** — students submit reviews from their dashboard; reviews go live on the public page after admin approval
- **Contact Us / inquiries** pipeline with status tracking (new / in progress / resolved / closed), searchable from the admin side
- **JWT authentication** with strictly separated student/admin roles
- **Swagger / ReDoc API documentation**, generated directly from the code

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2, Django REST Framework, SimpleJWT |
| Frontend | React 19, TypeScript, Zustand, Axios |
| Database | SQLite |
| Docs | Swagger (drf-yasg), ReDoc |
| Deployment | Docker, Docker Compose, Gunicorn |
| Other | django-filter, django-cors-headers |

## Project Structure

```
scholarbridge/
├── backend/                Django REST API
│   ├── apps/
│   │   ├── accounts/       users, profiles, auth
│   │   ├── scholarships/   scholarship listings, saved scholarships
│   │   ├── applications/   applications, challan workflow
│   │   ├── inquiries/      Contact Us submissions
│   │   └── reviews/        student reviews + admin approval
│   └── scholarbridge/      settings, urls
├── frontend-react/         React + TypeScript app
│   └── src/
│       ├── api/            axios calls
│       ├── components/     reusable UI
│       ├── pages/          screens (landing, student app, admin app)
│       ├── hooks/          reusable hooks
│       └── store/          auth state (zustand)
└── docker-compose.yml
```

## Getting Started

### Option A — Docker (recommended)

```bash
docker compose up --build
docker compose exec backend python manage.py seed_scholarships   # first run only
```

App is served at `http://localhost:8000` (API and frontend on the same origin).

### Option B — Run locally

**Backend** (Python 3.11+)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_scholarships
python manage.py runserver
```
Runs on `http://localhost:8000`.

**Frontend** (Node 18+), in a second terminal:
```bash
cd frontend-react
npm install
npm start
```
Runs on `http://localhost:3000`.

> The seed command creates 22 scholarships and an admin account, and prints the admin password to the terminal once — copy it immediately.

## API Documentation

With the backend running:
- Swagger UI — `http://localhost:8000/swagger/`
- ReDoc — `http://localhost:8000/redoc/`
- Django Admin — `http://localhost:8000/django-admin/`

## Notes

- Challan amount is fixed at PKR 2,000 with a 20-day payment window.
- `python manage.py expire_challans` should run on a schedule to clean up unpaid, expired applications.
- Rate limiting is applied to login/register endpoints.
- Student review edits reset an approved review to pending, requiring re-approval.

## What I Learned Building This

This project pushed me beyond tutorial-level Django — designing a multi-role auth system where roles can't be spoofed at signup, building a payment-adjacent workflow (challan → proof upload → admin verification) with proper state transitions, and optimizing list endpoints so they don't fire N+1 queries. It's also the first project I containerized and deployed end-to-end with Docker.
