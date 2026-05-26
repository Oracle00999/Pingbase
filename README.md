# Pingbase Frontend

React frontend for the API monitoring platform.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Current Step

Step 1 adds the frontend foundation:

- React Router routes
- Public and authenticated layouts
- API request helper
- Auth token storage helper
- Shared UI primitives
- Starter landing, auth, dashboard, and 404 pages
