# FixDesk Frontend — React + Bootstrap

This frontend connects to the Django REST Framework backend in `computer_repair_backend`.

## Features
- Customer registration and JWT login
- Token refresh interceptor
- Role-aware navigation
- Dashboard summary cards and recent repairs
- Device registration and device list
- Repair request submission, filtering, details, timeline, status updates
- Admin technician assignment and repair-cost/diagnosis form
- Payment record list and customer payment record submission
- Technician directory for administrators
- Responsive Bootstrap-based layout

## Requirements
- Node.js 20+ recommended
- npm
- Running Django backend at `http://127.0.0.1:8000`

## Setup
```bash
npm install
```

Copy `.env.example` to `.env` if your backend URL differs:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start Vite:
```bash
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

Production build:
```bash
npm run build
npm run preview
```

## Run with backend
1. Start Django first: `python manage.py runserver`
2. Create a superuser and create technician accounts through Django Admin.
3. Register a customer through the frontend.
4. Log in and register a device.
5. Submit a repair request.
6. Use the administrator account in the frontend to assign a technician, set diagnosis and costs, and update repair status.

## Backend API assumptions
This frontend matches the endpoints in the companion backend package:
- `/api/auth/register/`, `/api/auth/login/`, `/api/auth/refresh/`, `/api/auth/logout/`, `/api/auth/me/`
- `/api/dashboard/summary/`
- `/api/devices/`
- `/api/repairs/`, `/api/repairs/{id}/update-status/`, `/api/repairs/{id}/assign-technician/`, `/api/repairs/{id}/cancel/`
- `/api/payments/`
- `/api/technicians/`

## Important implementation notes
- JWTs are stored in `localStorage` for this learning/demo implementation. For higher-security production deployments, consider HttpOnly secure cookies and a CSRF-aware authentication design.
- Payment entries submitted by customers are marked pending; the frontend does not process card payments or verify bank transfers.
- The admin frontend role checks are for user experience only. The backend remains responsible for authorization.
- The backend settings must include `http://localhost:5173` and `http://127.0.0.1:5173` in `CORS_ALLOWED_ORIGINS`.
- Use `npm run build` before deployment and configure the deployed API URL in the frontend environment.
