# TaskFlow API Reference

This document provides a complete reference for the TaskFlow REST API, including endpoint specifications, parameter constraints, example `curl` commands, and request/response payloads.

---

## Overview

### Base URL
By default, the local backend runs on:
```
http://localhost:5000/api/v1
```

### Authentication
Endpoints marked with 🔒 require an authentication token sent in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```
You receive this token in the response when calling `POST /auth/signup` or `POST /auth/login`.

If the `Authorization` header is missing or the token is invalid/expired, the API rejects the request before reaching the route handler:
- **Missing token (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "No token provided. Access denied."
  }
  ```
- **Invalid or expired token (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid or expired token."
  }
  ```

### Error Format
All errors return a consistent JSON response:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Validation errors also include an `errors` array with each failing rule (for example, when multiple signup rules fail):
```json
{
  "success": false,
  "message": "Name must be at least 2 characters.",
  "errors": [
    "Name must be at least 2 characters.",
    "Provide a valid email.",
    "Password must be at least 6 characters.",
    "Password must contain at least one uppercase letter.",
    "Password must contain at least one number."
  ]
}
```

---

## Endpoints

### 1. Health Check

Checks whether the API is running and responsive.

- **Method / URL**: `GET /health`
- **Authentication**: None

#### Example Request
```bash
curl -X GET http://localhost:5000/api/v1/health
```

#### Success Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2026-10-14T10:00:00.000Z"
}
```

---

### 2. Sign Up

Creates a new user account and returns a JWT authentication token.

- **Method / URL**: `POST /auth/signup`
- **Authentication**: None
- **Request Body** (`application/json`):
  - `name` (string, required): Minimum 2 characters.
  - `email` (string, required): Valid email address format. Must be unique.
  - `password` (string, required): Minimum 6 characters, must contain at least one uppercase letter (`A-Z`) and at least one number (`0-9`).

#### Example Request
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123"
  }'
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "670c5b369a421ef8841a0101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bio": "",
    "avatar": "",
    "createdAt": "2026-10-14T10:00:00.000Z",
    "updatedAt": "2026-10-14T10:00:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses
- **400 Bad Request** - Missing or invalid fields:
  ```json
  {
    "success": false,
    "message": "Name must be at least 2 characters.",
    "errors": [
      "Name must be at least 2 characters.",
      "Provide a valid email.",
      "Password must be at least 6 characters.",
      "Password must contain at least one uppercase letter.",
      "Password must contain at least one number."
    ]
  }
  ```
- **400 Bad Request** - Duplicate email:
  ```json
  {
    "success": false,
    "message": "An account with this email already exists."
  }
  ```

---

### 3. Log In

Authenticates an existing user and returns a JWT token.

- **Method / URL**: `POST /auth/login`
- **Authentication**: None
- **Request Body** (`application/json`):
  - `email` (string, required): The user's account email.
  - `password` (string, required): The user's account password.

#### Example Request
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "Password123"
  }'
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "670c5b369a421ef8841a0101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bio": "",
    "avatar": "",
    "createdAt": "2026-10-14T10:00:00.000Z",
    "updatedAt": "2026-10-14T10:00:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses
- **400 Bad Request** - Missing email or password:
  ```json
  {
    "success": false,
    "message": "Email and password are required."
  }
  ```
