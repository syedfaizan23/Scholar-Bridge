# 🎓 ScholarBridge

ScholarBridge is a scholarship finder built for students applying abroad. You browse scholarships, apply with a form that fills itself in from your saved profile, get a challan for the application fee, upload proof once you've paid it, and an admin reviews and approves it from their own dashboard. Students can also book a live call or chat with a consultant, leave a review once approved by an admin, and reach out through a Contact Us form that lands directly in the admin dashboard.

Built with **Django REST Framework** on the backend and **React + TypeScript** on the frontend.

---

## What's in it

- A public marketing site — landing page, About, Blog, Reviews, and Contact Us, instead of dropping straight into a login screen
- 22 real scholarships seeded out of the box (Germany, UK, Netherlands, Sweden, Switzerland, France, USA, Canada, and a few more)
- A 5-step application form that pulls from the student's saved profile instead of asking for everything again
- Challan-based payment: apply → get a challan with a unique reference number → pay it at the bank → upload the receipt → admin verifies
- Applications that never got paid within 20 days expire automatically
- Separate student and admin dashboards — activity timeline, deadline/notification widgets, quick actions, not just a stats page
- Students can submit a review from their dashboard; it goes live on the public Reviews page once an admin approves it
- A Contact Us form that stores every message in the database, searchable and filterable from the admin dashboard, with status tracking (new / in progress / resolved / closed)
- A handful of full-length blog articles on the application process (documents, IELTS, personal statements, timelines, recommendation letters, common mistakes)
- JWT auth with student/admin roles kept genuinely separate (a student can't just pass `role: admin` at signup and get in)
- Mobile navigation — a slide-in drawer with a backdrop, not just a hidden sidebar
- Swagger/ReDoc API docs, generated from the code

---

## Project structure

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
│       ├── assets/         logo, hero/footer images
│       ├── components/     reusable UI (student/, admin/, common/, ui/, challan/, layout/, landing/)
│       ├── data/           static content (blog posts)
│       ├── pages/          actual screens — Landing, ContactUs, ReviewsPage, Blog, BlogPostPage, and the student/admin app
│       ├── hooks/          small reusable hooks (debounced search, authenticated file fetch)
│       └── store/          auth state (zustand)
└── docker-compose.yml
```

---

## Running it locally (no Docker)

You'll need Python 3.11+ and Node 18+.

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_scholarships    # creates 22 scholarships + an admin account (first run only)
python manage.py runserver
```

Backend runs on `http://localhost:8000`.

The seed command only seeds once — if scholarships already exist it skips without touching anything, so it's safe to run again by accident. It prints a freshly generated admin password to the terminal the first time it runs; copy it right away, it won't be shown again.

### 2. Frontend

Open a second terminal:

```bash
cd frontend-react
npm install
npm start
```

Opens at `http://localhost:3000`. It talks to the backend on `:8000` through the `proxy` entry in `package.json` — the app itself only ever calls a relative `/api`, so it doesn't care what host or port it's actually running behind.

---

## Running it with Docker

The easiest way — builds the React app and the Django backend into one container, so you don't need Node or Python installed yourself.

```bash
docker compose up --build
```

First time only, seed the data (this also creates your admin account, password printed once in the logs):

```bash
docker compose exec backend python manage.py seed_scholarships
```

Then open `http://localhost:8000` — API and frontend are both served from there, same origin.

The database is SQLite and lives in a Docker volume, so your data survives container rebuilds.

If you're deploying this somewhere other than your own machine, set real values for `SECRET_KEY`, `ALLOWED_HOSTS`, and (if the frontend ever ends up hosted separately from the API) `CORS_ALLOWED_ORIGINS` — see the environment section in `docker-compose.yml`. If something in front of this actually terminates HTTPS for you (nginx, Caddy, a cloud load balancer), set `HTTPS_ENABLED=True` there too.

---

## API docs

Once the backend is running:
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`
- Django admin: `http://localhost:8000/django-admin/`

---

## A few things worth knowing

- The challan amount is fixed at PKR 2,000 with a 20-day payment window from the day a student applies.
- Run `python manage.py expire_challans` on a schedule (cron, Celery beat, whatever you've got) to clean up applications where the deadline passed without payment.
- Challan receipt images go through an authenticated endpoint that only lets the student who owns the application (or an admin) view them.
- Login and register are rate-limited (30 requests/min for anonymous users).
- A student can submit one review; editing an already-approved review sends it back to pending until an admin re-approves it.
- The scholarship list endpoint and the admin students list are both indexed and query-optimized — neither one fires an extra database query per row.
