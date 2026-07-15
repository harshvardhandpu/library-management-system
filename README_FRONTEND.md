# Library Management System — Frontend

A modern, professional React frontend for the Library Management System Spring Boot backend. Built for placement preparation — clean, maintainable, and portfolio-ready.

---

## Tech Stack

| Technology        | Purpose                         |
|-------------------|---------------------------------|
| React 19          | UI library                      |
| TypeScript 6      | Type safety                     |
| Vite 8            | Build tool & dev server         |
| Tailwind CSS v4   | Utility-first styling           |
| React Router v7   | Client-side routing             |
| Axios             | HTTP client for API calls       |
| Lucide React      | Icon library                    |

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- Backend server running on `http://localhost:8080`

---

## Getting Started

### 1. Clone & Navigate

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. (Optional) Configure API URL

The frontend expects the backend at `http://localhost:8080` by default.

To override, create a `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

### 4. Start Dev Server

```bash
npm run dev
```

The app runs at **http://localhost:3000**.

### 5. Build for Production

```bash
npm run build
```

Output goes to `frontend/dist/`.

---

## Project Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.ts              # Axios client & error helpers
│   ├── types/
│   │   ├── api.ts              # API error response types
│   │   ├── book.ts             # Book DTO types
│   │   ├── user.ts             # User DTO types
│   │   └── borrow.ts           # Borrow record DTO types
│   ├── services/
│   │   ├── bookService.ts      # Book CRUD API calls
│   │   ├── userService.ts      # User CRUD API calls
│   │   └── borrowService.ts    # Borrow/return API calls
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx       # Main layout wrapper
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── Navbar.tsx       # Top navigation bar
│   │   └── ui/
│   │       ├── EmptyState.tsx    # Empty state placeholder
│   │       ├── LoadingSpinner.tsx # Loading indicator
│   │       ├── Modal.tsx         # Modal dialog
│   │       ├── StatusBadge.tsx   # Borrow/Return status badge
│   │       └── Toast.tsx         # Success/error notification
│   └── pages/
│       ├── Dashboard.tsx        # Overview stats & recent activity
│       ├── Books.tsx            # Book management (CRUD)
│       ├── Users.tsx            # User management (CRUD)
│       ├── BorrowRecords.tsx    # Borrow/return & history
│       └── NotFound.tsx         # 404 page
```

---

## Available Pages

| Route              | Page          | Description                              |
|--------------------|---------------|------------------------------------------|
| `/`                | Dashboard     | Stats overview, recent activity, quick actions |
| `/books`           | Books         | Book CRUD, search, availability tracking  |
| `/users`           | Users         | User CRUD, search, borrow history per user |
| `/borrow-records`   | Borrow Records | Borrow/return books, view all history     |

---

## API Connection

The frontend connects to the Spring Boot backend at:

```
http://localhost:8080
```

All API calls go through the Axios client defined in `src/config/api.ts`.

### Endpoints Used

| Method | Endpoint                              | Service File          |
|--------|---------------------------------------|-----------------------|
| GET    | `/api/books`                          | `bookService.ts`      |
| GET    | `/api/books/{id}`                     | `bookService.ts`      |
| POST   | `/api/books`                          | `bookService.ts`      |
| PUT    | `/api/books/{id}`                     | `bookService.ts`      |
| DELETE | `/api/books/{id}`                     | `bookService.ts`      |
| GET    | `/api/users`                          | `userService.ts`      |
| GET    | `/api/users/{id}`                     | `userService.ts`      |
| POST   | `/api/users`                          | `userService.ts`      |
| PUT    | `/api/users/{id}`                     | `userService.ts`      |
| DELETE | `/api/users/{id}`                     | `userService.ts`      |
| GET    | `/api/borrow-records`                 | `borrowService.ts`    |
| GET    | `/api/borrow-records/users/{id}`      | `borrowService.ts`    |
| POST   | `/api/borrow-records/borrow`          | `borrowService.ts`    |
| PUT    | `/api/borrow-records/{id}/return`     | `borrowService.ts`    |

---

## Features

- **Dashboard**: Real-time stats (total books, available copies, users, active borrows)
- **Books Management**: Full CRUD with search, availability indicators, form validation
- **Users Management**: Full CRUD with search, per-user borrow history modal
- **Borrow Records**: Borrow books, return books, status tracking, searchable history
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Error Handling**: Graceful error display, form validation, API error extraction
- **Loading States**: Skeleton-free spinner-based loading for all data fetches
- **Empty States**: Informative empty placeholders for all lists
- **Toast Notifications**: Success/error feedback after operations

---

## Environment Variables

| Variable        | Default                    | Description          |
|-----------------|----------------------------|----------------------|
| `VITE_API_URL`  | `http://localhost:8080`     | Backend API base URL |

---

## Backend Compatibility

This frontend works with the existing Spring Boot backend **without any modifications** to the Java code.

> See `FRONTEND_API_DOCUMENTATION.md` for the complete API contract.
