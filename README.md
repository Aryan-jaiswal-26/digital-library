# 📚 Digital Library — MERN Stack

A modern, full-stack digital library platform for Computer Engineering students. Built with MongoDB, Express, React 18 (Vite), and Node.js.

## ✨ Features

- 🔐 **Secure Auth**: JWT access tokens (in-memory) + Refresh tokens (httpOnly cookie) with rotation
- 📖 **In-browser PDF Reader**: `react-pdf` viewer with page tracking, bookmarks, fullscreen
- 🔍 **Smart Search**: MongoDB text-index full-text search + multi-filter catalog
- 📊 **Dashboards**: User reading progress + Admin analytics with Recharts
- ☁️ **Secure File Delivery**: Signed expiring Cloudinary URLs for PDFs
- 🛡️ **Security Hardened**: Helmet, CORS, rate limiting, magic-byte file validation, Zod schema validation

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Zustand, react-pdf |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + httpOnly Cookies |
| Storage | Cloudinary |
| Testing | Jest + Supertest |
| Dev Tools | Nodemon, Docker Compose |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd digital-library

# 2. Install server dependencies
cd server
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in MongoDB URI, Cloudinary keys, JWT secrets

# 4. Start the server (dev mode)
npm run dev

# 5. Install client dependencies (new terminal)
cd ../client
npm install

# 6. Start the client
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- API Docs (Swagger): `http://localhost:5000/api/docs`

### Docker (Recommended for local dev parity)

```bash
docker-compose up --build
```

## 📡 API Routes Summary

```
POST   /api/v1/auth/register    — Register new user
POST   /api/v1/auth/login       — Login (returns access token + sets refresh cookie)
POST   /api/v1/auth/refresh     — Rotate refresh token
POST   /api/v1/auth/logout      — Invalidate session
GET    /api/v1/auth/me          — Get current user

GET    /api/v1/books            — Search & filter books (paginated)
GET    /api/v1/books/:id        — Get book details
GET    /api/v1/books/:id/read-url — Get signed PDF URL (auth required)
POST   /api/v1/books            — Upload book (faculty/admin only)
PUT    /api/v1/books/:id        — Update book
DELETE /api/v1/books/:id        — Soft delete

GET    /api/v1/users/dashboard  — User dashboard data
POST   /api/v1/users/favorites/:bookId — Toggle favorite
PUT    /api/v1/users/progress/:bookId  — Update reading progress

GET    /api/v1/reviews/book/:id — Get reviews for a book
POST   /api/v1/reviews/book/:id — Submit/update review

GET    /api/v1/admin/analytics  — Platform analytics (admin only)
GET    /api/v1/admin/books/pending — Books awaiting approval
PATCH  /api/v1/admin/books/:id/approve — Approve/reject book
GET    /api/v1/admin/users      — User management
PATCH  /api/v1/admin/users/:id/role — Change user role
```

## 🧪 Running Tests

```bash
cd server
npm test
```

## 📂 Project Structure

```
digital-library/
├── client/             # React 18 + Vite frontend
├── server/             # Express.js API
├── docker-compose.yml  # Local dev environment
├── Futurework.md       # Original architecture plan
├── Futurework-v2.md    # Senior-reviewed architecture
└── README.md
```

## 🔐 Key Security Points

1. **JWT never in localStorage** — access token in memory, refresh in httpOnly cookie
2. **Signed PDF URLs** — short-lived (10 min) expiring Cloudinary URLs
3. **File validation** — MIME type + magic byte check, not just extension
4. **Rate limiting** — 5 auth attempts / 15min, 10 uploads / hour
5. **Input validation** — Zod schemas on every route
6. **Soft deletes** — preserve review and reading history integrity

---

Built following `Futurework-v2.md` — the senior-reviewed MERN transformation plan.