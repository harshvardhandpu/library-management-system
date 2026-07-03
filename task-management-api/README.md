# Task Management API

A clean RESTful backend for creating users and managing daily tasks. This project is built to demonstrate Java, Spring Boot, REST API design, MySQL, JPA/Hibernate, validation, exception handling, and layered architecture for college placements and junior backend developer interviews.

## Project Overview

Task Management API allows users to create and organize tasks with status, priority, due date, and timestamps. The project intentionally stays beginner-to-intermediate level and avoids enterprise features such as Spring Security, JWT, Docker, microservices, Kafka, and Redis.

## Features

- User CRUD operations
- Task CRUD operations
- Get tasks by user
- Filter tasks by status
- Filter tasks by priority
- Search tasks by title
- Pagination for task listing
- Sorting tasks by due date
- Automatic `createdAt` and `updatedAt` timestamps
- Bean Validation for request data
- Global exception handling with meaningful JSON errors
- Business rule: task title cannot be empty
- Business rule: due date cannot be in the past while creating a task
- Business rule: completed tasks can only update their description

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
src/main/java/com/harshdpu/taskmanagement
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

### users

| Column | Type | Notes |
| --- | --- | --- |
| id | BIGINT | Primary key, auto increment |
| name | VARCHAR(100) | Required |
| email | VARCHAR(150) | Required, unique |

### tasks

| Column | Type | Notes |
| --- | --- | --- |
| id | BIGINT | Primary key, auto increment |
| title | VARCHAR(150) | Required |
| description | VARCHAR(1000) | Optional |
| status | VARCHAR(20) | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| priority | VARCHAR(20) | `LOW`, `MEDIUM`, `HIGH` |
| due_date | DATE | Required |
| created_at | DATETIME | Auto generated |
| updated_at | DATETIME | Auto updated |
| user_id | BIGINT | Foreign key to `users.id` |

Relationship: one user can have many tasks, and each task belongs to one user.

## API Endpoints

### User APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users` | Create a user |
| GET | `/api/users/{id}` | Get a user by id |
| GET | `/api/users` | Get all users |
| PUT | `/api/users/{id}` | Update a user |
| DELETE | `/api/users/{id}` | Delete a user |

### Task APIs

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/{id}` | Get a task by id |
| GET | `/api/tasks?page=0&size=10&sortDir=asc` | Get paginated tasks sorted by due date |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| GET | `/api/tasks/user/{userId}` | Get tasks by user |
| GET | `/api/tasks/status/{status}` | Get tasks by status |
| GET | `/api/tasks/priority/{priority}` | Get tasks by priority |
| GET | `/api/tasks/search?title=exam` | Search tasks by title |

## How to Run

1. Create a MySQL database user or use your local root account.
2. Update `src/main/resources/application.properties` if your MySQL username or password is different.
3. Start MySQL.
4. Run the application:

```bash
./mvnw spring-boot:run
```

The API starts on:

```text
http://localhost:8080
```

The configured database URL uses `createDatabaseIfNotExist=true`, so MySQL can create `task_management_db` automatically when the configured user has permission.

## Sample Requests

### Create User

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Harsh",
    "email": "harsh@example.com"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prepare Spring Boot notes",
    "description": "Revise REST APIs, JPA, validation, and exception handling",
    "status": "PENDING",
    "priority": "HIGH",
    "dueDate": "2026-07-10",
    "userId": 1
  }'
```

### Get Paginated Tasks

```bash
curl "http://localhost:8080/api/tasks?page=0&size=5&sortDir=asc"
```

### Filter Tasks By Status

```bash
curl "http://localhost:8080/api/tasks/status/PENDING?page=0&size=10"
```

### Search Tasks By Title

```bash
curl "http://localhost:8080/api/tasks/search?title=Spring"
```

## Validation and Error Response

Invalid requests return structured JSON:

```json
{
  "timestamp": "2026-07-03T13:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/tasks",
  "validationErrors": {
    "title": "Title is required"
  }
}
```

## Future Improvements

- Add unit tests for services
- Add integration tests for controllers
- Add simple API documentation with Swagger/OpenAPI
- Add role-based authentication in a later advanced version
- Add frontend integration with React or Angular

