# 🏠 REMS — Smart Real Estate Management System for Malawi

A modern, full-stack real estate platform designed for Malawi that connects property owners with tenants. Built with Next.js, Express.js, Prisma, PostgreSQL, Supabase, and PayChangu.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Supabase account (for storage + realtime)
- PayChangu account (for payments)

---

## 📁 Project Structure

```
rems/
├── client/          # Next.js 14 frontend (App Router)
└── server/          # Express.js + Prisma backend API
```

---

## 🖥️ Backend Setup (`/server`)

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only) |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret |
| `PAYCHANGU_SECRET_KEY` | PayChangu secret key |
| `PAYCHANGU_PUBLIC_KEY` | PayChangu public key |
| `PAYCHANGU_WEBHOOK_SECRET` | PayChangu webhook secret |
| `PORT` | Server port (default: `5000`) |

### 3. Run database migrations

```bash
npm run prisma:migrate
```

### 4. Seed the database

```bash
npm run prisma:seed
```

This creates:
- **3 demo users** (1 admin, 2 tenants)
- **6 properties** across Lilongwe, Blantyre, Zomba, Mangochi, Mzuzu, and Salima
- Sample booking, payment, invoice, receipt, and reviews

**Demo credentials:**
| Role | Email | Password |
|---|---|---|
| Admin | admin@rems.mw | Password123! |
| Tenant | tenant@rems.mw | Password123! |
| Tenant | john@rems.mw | Password123! |

### 5. Start the development server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## 🌐 Frontend Setup (`/client`)

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:5000/api/v1`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

### 3. Start the development server

```bash
npm run dev
```

Frontend starts at: `http://localhost:3000`

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive JWT |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/profile` | Update profile |

### Properties
| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/properties` | List properties (filterable) |
| GET | `/api/v1/properties/:id` | Get property details |
| POST | `/api/v1/properties` | Create property (admin) |
| PUT | `/api/v1/properties/:id` | Update property (owner) |
| DELETE | `/api/v1/properties/:id` | Soft-delete property (owner) |

### Bookings
| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/bookings` | Create booking |
| GET | `/api/v1/bookings/my-bookings` | Get user's bookings |
| POST | `/api/v1/bookings/:id/modify` | Request booking modification |

### Payments
| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/payments/initiate` | Initiate PayChangu payment |
| POST | `/api/v1/payments/webhook/paychangu` | PayChangu webhook handler |
| GET | `/api/v1/payments/invoices` | Get user's invoices |
| GET | `/api/v1/payments/receipts` | Get user's receipts |

### Messages
| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/messages` | Get conversations |
| GET | `/api/v1/messages/:conversationId` | Get messages |
| POST | `/api/v1/messages` | Start a conversation |
| POST | `/api/v1/messages/:conversationId/reply` | Reply to a conversation |

### Reviews
| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/reviews/property/:id` | Get property reviews |
| POST | `/api/v1/reviews` | Submit review (must have completed booking) |

### Analytics (Admin)
| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/analytics/metrics` | Get dashboard metrics |

### Uploads
| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/uploads/property-image` | Upload property image to Supabase Storage |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion |
| State | Zustand, TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express.js, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (custom) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Payments | PayChangu |
| Upload | Multer (memory storage) |

---

## 🌍 Supported Cities (Malawi)

- Lilongwe (Capital)
- Blantyre (Commercial hub)
- Zomba (University city)
- Mangochi (Lake Malawi)
- Mzuzu (Northern)
- Salima (Lakeshore)
- Karonga, Dedza, Liwonde (others)

---

## 🔐 User Roles

| Role | Capabilities |
|---|---|
| **Guest** | Browse properties, view details |
| **Tenant** | Register, book, pay, message, review |
| **Admin** | All of the above + manage properties, view analytics |

---

## 📄 License

MIT — Built for the REMS Malawi project.
