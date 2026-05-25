# Todo Categories Backend

Node.js + Express + TypeScript API using Drizzle ORM and Turso (hosted SQLite).

## Deployed

```txt
https://ui-top-fullstack-bobr2004s-projects.vercel.app/
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The API starts on:

```txt
http://localhost:4000
```

> On the `deployed-version` branch the app runs as a Vercel Serverless Function via `api/index.ts`.

## Endpoints

```txt
GET /health
GET /categories
GET /todos
GET /todos?category=work
POST /todos
PATCH /todos/:id
DELETE /todos/:id
```

## Create Todo Body

```json
{
  "text": "Finish frontend",
  "categoryId": 1
}
```

## Update Todo Body

```json
{
  "completed": true
}
```

The backend enforces the rule that each category can contain at most 5 tasks.