- **401 Unauthorized** - Invalid credentials:
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```

---

### 4. Log Out

Logs out the current user session. Because JWT tokens are stateless, this endpoint confirms the logout on the server while the client discards the saved token.

- **Method / URL**: `POST /auth/logout`
- **Authentication**: 🔒 Required (`Bearer <token>`)

#### Example Request
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

#### Error Responses
- **401 Unauthorized** - Missing token:
  ```json
  {
    "success": false,
    "message": "No token provided. Access denied."
  }
  ```
- **401 Unauthorized** - Invalid or expired token:
  ```json
  {
    "success": false,
    "message": "Invalid or expired token."
  }
  ```

---

### 5. Get Current Profile

Fetches the profile details of the currently authenticated user.

- **Method / URL**: `GET /me`
- **Authentication**: 🔒 Required (`Bearer <token>`)

#### Example Request
```bash
curl -X GET http://localhost:5000/api/v1/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "670c5b369a421ef8841a0101",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "bio": "Open source contributor",
    "avatar": "",
    "createdAt": "2026-10-14T10:00:00.000Z",
    "updatedAt": "2026-10-14T10:05:00.000Z",
    "__v": 0
  }
}
```

---

### 6. Update Profile

Updates profile information (name, bio, avatar) or changes password.

- **Method / URL**: `PUT /me`
- **Authentication**: 🔒 Required (`Bearer <token>`)
- **Request Body** (`application/json`, all optional):
  - `name` (string): Minimum 2 characters.
  - `bio` (string): Maximum 300 characters.
  - `avatar` (string): Avatar image URL.
  - `currentPassword` (string): Required if changing password.
  - `newPassword` (string): Minimum 6 characters.

#### Example Request
```bash
curl -X PUT http://localhost:5000/api/v1/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "name": "Jane Developer",
    "bio": "Building with the MERN stack."
  }'
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated.",
  "user": {
    "_id": "670c5b369a421ef8841a0101",
    "name": "Jane Developer",
    "email": "jane@example.com",
    "bio": "Building with the MERN stack.",
    "avatar": "",
    "createdAt": "2026-10-14T10:00:00.000Z",
    "updatedAt": "2026-10-14T10:10:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses
- **400 Bad Request** - Invalid name:
  ```json
  {
    "success": false,
    "message": "Name must be at least 2 characters."
  }
  ```
- **400 Bad Request** - Missing current password when changing password:
  ```json
  {
    "success": false,
    "message": "Current password is required to change password."
  }
  ```
- **400 Bad Request** - Incorrect current password:
  ```json
  {
    "success": false,
    "message": "Current password is incorrect."
  }
  ```
- **400 Bad Request** - New password too short:
  ```json
  {
    "success": false,
    "message": "New password must be at least 6 characters."
  }
  ```

---

### 7. List Tasks

Lists tasks belonging to the authenticated user with optional search, filters, and pagination.

- **Method / URL**: `GET /tasks`
- **Authentication**: 🔒 Required (`Bearer <token>`)
- **Query Parameters**:
  - `search` (string): Filters tasks whose title contains this term (case-insensitive, max 100 characters).
  - `status` (string): Filters by status: `"todo"`, `"in-progress"`, or `"done"`.
  - `priority` (string): Filters by priority: `"low"`, `"medium"`, or `"high"`.
  - `page` (number): Page number (defaults to `1`).
  - `limit` (number): Number of tasks per page (defaults to `20`, maximum `50`).

#### Example Request
```bash
curl -X GET "http://localhost:5000/api/v1/tasks?status=in-progress&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "670c5c189a421ef8841a0105",
      "title": "Review pull request submissions",
      "description": "Review and test open community PRs locally.",
      "priority": "high",
      "status": "in-progress",
      "owner": "670c5b369a421ef8841a0101",
      "createdAt": "2026-10-14T10:15:00.000Z",
      "updatedAt": "2026-10-14T10:15:00.000Z",
      "__v": 0
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 8. Create Task

Creates a new task associated with the authenticated user.

- **Method / URL**: `POST /tasks`
- **Authentication**: 🔒 Required (`Bearer <token>`)
- **Request Body** (`application/json`):
  - `title` (string, required): Up to 200 characters.
  - `description` (string, optional): Up to 1000 characters. Defaults to `""`.
  - `priority` (string, optional): `"low"`, `"medium"`, or `"high"`. Defaults to `"medium"`.
  - `status` (string, optional): `"todo"`, `"in-progress"`, or `"done"`. Defaults to `"todo"`.

#### Example Request
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Write comprehensive unit tests",
    "description": "Add tests covering all controller edge cases.",
    "priority": "high",
    "status": "todo"
  }'
```

#### Success Response (201 Created)
```json
{
  "success": true,
  "task": {
    "_id": "670c5c189a421ef8841a0105",
    "title": "Write comprehensive unit tests",
    "description": "Add tests covering all controller edge cases.",
    "priority": "high",
    "status": "todo",
    "owner": "670c5b369a421ef8841a0101",
    "createdAt": "2026-10-14T10:15:00.000Z",
    "updatedAt": "2026-10-14T10:15:00.000Z",
    "__v": 0
  }
}
```

#### Error Response
- **400 Bad Request** - Missing title:
  ```json
  {
    "success": false,
    "message": "Title is required."
  }
  ```

---

### 9. Get Single Task

Retrieves a specific task by its MongoDB ID.

- **Method / URL**: `GET /tasks/:id`
- **Authentication**: 🔒 Required (`Bearer <token>`)

#### Example Request
```bash
curl -X GET http://localhost:5000/api/v1/tasks/670c5c189a421ef8841a0105 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "task": {
    "_id": "670c5c189a421ef8841a0105",
    "title": "Write comprehensive unit tests",
    "description": "Add tests covering all controller edge cases.",
    "priority": "high",
    "status": "todo",
    "owner": "670c5b369a421ef8841a0101",
    "createdAt": "2026-10-14T10:15:00.000Z",
    "updatedAt": "2026-10-14T10:15:00.000Z",
    "__v": 0
  }
}
```

#### Error Response
- **404 Not Found** - Non-existent or invalid ID:
  ```json
  {
    "success": false,
    "message": "Task not found."
  }
  ```

---

### 10. Update Task

Updates one or more fields of an existing task.

- **Method / URL**: `PUT /tasks/:id`
- **Authentication**: 🔒 Required (`Bearer <token>`)
- **Request Body** (`application/json`, all optional):
  - `title` (string): Cannot be empty if provided. Up to 200 characters.
  - `description` (string): Up to 1000 characters.
  - `priority` (string): `"low"`, `"medium"`, or `"high"`.
  - `status` (string): `"todo"`, `"in-progress"`, or `"done"`.

#### Example Request
```bash
curl -X PUT http://localhost:5000/api/v1/tasks/670c5c189a421ef8841a0105 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "status": "done"
  }'
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "task": {
    "_id": "670c5c189a421ef8841a0105",
    "title": "Write comprehensive unit tests",
    "description": "Add tests covering all controller edge cases.",
    "priority": "high",
    "status": "done",
    "owner": "670c5b369a421ef8841a0101",
    "createdAt": "2026-10-14T10:15:00.000Z",
    "updatedAt": "2026-10-14T10:20:00.000Z",
    "__v": 0
  }
}
```

#### Error Responses
- **400 Bad Request** - Empty title:
  ```json
  {
    "success": false,
    "message": "Title cannot be empty."
  }
  ```
- **400 Bad Request** - Invalid priority value:
  ```json
  {
    "success": false,
    "message": "Invalid priority."
  }
  ```
- **400 Bad Request** - Invalid status value:
  ```json
  {
    "success": false,
    "message": "Invalid status."
  }
  ```
- **404 Not Found** - Task ID not found:
  ```json
  {
    "success": false,
    "message": "Task not found."
  }
  ```

---

### 11. Delete Task

Deletes a task by ID. Users can only delete tasks they own.

- **Method / URL**: `DELETE /tasks/:id`
- **Authentication**: 🔒 Required (`Bearer <token>`)

#### Example Request
```bash
curl -X DELETE http://localhost:5000/api/v1/tasks/670c5c189a421ef8841a0105 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Task deleted."
}
```

#### Error Response
- **404 Not Found** - Task ID not found:
  ```json
  {
    "success": false,
    "message": "Task not found."
  }
  ```

