# Business Loan Telecalling CRM

A comprehensive, production-ready **Business Loan Telecalling CRM** system designed for financial institutions and direct selling agents (DSAs). Built with **Django REST Framework** and **React (Vite)**, it provides role-based lead distribution, automated call queuing, follow-up scheduling, banker matching, audit logging, and executive analytics.

---

## 📑 Table of Contents
- [Features](#-features)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Data Models & Schema](#-data-models--schema)
- [API Reference](#-api-reference)
- [Environment Variables & Security](#-environment-variables--security)
- [Local Installation & Setup](#-local-installation--setup)
- [Deployment Guide](#-deployment-guide)

---

## ✨ Features

- 🔐 **Role-Based Access Control (RBAC)**:
  - **Super Admin**: Complete platform oversight, user creation, system config, global analytics.
  - **Area Sales Manager (ASM)**: Territory/team management, lead assignment, team performance tracking.
  - **Telecaller**: One-lead-at-a-time calling queue, call dispositions, follow-up scheduler, document management.

- 📞 **Smart Telecalling Queue**:
  - Sequential lead presentation with call duration tracking.
  - Quick disposition logging (Interested, Not Interested, Follow-up, Callback Later, Disqualified).
  - Voice notes recording and call interaction history.

- 📥 **Lead Management & Deduplication**:
  - Bulk CSV lead upload with automated duplicate detection (by Phone / PAN / GST).
  - Lead stage tracking: `NEW`, `IN_PROGRESS`, `FOLLOW_UP`, `DOCS_COLLECTED`, `SUBMITTED_TO_BANK`, `SANCTIONED`, `DISBURSED`, `REJECTED`.

- 🏦 **Banker & Lender Matching**:
  - Automated evaluation matching business leads with suitable banking partners based on loan amount, turnover, and credit profile.

- 📊 **Real-time Executive Dashboards**:
  - Operational metrics, conversion funnels, daily call targets, and team activity logs.

---

## 🏗️ System Architecture & Tech Stack

```
                     ┌────────────────────────┐
                     │   React + Vite App     │
                     │  (Vercel Frontend)     │
                     └───────────┬────────────┘
                                 │ HTTP / JWT
                                 ▼
                     ┌────────────────────────┐
                     │  Django REST Framework │
                     │   (Render Backend)     │
                     └───────────┬────────────┘
                                 │ ORM
                                 ▼
                     ┌────────────────────────┐
                     │   PostgreSQL / SQLite  │
                     └────────────────────────┘
```

### Technologies Used
- **Backend**: Python 3.11+, Django 5.x, Django REST Framework (DRF), SimpleJWT (JWT Auth), Gunicorn, WhiteNoise.
- **Frontend**: React 18, Vite, React Router, TailwindCSS / CSS Design Tokens, Lucide Icons, Axios.
- **Database**: PostgreSQL (Production), SQLite (Development).

---

## 📊 Data Models & Schema

The database schema is structured around 8 core domain modules:

| App / Module | Data Model | Key Attributes | Purpose |
| :--- | :--- | :--- | :--- |
| **Accounts** | `User` | `email`, `role`, `employee_id`, `territory`, `asm`, `is_active` | Custom User model supporting Admin, ASM, and Telecaller roles. |
| **Customers** | `Customer` | `full_name`, `company_name`, `pan_number`, `gst_number`, `annual_turnover` | Business customer entity profile. |
| **Customers** | `Lead` | `customer`, `assigned_to`, `status`, `loan_amount_requested`, `city` | Actionable telecalling lead pipeline record. |
| **Calls** | `Call` | `lead`, `telecaller`, `disposition`, `duration_seconds`, `notes` | Log of every call attempt and outcome. |
| **Calls** | `FollowUp` | `lead`, `telecaller`, `scheduled_at`, `status`, `reminder_type` | Automated follow-up calendar tasks. |
| **Calls** | `VoiceNote` | `call`, `audio_file`, `duration` | Audio logs attached to call dispositions. |
| **Lenders** | `Banker` | `bank_name`, `contact_person`, `email`, `min_loan_amount`, `max_loan_amount` | Bank partners and lender criteria profile. |
| **Lenders** | `LeadBankerMatch`| `lead`, `banker`, `match_score`, `status` | Matches leads to compatible lending institutions. |
| **Documents**| `Document` | `lead`, `doc_type`, `file_path`, `uploaded_at` | Customer KYC and financial documents (GST, ITR, Bank Statements). |
| **Audit** | `AuditLog` | `user`, `action`, `model_name`, `ip_address`, `timestamp` | Tracks sensitive actions across the CRM. |

---

## 🔌 API Reference

### 1. Authentication & Users (`/api/accounts/`)
- `POST /api/accounts/login/`: JWT authentication (returns access & refresh tokens).
- `POST /api/accounts/token/refresh/`: Refresh JWT token.
- `GET /api/accounts/users/`: List users (Filtered by ASM / Role).
- `POST /api/accounts/users/create/`: Admin/ASM user creation.

### 2. Leads & Customers (`/api/customers/` & `/api/leads/`)
- `GET /api/leads/`: List assigned leads.
- `GET /api/leads/queue/`: Fetch next lead in calling queue.
- `POST /api/leads/upload-csv/`: Bulk import leads with deduplication checks.
- `PATCH /api/leads/{id}/`: Update lead details or stage status.

### 3. Calls & Follow-ups (`/api/calls/`)
- `POST /api/calls/log/`: Record call outcome & disposition.
- `GET /api/calls/history/{lead_id}/`: Retrieve call history for a lead.
- `GET /api/calls/followups/`: Retrieve scheduled follow-ups.

### 4. Lenders & Matching (`/api/lenders/`)
- `GET /api/lenders/bankers/`: List all registered lenders/bankers.
- `GET /api/lenders/matches/{lead_id}/`: Get eligible bank matches for a lead.

### 5. Analytics & Dashboard (`/api/analytics/`)
- `GET /api/analytics/admin/`: System-wide metrics (Disbursal rate, team conversion).
- `GET /api/analytics/asm/`: Territory and team metrics.
- `GET /api/analytics/telecaller/`: Personal daily targets, call logs count.

---

## 🔒 Environment Variables & Security

> [!IMPORTANT]
> Never commit actual credentials, secret keys, or passwords to public repositories. Copy `.env.example` to `.env` locally.

### Backend `.env` Template (`backend/.env`)
```ini
# Django Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost,.onrender.com

# Database Settings (Production PostgreSQL)
DATABASE_URL=postgres://user:password@hostname:5432/dbname

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app

# Email Service Config (Optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
```

### Frontend `.env` Template (`frontend/.env`)
```ini
# Base API URL
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/CRM.git
cd CRM

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Seed initial system roles and sample data
python backend/seed_data.py

# Start Django Development Server
python backend/manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ☁️ Deployment Guide

### Deploying Backend to Render
1. Create a **PostgreSQL Database** on Render.
2. Create a new **Web Service** on Render connected to `backend/`.
3. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
4. Set **Start Command**:
   ```bash
   gunicorn crm_project.wsgi:application
   ```
5. Add Environment Variables (`SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`).

### Deploying Frontend to Vercel
1. Import repository on Vercel and select `frontend/` as the root directory.
2. Set **Framework Preset** to `Vite`.
3. Configure `vercel.json` rewrites for SPA routing.
4. Set **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com`

---

## 📄 License & Confidentiality
This software is developed for internal business operations. All sensitive data, environment configurations, and secrets must remain protected.
