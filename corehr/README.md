# CoreHR — Employee Management System

A full-stack EMS built with **Django REST Framework** (backend) + **React + Vite + Tailwind CSS** (frontend) + **PostgreSQL** database.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python 3.11, Django 5, DRF             |
| Auth      | JWT (djangorestframework-simplejwt)     |
| Frontend  | React 18, Vite, Tailwind CSS v3        |
| Database  | PostgreSQL (pgAdmin 4)                  |
| Export    | openpyxl (Excel)                        |

---

## Roles

| Role  | Access                                              |
|-------|-----------------------------------------------------|
| Admin | Everything — users, salary, audit logs, all data   |
| HR    | Employees, assets, bank details, leaves, attendance |

---

## Features

- ✅ Employee full profile (personal, employment, address, documents, emergency)
- ✅ Asset tracking (Laptop, Desktop, ID Card, Key Card, Kit, SIM, etc.)
- ✅ Bank details (HR-only, account number masked by default)
- ✅ Salary management with bulk Paid/Unpaid actions (Admin only)
- ✅ Attendance tracking
- ✅ Leave management with approve/reject
- ✅ Excel reports for employees, salary, assets
- ✅ Audit logs for all write actions
- ✅ Department & designation management
- ✅ User management (Admin only)
- ✅ Dashboard with charts (Recharts)
- ✅ JWT auth with auto-refresh
- ✅ Role-based protected routes

---

## Setup

### 1. PostgreSQL — create database in pgAdmin

```sql
CREATE DATABASE corehr_db;
```

### 2. Backend setup

```bash
cd corehr/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Linux/Mac
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Fill in your database credentials
nano .env    # Edit DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY

# Run migrations
python manage.py makemigrations accounts employees assets bank salary attendance leaves audit
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser

# (Optional) create a default admin user via shell
python manage.py shell
>>> from apps.accounts.models import User
>>> u = User.objects.create_user(username='admin', password='admin123', role='admin', first_name='System', last_name='Admin', email='admin@corehr.com')
>>> u.save()

# Start Django server
python manage.py runserver
```

Backend runs at: http://localhost:8000  
Django Admin: http://localhost:8000/admin/

### 3. Frontend setup

```bash
cd corehr/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

### 4. Build for production

```bash
# Frontend
cd corehr/frontend
npm run build
# Output in dist/ — serve with nginx or any static host

# Backend
cd corehr/backend
python manage.py collectstatic
# Use gunicorn + nginx in production
```

---

## .env Reference

```env
SECRET_KEY=your-super-secret-django-key
DEBUG=True

DB_NAME=corehr_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## API Endpoints

| Module       | Base URL              |
|--------------|-----------------------|
| Auth/Users   | /api/auth/            |
| Employees    | /api/employees/       |
| Departments  | /api/employees/departments/list/ |
| Designations | /api/employees/designations/list/ |
| Assets       | /api/assets/          |
| Bank Details | /api/bank/            |
| Salary       | /api/salary/          |
| Attendance   | /api/attendance/      |
| Leaves       | /api/leaves/          |
| Reports      | /api/reports/         |
| Audit Logs   | /api/audit/           |

---

## Default Login

After running `createsuperuser` or the shell command above:

- **URL**: http://localhost:5173/login
- **Username**: admin (or whatever you created)
- **Password**: your chosen password

---

## Project Structure

```
corehr/
├── backend/
│   ├── .env                  ← Add your DB credentials here
│   ├── requirements.txt
│   ├── manage.py
│   ├── corehr/               ← Django settings & urls
│   └── apps/
│       ├── accounts/         ← Users & JWT auth
│       ├── employees/        ← Employee, Department, Designation
│       ├── assets/           ← Asset tracking
│       ├── bank/             ← Bank details (HR only)
│       ├── salary/           ← Salary records (Admin manage)
│       ├── attendance/       ← Daily attendance
│       ├── leaves/           ← Leave requests
│       ├── reports/          ← Excel export + dashboard stats
│       └── audit/            ← Audit logs + middleware
└── frontend/
    ├── src/
    │   ├── api/              ← Axios + all API calls
    │   ├── components/       ← Layout, UI components
    │   ├── context/          ← AuthContext (JWT + role)
    │   └── pages/            ← All page components
    ├── vite.config.js
    └── tailwind.config.js
```
