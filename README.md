# Personal Finance Tracker

A full-stack personal finance tracker with JWT auth, transaction management, analytics charts, and CSV export.

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18 + Vite, Tailwind CSS, Framer Motion, Recharts  |
| Backend    | Node.js + Express                                       |
| Database   | PostgreSQL + Prisma ORM                                 |
| Auth       | JWT (jsonwebtoken) + bcrypt password hashing            |

---

## Prerequisites

- **Node.js** v18 or higher (`node --version`)
- **npm** v9 or higher (`npm --version`)
- **PostgreSQL** v14 or higher running locally (`psql --version`)

---

## 1. Database Setup

Open your terminal and run `psql` (PostgreSQL shell):

```bash
psql -U postgres
```

Then run these SQL commands:

```sql
CREATE DATABASE finance_tracker;
CREATE USER finance_user WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;
\q
```

> On Windows, open "SQL Shell (psql)" from the Start menu and run the same commands.

---

## 2. Backend Setup

```bash
cd backend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Open `backend/.env` and set your values:

```env
DATABASE_URL="postgresql://finance_user:securepassword@localhost:5432/finance_tracker"
JWT_SECRET="replace-this-with-a-long-random-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Generate the Prisma client and push the schema to the database:

```bash
npx prisma generate
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

---

## 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

---

## 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Expected output: `🚀 Server running on http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Expected output: `Local: http://localhost:5173`

---

## 5. Environment Variables

### `backend/.env`

| Variable       | Description                                          | Example                                              |
|----------------|------------------------------------------------------|------------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string                         | `postgresql://finance_user:pass@localhost:5432/finance_tracker` |
| `JWT_SECRET`   | Secret for signing JWTs — use a long random string   | `my-super-secret-key-32-chars-long`                  |
| `PORT`         | Express server port                                  | `5000`                                               |
| `FRONTEND_URL` | Frontend origin for CORS                             | `http://localhost:5173`                              |

---

## 6. How to Verify It Works

1. Open **http://localhost:5173** in your browser
2. Click **Create an account** → sign up with any email + password
3. You are redirected to the **Dashboard**
4. Go to **Transactions** → click **Add Transaction** → add a few income and expense entries
5. Return to **Dashboard** — stat cards and charts update automatically
6. Go to **Analytics** — see the pie chart (spending by category) and line chart (monthly trend)
7. Go to **Transactions** → click **Export CSV** — a `.csv` file downloads with your data
8. Open an incognito window → sign up as a **different user** → confirm you see no data from the first account ✅

---

## API Endpoints

| Method | Endpoint           | Auth Required | Description                    |
|--------|--------------------|---------------|--------------------------------|
| POST   | /auth/signup       | No            | Register new user              |
| POST   | /auth/login        | No            | Login, receive JWT token       |
| GET    | /auth/me           | Yes           | Get current user info          |
| GET    | /transactions      | Yes           | List transactions (filterable) |
| POST   | /transactions      | Yes           | Create a transaction           |
| PUT    | /transactions/:id  | Yes           | Update own transaction         |
| DELETE | /transactions/:id  | Yes           | Delete own transaction         |
| GET    | /analytics         | Yes           | Get analytics data             |
| GET    | /export/csv        | Yes           | Download CSV of transactions   |

**Filter parameters for GET /transactions and GET /export/csv:**
- `startDate` — ISO date string (e.g. `2024-01-01`)
- `endDate` — ISO date string
- `category` — e.g. `Food & Dining`
- `type` — `income` or `expense`

---

## Project Structure

```
finance-tracker/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js         # signup, login, getMe
│   │   ├── transaction.controller.js  # CRUD with ownership checks
│   │   ├── analytics.controller.js    # pie + line chart data, savings rate
│   │   └── export.controller.js       # CSV streaming
│   ├── routes/                        # Express routers
│   ├── middlewares/
│   │   └── auth.middleware.js         # JWT validation
│   ├── prisma/
│   │   └── schema.prisma              # Users + Transactions schema
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx      # stat cards + pie chart + line chart
│   │   │   ├── TransactionsPage.jsx   # CRUD table, filters, CSV export
│   │   │   └── AnalyticsPage.jsx      # full pie + area chart + savings gauge
│   │   ├── components/
│   │   │   ├── Layout.jsx             # sidebar nav, mobile drawer, auto-logout
│   │   │   └── TransactionModal.jsx   # add/edit modal
│   │   ├── context/AuthContext.jsx    # JWT storage, 30-min inactivity logout
│   │   ├── hooks/useData.js           # data-fetching hooks
│   │   └── utils/
│   │       ├── api.js                 # axios instance with JWT interceptor
│   │       └── format.js             # currency, date formatters, categories
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Optional: Cloud Deployment

### Backend → [Render](https://render.com) or [Railway](https://railway.app)
1. Push `backend/` to a GitHub repo
2. Create a new Web Service
3. Build command: `npm install && npx prisma generate && npx prisma db push`
4. Start command: `node server.js`
5. Add all environment variables from `.env`

### Frontend → [Vercel](https://vercel.com)
1. Push `frontend/` to GitHub
2. Import project in Vercel
3. No environment variables needed (Vite proxy handles the backend URL)
4. Update `vite.config.js` proxy target to your deployed backend URL before building

### Database → [Neon](https://neon.tech) or [Supabase](https://supabase.com)
1. Create a free project
2. Copy the connection string
3. Set it as `DATABASE_URL` in your backend environment
