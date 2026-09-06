# Pharmacy Stock & Sales Management

A cross-platform system for a pharmacy to track stock and prices, record every sale, and
auto-calculate daily/weekly/monthly profit, with separate **Admin** and **Worker** access levels.

Built with pharmacy-specific needs in the core design: **expiry dates, batch/lot numbers,
FEFO stock rotation, and controlled-substance tracking**.

See [pharmacy_app_design.md](pharmacy_app_design.md) for the full design document.

## Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13 (PHP 8.2+) — serves the web app **and** a JSON API |
| Web frontend | React 19 + Inertia 3 + TypeScript + Tailwind 4 + shadcn/ui |
| Mobile app | Flutter (talks to the JSON API via Sanctum tokens) |
| Database | SQLite for local dev · MySQL in production |
| Auth | Laravel Fortify (web sessions) · Sanctum tokens (mobile) |
| Roles | `spatie/laravel-permission` — admin / worker + per-worker toggles |
| Tests | Pest feature tests |

## Repo layout

```
pharmacy-app/
  pharmacy_app_design.md   # design document
  server/                  # Laravel app (web UI + JSON API)
  mobile/                  # Flutter app (added in a later stage)
```

## Prerequisites

- PHP 8.2+ with the `openssl`, `curl`, `mbstring`, `fileinfo`, `pdo_sqlite` extensions
- Composer 2.x
- Node.js 20+ and npm
- MySQL (production only — local dev uses SQLite)

On Windows without admin rights, [Scoop](https://scoop.sh) installs PHP per-user:
`scoop install php`.

## Getting started

```bash
cd server
composer install
npm install
cp .env.example .env        # then set DB_CONNECTION=sqlite
php artisan key:generate
php artisan migrate --seed
composer run dev            # serves at http://localhost:8000
```

## Running tests

```bash
cd server
php artisan test
```

## Build stages

Development runs in stages; each one is built, tested, and pushed before the next begins.

| Stage | Scope | Status |
|---|---|---|
| 0 | Environment, scaffolding & GitHub | In progress |
| 1 | Auth, roles & user management | Planned |
| 2 | Inventory core (products, batches, expiry) | Planned |
| 3 | Point of Sale + FEFO stock deduction | Planned |
| 4 | Sales & profit reporting | Planned |
| 5 | Alerts, stock adjustments & audit log | Planned |
| 6 | Suppliers & purchase orders | Planned |
| 7 | Exports & settings | Planned |
| 8 | Mobile API hardening (Sanctum) | Planned |
| 9 | Flutter mobile app | Planned |
| 10 | Deployment + automated backups | Planned |
