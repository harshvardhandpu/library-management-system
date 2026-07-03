# Library Management System

A clean, placement-level Java backend project for managing books, users, and borrowing records in a library.

This project is intentionally simple and realistic. It focuses on Java 17, Spring Boot REST APIs, JPA/Hibernate relationships, MySQL persistence, validation, exception handling, and layered backend architecture.

## Tech Stack

- Java 17
- Spring Boot 3
- Maven
- Spring Web
- Spring Data JPA / Hibernate
- MySQL
- Lombok
- Bean Validation

## Folder Structure

```text
src/main/java/com/placement/librarymanagement
├── config
├── controller
├── dto
├── entity
├── exception
├── repository
├── service
└── util
```

## Database Schema

### books

| Column | Type | Notes |
| --- | --- | --- |
| id | BIGINT | Primary key |
| title | VARCHAR | Required |
| author | VARCHAR | Required |
| isbn | VARCHAR | Required, unique |
| quantity | INT | Total copies |
| available_quantity | INT | Copies currently available |

### library_users

| Column | Type | Notes |
| --- | --- | --- |
| id | BIGINT | Primary key |
| name | VARCHAR | Required |
| email | VARCHAR | Required, unique |
| phone | VARCHAR | Required |

### borrow_records

| Column | Type | Notes |
| --- | --- | --- |
| id | BIGINT | Primary key |
| borrow_date | DATE | Required |
| return_date | DATE | Nullable until returned |
| status | VARCHAR | BORROWED or RETURNED |
| user_id | BIGINT | Many-to-one relationship with library_users |
| book_id | BIGINT | Many-to-one relationship with books |

## API List

### Book APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/books` | Add a book |
| GET | `/api/books/{bookId}` | Get a book by id |
| GET | `/api/books` | Get all books |
| PUT | `/api/books/{bookId}` | Update a book |
| DELETE | `/api/books/{bookId}` | Delete a book |

Sample book request:

```json
{
  "title": "Effective Java",
  "author": "Joshua Bloch",
  "isbn": "9780134685991",
  "quantity": 5
}
```

### User APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users` | Register a user |
| GET | `/api/users/{userId}` | Get a user by id |
| GET | `/api/users` | Get all users |
| PUT | `/api/users/{userId}` | Update a user |
| DELETE | `/api/users/{userId}` | Delete a user |

Sample user request:

```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "9876543210"
}
```

### Borrow APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/borrow-records/borrow` | Borrow a book |
| PUT | `/api/borrow-records/{borrowRecordId}/return` | Return a borrowed book |
| GET | `/api/borrow-records` | View complete borrow history |
| GET | `/api/borrow-records/users/{userId}` | View borrow history for one user |

Sample borrow request:

```json
{
  "userId": 1,
  "bookId": 1
}
```

## Business Rules

- A book cannot be borrowed if `availableQuantity` is `0`.
- Borrowing a book decreases `availableQuantity` by `1`.
- Returning a book increases `availableQuantity` by `1`.
- A borrow record cannot be returned more than once.
- Book quantity cannot be updated below the number of currently borrowed copies.

## Error Handling

The project includes centralized exception handling using `GlobalExceptionHandler`.

Handled errors include:

- Book not found
- User not found
- Borrowing rule violations
- Request validation failures
- Duplicate database values such as ISBN or email

Example validation error response:

```json
{
  "timestamp": "2026-07-03T12:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/books",
  "validationErrors": {
    "title": "Book title is required"
  }
}
```

## How to Run

1. Create a MySQL database user or use your local root user.
2. Update database credentials in `src/main/resources/application.properties` if needed.
3. Start MySQL.
4. Run the application:

```bash
mvn spring-boot:run
```

The application starts on:

```text
http://localhost:8080
```

Hibernate will create/update the required tables automatically because `spring.jpa.hibernate.ddl-auto=update` is enabled.

## Maven Build

```bash
mvn clean package
```

## Interview Highlights

- Layered architecture with controller, service, repository, entity, DTO, exception, config, and util packages
- Constructor injection using Lombok `@RequiredArgsConstructor`
- DTO-based request and response models
- JPA `ManyToOne` relationships for borrow records
- Transactional business logic for borrow and return operations
- Bean Validation for clean request validation
- Centralized JSON error responses

## Future Improvements

- Add search APIs for books by title, author, or ISBN
- Add pagination and sorting for list endpoints
- Add due dates and fine calculation
- Add unit tests for service layer business rules
- Add integration tests for REST APIs
- Add role-based authentication later if required
