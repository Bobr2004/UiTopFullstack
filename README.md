# Todo Categories Fullstack Application

> **Note**  
> Developed by **Bohdan Shovkoplias** for the **UITOP fullstack assignment**.

This repository contains a full-stack task manager application styled in a custom, vibrant **Neo-Brutalist** design. The application enables users to manage todos categorized into specific groups (Work, Study, Personal, Home, Other), enforces business constraints on task limits, and features interactive toast notifications with real-time undo-actions.

---

## 🏗️ Architecture & Technologies

The codebase is split into two independent services:

### ⚙️ Backend
* **Runtime**: Node.js & TypeScript
* **Framework**: Express.js
* **Database**: SQLite (managed with `better-sqlite3` and configured in WAL mode)
* **ORM**: Drizzle ORM
* **Validation**: Zod (for query parameters, URL path variables, and body inputs)
* **Testing**: Vitest (featuring integration tests running against an in-memory SQLite database)

### 🖥️ Frontend
* **Framework**: Next.js (App Router, React 19)
* **Styling**: Tailwind CSS configured with a custom Neo-Brutalist color and border utility theme
* **State Management & Fetching**: TanStack React Query (supporting local optimistic-cache updates)
* **Form Management**: React Hook Form with Zod schema resolver
* **Testing**: Vitest & React Testing Library (with user-event interactions)

---

## 📂 Project Structure

```txt
UiTopFullstack/
├── backend/                # Express API Service
│   ├── src/
│   │   ├── db/            # Database schema and initialization
│   │   ├── middleware/    # Global error handlers
│   │   ├── modules/       # Domain business logic (todos, categories)
│   │   └── utils/         # Async wrappers and custom classes
│   └── test/              # Integration API tests
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/           # App routes and layout configs
│   │   ├── components/    # UI primitives and application components
│   │   ├── lib/           # Axios wrapper and React Query helpers
│   │   └── types/         # TypeScript definitions
│   └── public/            # Static assets
└── docker-compose.yml      # Root orchestration setup
```

---

## 🚦 API Endpoints

The backend exposes a RESTful API.

| HTTP Method | Route | Description | Query Parameters / Payloads |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | API Status Check | *None* |
| **GET** | `/categories` | Retrieve all todo categories | *None* |
| **GET** | `/todos` | Retrieve todos (sorted by creation date) | `category` (optional slug, e.g. `?category=work`) |
| **POST** | `/todos` | Create a new todo item | `{ "text": "Task details", "categoryId": 1 }` |
| **PATCH** | `/todos/:id` | Update completed status of a todo | `{ "completed": true }` |
| **DELETE** | `/todos/:id` | Remove a todo item | *None* |

*Note: The backend validates payloads strictly and returns structured error fields if Zod checks fail. It enforces that **each category can contain at most 5 tasks**.*

---

## 🚀 How to Run

You can spin up the application either using Docker Compose (recommended) or locally.

### Option 1: Docker Compose (All-in-One)
The root includes a `docker-compose.yml` to launch both services instantly with a persistent database.

1. Run the containers:
   ```bash
   docker compose up --build
   ```
2. Open your browser:
   * **Frontend**: [http://localhost:3000](http://localhost:3000)
   * **Backend API**: [http://localhost:4000/health](http://localhost:4000/health)

---

### Option 2: Local Development Setup
If running locally, you will need to start both services in separate terminals.

#### Step 1: Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment template and install dependencies:
   ```bash
   cp .env.example .env
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

#### Step 2: Start the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Copy the environment template and install dependencies:
   ```bash
   cp .env.example .env
   npm install
   ```
3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
4. Access the app at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

Both backend and frontend contain Vitest test suites.

### Backend Tests
Runs integration tests executing commands against in-memory SQLite:
```bash
cd backend
npm run test
```

### Frontend Tests
Runs UI component and hook integration tests:
```bash
cd frontend
npm run test
```

---

## 🧠 Development Process & AI Usage

The entire application development took **4 hours** in total, leveraging a structured workflow and modern AI-assisted engineering tools:

1. **Planning & Schema Design (First 30-40 minutes)**:
   * Spent the initial phase reading the assignment requirements thoroughly and formulating a clean system design.
   * Drafted the database models, relations, and business logic (like enforcing a maximum of 5 tasks per category).
2. **UX & Aesthetic Prototyping**:
   * Tested various visual ideas and UX animations (such as the 5-second undo toast actions) using **Antigravity**.
   * Customized the design tokens and Tailwind theme to align with a consistent Neo-Brutalist look.
3. **Architecture & Implementation**:
   * Implemented the TypeScript React components, API routing, and backend layers using the **codex gpt 5.5** model.
   * Built comprehensive test suites with **Vitest** and **React Testing Library** to validate features like form submission, bulk completion, and undo states.

