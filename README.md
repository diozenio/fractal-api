# Fractal API

> Backend service for a task management application with AI-powered features.

## Features

-   **Authentication**: Secure user authentication including signup, login, and Google social login.
-   **Task Management**: Full CRUD (Create, Read, Update, Delete) operations for tasks and subtasks.
-   **AI Subtask Generation**: Automatically break down tasks into smaller subtasks using AI.
-   **Session Management**: Utilizes Redis for efficient caching of user sessions.
-   **Database**: Uses Prisma ORM with PostgreSQL for robust data management.

---

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:
-   Node.js >= 18
-   pnpm
-   Docker and Docker Compose

### Installation

```bash
git clone https://github.com/diozenio/fractal-api.git
cd fractal-api
pnpm install
```

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Or manually create a *.env* file with the following content from the example:

```env
# PostgreSQL
DATABASE_USER=fractaluser
DATABASE_PASSWORD=fractalpass
DATABASE_NAME=fractaldb
DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}?schema=public"

# JWT
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIPIRES_IN=30d
JWT_COOKIE_NAME=session_token

# Application
PORT=3333

# Google Auth
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=
```

### Running the Database

Start the PostgreSQL and Redis services with Docker:

```bash
docker compose up -d
```

### Running Migrations

Apply Prisma migrations to your database:

```bash
pnpm prisma migrate dev
```

To open Prisma Studio and view your data:

```bash
pnpm prisma studio
```

### Running the App

Run the development server:

```bash
pnpm run start:dev
```
---

## Folder Structure

```
fractal-api/
├── prisma/      → Prisma schema and migrations
└── src/
    ├── ai/        → AI-powered features (subtask generation)
    ├── auth/      → Authentication logic (controllers, services, DTOs, guards)
    ├── core/      → Core domain models and enums
    ├── prisma/    → Prisma service configuration
    ├── redis/     → Redis service configuration
    └── task/      → Task management module (controllers, services, DTOs)
```

---

## Technologies Used

-   **Backend Framework**: NestJS
-   **ORM**: Prisma
-   **Database**: PostgreSQL
-   **Caching**: Redis
-   **AI**: OpenAI
-   **Type Checking**: TypeScript
-   **Validation**: class-validator
-   **Package Manager**: pnpm

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
