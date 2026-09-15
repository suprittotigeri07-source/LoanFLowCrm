# Business Loan Telecalling CRM

A production-ready Business Loan Telecalling CRM system featuring role-based access control, one-lead-at-a-time calling queue, automated follow-up scheduling, CSV lead deduplication, and executive admin/ASM dashboards.

## Quick Start

### 1. Backend (Django 5 + Django REST Framework)
The Python requirements are installed. To run migrations or start the backend:
```bash
# Seed demo accounts (Admin, ASM, 2 Telecallers, 5 Business Leads)
python backend/seed_data.py

# Start Django backend server (port 8000)
python backend/manage.py runserver 127.0.0.1:8000
```

### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser.

### 3. Running Unit Tests
```bash
pytest backend/tests -v
```

## Demo Credentials & Persona Switcher

The application features a 1-click **Demo Switcher Bar** at the top of the screen to switch personas instantly:

| Role | Email | Password | Territory |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@crm.local` | `Admin@12345` | Global oversight |
| **ASM Mumbai** | `asm.mumbai@crm.local` | `Asm@12345` | Mumbai Region |
| **Telecaller 1 (Priya)** | `caller1@crm.local` | `Caller@12345` | Mumbai Central |
| **Telecaller 2 (Rahul)** | `caller2@crm.local` | `Caller@12345` | Pune West |
