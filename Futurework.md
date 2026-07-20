# 🚀 Futurework: MERN Stack Digital Library Transformation Roadmap

This document outlines the complete architectural blueprint, feature specifications, database schemas, API design, and implementation roadmap to transform the static **Digital Library** project into a modern, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application.

---

## 📌 1. Current Codebase Overview & Limitations

The existing repository consists of static HTML5, standard CSS, and vanilla JavaScript:

- **[index.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/index.html)**: Static home page showcasing hardcoded featured books (*Beauty Sick*, *Rich Dad Poor Dad*).
- **[books.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/books.html)**: Academic category grid (1st to 4th Year Computer Engineering) with basic DOM filtering.
- **[science.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/science.html), [second-year.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/second-year.html), [third-year.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/third-year.html), [fourth-year.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/fourth-year.html)**: Static pages hosting course subjects and downloadable PDF links.
- **[login.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/login.html) & [register.html](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/register.html)**: Unfunctional HTML forms without backend processing.
- **[style.css](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/style.css) & [auth-style.css](file:///c:/Users/ARYAN-PC/Desktop/portfolilo/digital-library/auth-style.css)**: Traditional static CSS styling.
- **Local Assets**: PDF files and book cover images stored directly inside the root workspace.

### Key Upgrade Objectives
1. **Dynamic Content**: Replace static HTML pages with a single-page React application consuming Express REST APIs.
2. **Database Persistence**: Store users, book metadata, reading progress, and reviews in MongoDB.
3. **Cloud Asset Management**: Stream PDFs and images securely from cloud storage (Cloudinary / AWS S3).
4. **Interactive Experience**: In-browser PDF reading with page memory, bookmarks, dark mode, and rating systems.

---

## 🏗️ 2. Target System Architecture

```mermaid
graph TD
    User([User / Browser]) <--> React[React 18 + Vite SPA]
    React <--> API[Node.js + Express API]
    API <--> Auth[JWT & Auth Middleware]
    API <--> MongoDB[(MongoDB Atlas)]
    API <--> Storage[Cloudinary / AWS S3 (PDFs & Covers)]
```

---

## ✨ 3. Feature Breakdown

### 🛡️ A. Authentication & User Roles (RBAC)
- **Student / Reader**:
  - Sign up, log in, manage personal profile.
  - Read PDFs online with automatic page progress tracking.
  - Save books to "Favorites" and "Read Later".
  - Write book reviews and submit star ratings.
- **Faculty / Librarian**:
  - Upload lecture notes, reference material, and PDFs per subject/year.
  - Categorize books by semester, department, and branch.
- **System Admin**:
  - Manage users, roles, and book approvals.
  - View platform analytics (total reads, downloads, active users).

### 📖 B. Embedded In-Browser PDF Reader
- Integrated PDF viewer (`react-pdf` / PDF.js) with:
  - Page navigation, jump-to-page, and zoom controls.
  - Full-screen reading mode.
  - Automatic reading progress persistence (remembers last page read).
  - Page bookmarking and personal study notes per book.

### 🔍 C. Advanced Search & Filtering
- **MongoDB Atlas Search**: Instant fuzzy searching across title, author, subject, and tags.
- **Academic Filters**:
  - Year (1st, 2nd, 3rd, 4th Year Computer Engineering).
  - Subject / Course Module.
  - Resource Type (Textbook, Lecture Notes, Reference Manual, Exam Paper).

### 📊 D. Interactive Dashboards
- **User Dashboard**:
  - "Continue Reading" shelf with visual progress bars.
  - Favorite & Saved Books grid.
  - Reading stats (books completed, total pages read).
- **Admin Dashboard**:
  - Drag-and-drop file uploader for PDFs and Cover Images.
  - Analytics dashboard with charts (popular books, category distribution).
  - Content moderation and user management table.

---

## 🗄️ 4. MongoDB Database Schemas (Mongoose)

### `User.js`
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  readingHistory: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    lastPageRead: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### `Book.js`
```javascript
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'General Knowledge', 'Reference'],
    required: true 
  },
  branch: { type: String, default: 'Computer Engineering' },
  subject: { type: String, required: true },
  coverImage: { type: String, required: true }, // Cloudinary URL
  pdfUrl: { type: String, required: true },     // Cloudinary/S3 URL
  fileSize: { type: String },
  totalPages: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewsCount: { type: Number, default: 0 },
  downloadsCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
```

### `Review.js`
```javascript
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
```

---

## 📡 5. REST API Endpoint Specification

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user account.
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET /api/auth/me` - Get current logged-in user details.

### Book Routes (`/api/books`)
- `GET /api/books` - Get all books with search, category filter, & pagination.
- `GET /api/books/:id` - Get detailed book info + increment view count.
- `POST /api/books` - Create/Upload new book (Faculty/Admin only, accepts PDF & Cover image upload).
- `PUT /api/books/:id` - Update book metadata (Admin/Uploader only).
- `DELETE /api/books/:id` - Delete book and remove files from cloud storage.

### User & Interaction Routes (`/api/users`)
- `POST /api/users/favorites/:bookId` - Toggle book in user's favorites list.
- `PUT /api/users/progress` - Update user reading progress (last page read).
- `GET /api/users/dashboard` - Get personalized user reading history & saved books.

### Review Routes (`/api/reviews`)
- `GET /api/reviews/book/:bookId` - Fetch all reviews for a book.
- `POST /api/reviews/book/:bookId` - Add a review and rating.

---

## 📂 6. Project Directory Architecture

```
digital-library/
├── Futurework.md               # Architecture & transformation plan
├── client/                     # React Frontend (Vite)
│   ├── public/                # Static assets & icons
│   ├── src/
│   │   ├── assets/            # Styles, logos, images
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── BookCard.jsx
│   │   │   ├── PDFViewer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── context/           # Global Context State
│   │   │   ├── AuthContext.jsx
│   │   │   └── BookContext.jsx
│   │   ├── pages/             # Application Views
│   │   │   ├── Home.jsx
│   │   │   ├── BooksCatalog.jsx
│   │   │   ├── BookDetails.jsx
│   │   │   ├── ReaderPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/          # Axios API Service Layer
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                     # Node.js Express Backend
    ├── config/                # Database & Cloud Config
    │   ├── db.js
    │   └── cloudinary.js
    ├── controllers/           # Business Logic Controllers
    │   ├── authController.js
    │   ├── bookController.js
    │   ├── reviewController.js
    │   └── userController.js
    ├── middleware/            # Security & Upload Handlers
    │   ├── authMiddleware.js
    │   ├── adminMiddleware.js
    │   └── multerUpload.js
    ├── models/                # Mongoose Schemas
    │   ├── User.js
    │   ├── Book.js
    │   └── Review.js
    ├── routes/                # Express Router Definitions
    │   ├── authRoutes.js
    │   ├── bookRoutes.js
    │   ├── reviewRoutes.js
    │   └── userRoutes.js
    ├── .env.example
    ├── server.js
    └── package.json
```

---

## 📅 7. Phased Execution Plan

| Phase | Duration | Goals & Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1: Server & Database** | Days 1–2 | Set up Node.js/Express server, MongoDB connection, Mongoose schemas, and JWT Authentication APIs. |
| **Phase 2: File Upload Engine** | Days 3–4 | Configure Cloudinary/S3 storage with Multer for secure PDF and image uploads. |
| **Phase 3: React Single Page App** | Days 5–7 | Scaffold Vite + React project, set up Tailwind CSS, Axios client, React Router, and Auth Context. |
| **Phase 4: PDF Reader & Search UI** | Days 8–10 | Implement `react-pdf` embedded reader, real-time live search, dynamic category views, and page progress tracking. |
| **Phase 5: Dashboards & Review System** | Days 11–12 | Build User Profile, Admin Book Management Panel, and Rating/Review components. |
| **Phase 6: Testing & Deployment** | Days 13–14 | Perform E2E testing, API optimization, and deploy to Vercel (Frontend) & Render/Railway (Backend). |

---

## 🌐 8. Deployment Strategy

- **Database**: MongoDB Atlas Cluster (Free Tier M0 / Dedicated).
- **Backend**: Render / Railway / AWS App Runner.
- **Frontend**: Vercel / Netlify with custom domain support.
- **Media Assets**: Cloudinary (for Cover Images & PDF hosting) or AWS S3 Bucket with CloudFront CDN.
