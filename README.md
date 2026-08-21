# Task CRUD API

A simple REST API built with Node.js and Express to manage tasks using in-memory storage. This project supports a full CRUD cycle, basic task statistics, query-based filtering and searching, and interactive Swagger UI documentation.

---

## Features

- **Root & Health Check**: Inspect API metadata and check system availability.
- **Full CRUD Support**: Create, read, update, and delete tasks in-memory.
- **Filtering**: Retrieve tasks filtered by their completion status (`done=true` or `done=false`).
- **Searching**: Search tasks by title using case-insensitive matching (`search=keyword`).
- **Statistics**: Calculate total, completed, and open tasks dynamically.
- **Database Reset**: Restore the task list to its original 3 example tasks at any time.
- **Interactive Documentation**: Test and explore all endpoints via Swagger UI.

---

## Technologies Used

- **Node.js**
- **Express.js**
- **Swagger UI / OpenAPI 3.0**

---

## Installation & Setup

Follow these steps to run the project locally in under 5 minutes:

1. **Clone the repository** (or extract the project folder):
   ```bash
   git clone <repository-url>
   ```

2. **Navigate into the project folder**:
   ```bash
   cd FlyRank
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   The server will start running at the base URL: **`http://localhost:3000`**.

---

## Database Storage Note

> [!IMPORTANT]  
> This API utilizes **in-memory storage** (a JavaScript array) to hold task data. No persistent database or file storage is configured. Any changes (creations, updates, deletions) **will be lost** when the server restarts.

---

## Project Structure

```text
├── node_modules/        # Installed dependencies
├── .gitignore           # Ignores node_modules
├── index.js             # Express application and endpoint definitions
├── openapi.json         # OpenAPI 3.0 specification file
├── package.json         # Project metadata, scripts, and dependencies
├── package-lock.json    # Locked dependency tree
└── README.md            # Project documentation (this file)
```

---

## API Endpoints

| HTTP Method | Endpoint | Description | Success Status |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Retrieve API name, version, and endpoints metadata | `200 OK` |
| **GET** | `/health` | Check API health status | `200 OK` |
| **GET** | `/tasks` | Get all tasks (supports optional `done` and `search` query parameters) | `200 OK` |
| **POST** | `/tasks` | Create a new task | `201 Created` |
| **GET** | `/tasks/:id` | Get a specific task by its numeric ID | `200 OK` |
| **PUT** | `/tasks/:id` | Update an existing task's title and/or done status | `200 OK` |
| **DELETE**| `/tasks/:id` | Delete a specific task by its numeric ID | `204 No Content` |
| **GET** | `/stats` | Retrieve dynamic statistics for tasks | `200 OK` |
| **POST** | `/reset` | Restore tasks list to the default 3 tasks | `200 OK` |

---

## Swagger Documentation

An interactive API playground is available via Swagger UI. You can view, explore, and run all endpoints directly in the browser.

* **Swagger UI URL**: **`http://localhost:3000/docs`**

---

## Example Usage

### Creating a Task (POST `/tasks`)

* **Request Body** (`application/json`):
  ```json
  {
    "title": "Buy groceries"
  }
  ```

* **Response Body** (`application/json`):
  ```json
  {
    "id": 4,
    "title": "Buy groceries",
    "done": false
  }
  ```

### Verification Command

You can verify the API's behavior with the following `curl -i` command:

* **Command**:
  ```bash
  curl -i -X POST http://localhost:3000/tasks \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Learn Swagger\"}"
  ```

* **Expected Response**:
  ```http
  HTTP/1.1 201 Created
  X-Powered-By: Express
  Content-Type: application/json; charset=utf-8
  Content-Length: 46

  {"id":4,"title":"Learn Swagger","done":false}
  ```
