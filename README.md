# Tijarat / Healthy Life ERP

Independent full-stack ERP and landing-page project converted from the AppDeploy version.

## What is included

- Customer landing page with Happy Life Massage Oil offers
- Cash-on-delivery order form
- Admin ERP login at `/#admin`
- Orders dashboard and search
- Order status updates
- Bulk dispatch workflow
- 4x6 AWB print center
- Courier management
- Inventory management
- Customer list view
- Finance COD summary
- Excel report exports
- Users list
- Independent Node/Express backend
- Local SQLite database

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

Admin route: `http://localhost:5173/#admin`

Backend: `http://localhost:8080`

## Environment variables

Set these in `.env`:

```bash
PORT=8080
DB_FILE=./erp.sqlite
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_PASSWORD=your-admin-password
CALLCENTER_PASSWORD=your-callcenter-password
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:8080
```

## Deployment note

GitHub stores the code. To get public customer/admin links from this independent version, deploy the frontend and backend to hosting such as Render, Railway, Vercel, VPS, or similar.

Current old AppDeploy live links still exist:

- Landing: https://da576bb73e987a3493.v2.appdeploy.ai/
- Admin: https://da576bb73e987a3493.v2.appdeploy.ai/#admin
