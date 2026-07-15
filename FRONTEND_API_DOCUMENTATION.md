# Library Management System — Frontend API Documentation

> Base URL: `http://localhost:8080`

---

## Table of Contents

1. [Books API](#1-books-api)
2. [Users API](#2-users-api)
3. [Borrow Records API](#3-borrow-records-api)
4. [Health Check](#4-health-check)
5. [Error Response Format](#5-error-response-format)
6. [CORS Configuration](#6-cors-configuration)

---

## 1. Books API

**Base Path:** `/api/books`

### 1.1 Add a Book

Creates a new book in the library inventory.

- **Method:** `POST`
- **Endpoint:** `/api/books`
- **Status Code:** `201 Created`

#### Request Body

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 5
}
```

| Field    | Type    | Required | Description                          |
|----------|---------|----------|--------------------------------------|
| title    | String  | Yes      | Book title (must not be blank)       |
| author   | String  | Yes      | Book author (must not be blank)      |
| isbn     | String  | Yes      | Unique ISBN (must not be blank)      |
| quantity | Integer | Yes      | Total copies (must be positive)      |

#### Response

```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 5,
  "availableQuantity": 5
}
```

| Field             | Type    | Description                           |
|-------------------|---------|---------------------------------------|
| id                | Long    | Auto-generated book ID                |
| title             | String  | Book title                            |
| author            | String  | Book author                           |
| isbn              | String  | ISBN (unique constraint in DB)        |
| quantity          | Integer | Total copies owned by library         |
| availableQuantity | Integer | Copies currently available for borrow |

---

### 1.2 Get All Books

Retrieves a list of all books in the library.

- **Method:** `GET`
- **Endpoint:** `/api/books`
- **Status Code:** `200 OK`
- **Request Body:** None

#### Response

```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "quantity": 5,
    "availableQuantity": 3
  },
  {
    "id": 2,
    "title": "1984",
    "author": "George Orwell",
    "isbn": "9780451524935",
    "quantity": 3,
    "availableQuantity": 3
  }
]
```

Returns an empty array `[]` if no books exist.

---

### 1.3 Get Book by ID

Retrieves a single book by its ID.

- **Method:** `GET`
- **Endpoint:** `/api/books/{bookId}`
- **Status Code:** `200 OK`
- **Request Body:** None
- **Path Variable:** `bookId` (Long)

#### Response

```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 5,
  "availableQuantity": 3
}
```

#### Error

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Book not found with id: 99",
  "path": "/api/books/99",
  "validationErrors": null
}
```

---

### 1.4 Update a Book

Updates an existing book's details.

- **Method:** `PUT`
- **Endpoint:** `/api/books/{bookId}`
- **Status Code:** `200 OK`
- **Path Variable:** `bookId` (Long)

#### Request Body

```json
{
  "title": "The Great Gatsby (Updated Edition)",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 10
}
```

#### Business Rules

- If new quantity is less than currently borrowed copies, the API returns a `400 Bad Request` with message: `"Book quantity cannot be less than currently borrowed copies"`.
- `availableQuantity` is automatically recalculated: `newQuantity - currentlyBorrowedCopies`.

#### Response

```json
{
  "id": 1,
  "title": "The Great Gatsby (Updated Edition)",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 10,
  "availableQuantity": 8
}
```

---

### 1.5 Delete a Book

Removes a book from the library inventory.

- **Method:** `DELETE`
- **Endpoint:** `/api/books/{bookId}`
- **Status Code:** `204 No Content`
- **Request Body:** None
- **Path Variable:** `bookId` (Long)

#### Response

No body returned.

#### Error

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Book not found with id: 99",
  "path": "/api/books/99",
  "validationErrors": null
}
```

---

## 2. Users API

**Base Path:** `/api/users`

### 2.1 Register a User

Creates a new library user/member.

- **Method:** `POST`
- **Endpoint:** `/api/users`
- **Status Code:** `201 Created`

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

| Field | Type   | Required | Description                         |
|-------|--------|----------|-------------------------------------|
| name  | String | Yes      | User's full name (must not be blank)|
| email | String | Yes      | Valid email (unique in DB)          |
| phone | String | Yes      | Phone number (must not be blank)    |

#### Response

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

---

### 2.2 Get All Users

Retrieves a list of all registered users.

- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Status Code:** `200 OK`
- **Request Body:** None

#### Response

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+0987654321"
  }
]
```

Returns an empty array `[]` if no users exist.

---

### 2.3 Get User by ID

Retrieves a single user by their ID.

- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}`
- **Status Code:** `200 OK`
- **Request Body:** None
- **Path Variable:** `userId` (Long)

#### Response

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

---

### 2.4 Update a User

Updates an existing user's details.

- **Method:** `PUT`
- **Endpoint:** `/api/users/{userId}`
- **Status Code:** `200 OK`
- **Path Variable:** `userId` (Long)

#### Request Body

```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "phone": "+1112223333"
}
```

#### Response

```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john.new@example.com",
  "phone": "+1112223333"
}
```

---

### 2.5 Delete a User

Removes a user from the system.

- **Method:** `DELETE`
- **Endpoint:** `/api/users/{userId}`
- **Status Code:** `204 No Content`
- **Request Body:** None
- **Path Variable:** `userId` (Long)

---

## 3. Borrow Records API

**Base Path:** `/api/borrow-records`

### 3.1 Borrow a Book

Creates a new borrow record and decrements the book's available quantity.

- **Method:** `POST`
- **Endpoint:** `/api/borrow-records/borrow`
- **Status Code:** `201 Created`

#### Request Body

```json
{
  "userId": 1,
  "bookId": 1
}
```

| Field  | Type | Required | Description         |
|--------|------|----------|---------------------|
| userId | Long | Yes      | ID of the borrower  |
| bookId | Long | Yes      | ID of the book      |

#### Response

```json
{
  "id": 1,
  "borrowDate": "2024-01-15",
  "returnDate": null,
  "status": "BORROWED",
  "userId": 1,
  "userName": "John Doe",
  "bookId": 1,
  "bookTitle": "The Great Gatsby"
}
```

#### Errors

| Condition                                   | Status | Message                                        |
|---------------------------------------------|--------|------------------------------------------------|
| Book not found                              | 404    | Book not found with id: 99                     |
| User not found                              | 404    | User not found with id: 99                     |
| No available copies                         | 400    | Book is currently not available for borrowing  |

---

### 3.2 Return a Book

Marks a borrow record as returned and increments the book's available quantity.

- **Method:** `PUT`
- **Endpoint:** `/api/borrow-records/{borrowRecordId}/return`
- **Status Code:** `200 OK`
- **Path Variable:** `borrowRecordId` (Long)

#### Response

```json
{
  "id": 1,
  "borrowDate": "2024-01-15",
  "returnDate": "2024-01-20",
  "status": "RETURNED",
  "userId": 1,
  "userName": "John Doe",
  "bookId": 1,
  "bookTitle": "The Great Gatsby"
}
```

#### Errors

| Condition                            | Status | Message                                                |
|--------------------------------------|--------|--------------------------------------------------------|
| Borrow record not found              | 400    | Borrow record not found with id: 99                    |
| Book already returned                | 400    | This book has already been returned                    |

---

### 3.3 Get All Borrow History

Retrieves the complete borrowing history.

- **Method:** `GET`
- **Endpoint:** `/api/borrow-records`
- **Status Code:** `200 OK`
- **Request Body:** None

#### Response

```json
[
  {
    "id": 1,
    "borrowDate": "2024-01-15",
    "returnDate": "2024-01-20",
    "status": "RETURNED",
    "userId": 1,
    "userName": "John Doe",
    "bookId": 1,
    "bookTitle": "The Great Gatsby"
  },
  {
    "id": 2,
    "borrowDate": "2024-01-18",
    "returnDate": null,
    "status": "BORROWED",
    "userId": 2,
    "userName": "Jane Smith",
    "bookId": 2,
    "bookTitle": "1984"
  }
]
```

Returns an empty array `[]` if no records exist.

---

### 3.4 Get Borrow History by User

Retrieves the borrowing history for a specific user.

- **Method:** `GET`
- **Endpoint:** `/api/borrow-records/users/{userId}`
- **Status Code:** `200 OK`
- **Request Body:** None
- **Path Variable:** `userId` (Long)

#### Response

Same format as 3.3, filtered to the specific user, ordered by borrow date descending.

---

## 4. Health Check

- **Method:** `GET`
- **Endpoint:** `/`
- **Status Code:** `200 OK`

#### Response

```
Library Management API is running
```

---

## 5. Error Response Format

All error responses follow this structure:

**Standard Error:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Book not found with id: 99",
  "path": "/api/books/99",
  "validationErrors": null
}
```

**Validation Error:**

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/books",
  "validationErrors": {
    "title": "Book title is required",
    "isbn": "ISBN is required"
  }
}
```

| Field             | Type              | Description                              |
|-------------------|-------------------|------------------------------------------|
| timestamp         | LocalDateTime     | When the error occurred                  |
| status            | Integer           | HTTP status code                         |
| error             | String            | HTTP status reason phrase                |
| message           | String            | Error description                        |
| path              | String            | The request URL that caused the error    |
| validationErrors  | Map or null       | Field-level validation errors (if any)   |

**Common HTTP Status Codes:**

| Code | Description                                          |
|------|------------------------------------------------------|
| 201  | Resource created successfully                        |
| 200  | Request successful                                   |
| 204  | Request successful, no content returned              |
| 400  | Bad request (validation error or business rule)      |
| 404  | Resource not found                                   |
| 409  | Conflict (e.g., duplicate ISBN/email)               |
| 500  | Internal server error                                |

---

## 6. CORS Configuration

The backend already accepts requests from:

- `http://localhost:3000`
- `http://localhost:5173` (Vite dev server default)

Allowed HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## Frontend API Usage Summary

| Feature               | Method   | Endpoint                            | Used On                 |
|-----------------------|----------|-------------------------------------|-------------------------|
| List books            | `GET`    | `/api/books`                        | Books page, Dashboard   |
| Get book details      | `GET`    | `/api/books/{id}`                   | Book details view       |
| Add book              | `POST`   | `/api/books`                        | Add book form           |
| Update book           | `PUT`    | `/api/books/{id}`                   | Edit book form          |
| Delete book           | `DELETE` | `/api/books/{id}`                   | Books list              |
| List users            | `GET`    | `/api/users`                        | Users page, Borrow form |
| Get user details      | `GET`    | `/api/users/{id}`                   | User details view       |
| Register user         | `POST`   | `/api/users`                        | Add user form           |
| Update user           | `PUT`    | `/api/users/{id}`                   | Edit user form          |
| Delete user           | `DELETE` | `/api/users/{id}`                   | Users list              |
| Borrow history        | `GET`    | `/api/borrow-records`               | History page, Dashboard |
| User borrow history   | `GET`    | `/api/borrow-records/users/{id}`    | User details            |
| Borrow a book         | `POST`   | `/api/borrow-records/borrow`        | Borrow book form        |
| Return a book         | `PUT`    | `/api/borrow-records/{id}/return`   | Borrow history          |
| Health check          | `GET`    | `/`                                 | Backend status check    |
