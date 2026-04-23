# Onboarding Guide

Welcome to the Vinabooking project! This guide will help you get the application running on your local machine.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Docker & Docker Compose**: For running infrastructure services (MySQL, Redis) or the entire stack.
- **AWS Account**: For Cognito and S3 access.

## Running with Docker (Recommended)

The easiest way to start the entire stack is using Docker Compose.

```bash
docker-compose up -d --build
```

This will start:
- **MySQL (db)**: Port 3306
- **Redis**: Port 6379
- **Monolith Backend (monolith-service)**: Port 8080
- **React UI**: Port 5173

## Local Development Setup

If you prefer to run services individually for better debugging:

### 1. Backend Monolith (`API/monolith-service`)

1. **Install dependencies**:
   ```bash
   cd API/monolith-service
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required values (AWS credentials, Database URL, etc.).

3. **Database Setup**:
   Ensure MySQL is running, then sync the schema:
   ```bash
   npx prisma db push
   ```

4. **Run in Dev Mode**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:8080`.

### 2. Frontend UI (`UI`)

1. **Install dependencies**:
   ```bash
   cd UI
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env`.

3. **Run in Dev Mode**:
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

## Project Conventions

- Follow the rules defined in `.gemini/rules/`.
- Use TypeScript for both Backend and Frontend.
- Adhere to the Controller-Service-Repository pattern on the Backend.
- Use Feature-based architecture on the Frontend.
