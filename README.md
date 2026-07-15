# Library Management System

[![CI](https://github.com/harshvardhandpu/library-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/harshvardhandpu/library-management-system/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A full-stack library management application with a **Spring Boot 3 backend** and a **React + TypeScript frontend**. Manage books, library users, and borrowing records through a clean REST API and a modern web UI.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.3 |
| Database | MariaDB / MySQL |
| ORM | Spring Data JPA / Hibernate |
| Build | Maven |
| Validation | Bean Validation (Jakarta) |
| Tooling | Lombok |

### Frontend
| Layer | Technology |
|-------|-----------|
| Language | TypeScript 6 |
| Framework | React 19 |
| Routing | React Router 7 |
| HTTP Client | Axios |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Build | Vite 8 |
| Testing | Vitest + Testing Library |

### DevOps
| Tool | Purpose |
|------|---------|
| GitHub Actions | CI pipeline (test + build on push/PR) |
| Husky | Pre-commit hooks |
| lint-staged | Stage-specific linting |
| Oxlint | Lightning-fast Rust-based linter |

---

## Quick Start

### Option A: Docker (recommended)

```bash
docker compose up --build
```

This starts three containers:
- **MariaDB** on port `3306`
- **Backend API** on port `8080`
- **Frontend UI** on port `5173`

Visit **http://localhost:5173** to use the application.

Stop with:
```bash
docker compose down
```

To reset the database:
```bash
docker compose down -v
```

### Option B: Manual Setup

#### 1. Clone & Configure

```bash
git clone https://github.com/harshvardhandpu/library-management-system.git
cd library-management-system
```

#### 2. Backend Setup

Create a MariaDB/MySQL database:

```sql
CREATE DATABASE library_management_db;
```

Update credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/library_management_db
spring.datasource.username=root
spring.datasource.password=your_password
```

Start the backend:

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.

---

## Development Workflow

### Commands

| Command | Description |
|---------|-------------|
| `mvn spring-boot:run` | Start backend server |
| `cd frontend && npm run dev` | Start frontend dev server |
| `cd frontend && npm test` | Run all 184+ tests |
| `cd frontend && npm run test:coverage` | Run tests with coverage (99%+) |
| `cd frontend && npm run build` | TypeScript check + production build |
| `cd frontend && npm run lint` | Run oxlint |
| `mvn clean package` | Build backend JAR |

### Pre-commit Hooks

Every `git commit` automatically runs:

1. **lint-staged** — `oxlint --fix` on staged `.ts` / `.tsx` files
2. **npm test** — full test suite (184 tests, ~10s)

To skip hooks: `git commit --no-verify`

### CI Pipeline

On every `push` / `pull_request` to `main`, GitHub Actions runs:

- **Frontend job**: `npm ci` → `oxlint` → `tsc -b && vite build` → `vitest --coverage`
- **Backend job**: `mvn -B clean compile`

Coverage reports are uploaded as build artifacts (retained 14 days).

---

## API Overview

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/books` | Add a new book |
| GET | `/api/books` | Get all books |
| GET | `/api/books/{id}` | Get a book by ID |
| PUT | `/api/books/{id}` | Update a book |
| DELETE | `/api/books/{id}` | Delete a book |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register a new user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get a user by ID |
| PUT | `/api/users/{id}` | Update a user |
| DELETE | `/api/users/{id}` | Delete a user |

### Borrow Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/borrow-records/borrow` | Borrow a book |
| PUT | `/api/borrow-records/{id}/return` | Return a book |
| GET | `/api/borrow-records` | View all borrow history |
| GET | `/api/borrow-records/users/{id}` | View history for a user |

---

## Business Rules

- A book cannot be borrowed if no copies are available.
- Borrowing a book decreases its available quantity.
- Returning a book increases its available quantity.
- A borrow record cannot be returned more than once.
- Book quantity cannot be reduced below the number of currently borrowed copies.

---

## Project Architecture

### Backend (`src/main/java/com/placement/librarymanagement/`)

```
controller/ → HTTP request/response handlers
service/    → Business logic (borrowing, returning, etc.)
repository/ → Spring Data JPA data access
entity/     → JPA entities and relationships
dto/        → Request/response data transfer objects
exception/  → Custom exceptions + global error handler
config/     → Application configuration (CORS, etc.)
util/       → Enums, constants, helpers
```

### Frontend (`frontend/src/`)

```
pages/          → Dashboard, Books, Users, BorrowRecords
components/ui/  → Modal, Toast, StatusBadge, EmptyState, LoadingSpinner
components/Layout/ → Sidebar, Navbar, Layout
services/       → Axios API clients (book, user, borrow)
types/          → TypeScript interfaces
config/         → API client + error utilities
```

### Test Coverage

```
Frontend: 184 tests across 16 test files
  UI Components  → 100%
  Layout         → 100%
  Services       → 100%
  Config         → 100%
  Pages          → 100% (BorrowRecords ~97%*)
  Overall        → 99%+ statements, branches, lines
```

*\*BorrowRecords line 295 is a JSX string literal prop that both V8 and Istanbul coverage tools fail to instrument — confirmed as rendered by passing tests.*

---

## Future Improvements

- JWT-based authentication + Spring Security
- Pagination and sorting for list APIs
- Book search by title, author, or ISBN
- Due dates and fine calculation
- JWT-based authentication + Spring Security
- Pagination and sorting for list APIs
- Book search by title, author, or ISBN
- Due dates and fine calculation

---

## Author

**Harshvardhan DPU**  
GitHub: [harshvardhandpu](https://github.com/harshvardhandpu)
