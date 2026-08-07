# ScholarBridge — multi-stage build: React frontend + Django backend, single image

# ── Stage 1: Build React frontend ──
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ ./
RUN npm run build

# ── Stage 2: Django backend ──
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /frontend/build /frontend-react/build

RUN mkdir -p /app/db /app/media
ENV SQLITE_PATH=/app/db/db.sqlite3

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/api/scholarships/ || exit 1

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn scholarbridge.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60"]
