# Library Management System

A professional Spring Boot backend project for managing books, library users, and borrowing records.  
This project is built to demonstrate Java backend fundamentals, REST API design, JPA relationships, MySQL integration, validation, and clean layered architecture.

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA / Hibernate
- MySQL
- Maven
- Lombok
- Bean Validation

## Features

- Book CRUD APIs for adding, viewing, updating, and deleting books
- User CRUD APIs for registering and managing library users
- Borrow and return system with stock availability checks
- Borrow history tracking for all users and individual users
- Request validation using Bean Validation
- Centralized exception handling with meaningful JSON responses
- Clean Controller-Service-Repository architecture

## Project Architecture

The project follows a standard layered Spring Boot architecture:

- `controller`: Handles HTTP requests and responses
- `service`: Contains business logic such as borrowing and returning books
- `repository`: Communicates with the database using Spring Data JPA
- `entity`: Represents database tables and JPA relationships
- `dto`: Defines request and response models
- `exception`: Handles custom exceptions and global error responses
- `config`: Contains application configuration
- `util`: Stores utility classes and enums

This structure keeps controllers thin, services focused on business rules, and repositories responsible only for database access.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/harshvardhandpu/library-management-system.git
cd library-management-system
```

### 2. Configure MySQL

Create a MySQL database:

```sql
CREATE DATABASE library_management_db;
```

Update database credentials in:

```text
src/main/resources/application.properties
```

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_management_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Run the Spring Boot Application

```bash
mvn spring-boot:run
```

The application will start at:

```text
http://localhost:8080
```

### 4. Build the Project

```bash
mvn clean package
```

## API Overview

### Book APIs

- `POST /api/books` - Add a new book
- `GET /api/books` - Get all books
- `GET /api/books/{bookId}` - Get a book by ID
- `PUT /api/books/{bookId}` - Update a book
- `DELETE /api/books/{bookId}` - Delete a book

### User APIs

- `POST /api/users` - Register a new user
- `GET /api/users` - Get all users
- `GET /api/users/{userId}` - Get a user by ID
- `PUT /api/users/{userId}` - Update a user
- `DELETE /api/users/{userId}` - Delete a user

### Borrow APIs

- `POST /api/borrow-records/borrow` - Borrow a book
- `PUT /api/borrow-records/{borrowRecordId}/return` - Return a book
- `GET /api/borrow-records` - View complete borrow history
- `GET /api/borrow-records/users/{userId}` - View borrow history by user

## Core Business Rules

- A book cannot be borrowed if no copies are available.
- Borrowing a book decreases its available quantity.
- Returning a book increases its available quantity.
- A borrow record cannot be returned more than once.
- Book quantity cannot be reduced below the number of currently borrowed copies.

## Future Improvements

- Add JWT-based authentication
- Add Spring Security with role-based access
- Add pagination and sorting for list APIs
- Add book search by title, author, or ISBN
- Add due dates and fine calculation
- Add unit and integration tests
- Deploy the application to a cloud platform

## Author

**Harshvardhan DPU**  
GitHub: [harshvardhandpu](https://github.com/harshvardhandpu)
