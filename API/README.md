# Vinabooking Backend API

This directory contains the backend microservices for the Vinabooking application. The architecture is built using multiple independent services that communicate with each other, primarily via gRPC. An API Gateway serves as the single entry point for all client requests, abstracting the complexity of the internal service network.

## Services

The backend is composed of the following microservices:

-   **/api-gateway**: The primary entry point for all incoming client traffic. It routes requests to the appropriate downstream service.
-   **/accommodation-service**: Manages accommodation listings, details, availability, and location information.
-   **/auth-service**: Handles user authentication, authorization, registration, and JWT/token management.
-   **/booking-service**: Manages the entire booking and reservation lifecycle.
-   **/email-service**: Responsible for sending transactional emails, such as booking confirmations and notifications.
-   **/image-service**: Handles the upload, storage, and retrieval of images for accommodations and user profiles.
-   **/review-service**: Manages user reviews and ratings for accommodations.
-   **/room-service**: Manages details, pricing, and availability for rooms within an accommodation.
-   **/user-service**: Manages user profiles, settings, and personal information.

## Core Technologies

-   **Runtime**: Node.js
-   **Language**: TypeScript
-   **Framework**: Express.js
-   **Database ORM**: Prisma
-   **Inter-service Communication**: gRPC
-   **Containerization**: Docker & Docker Compose
-   **Process Management**: PM2

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
-   `npm` (or your preferred package manager)

### 1. Environment Configuration

Setting up the environment variables is a critical two-part process. There is a root configuration for Docker Compose and individual configurations for each microservice.

#### Part A: Root Docker Compose Environment

The `docker-compose.yaml` at the project root uses variables from `API/.env`. This file defines the network endpoints and database credentials for the container orchestration.

1.  **Navigate to the `API` directory.**
2.  **Create the `.env` file** by copying the example:
    ```bash
    cp .env.example .env
    ```
3.  **Review `API/.env`**. For most local setups, the default values for service endpoints (e.g., `http://auth-service:3002`) should work correctly within Docker's network and may not need changes. Adjust the database credentials if necessary.

#### Part B: Individual Service Environments

Each microservice has its own set of environment variables. These are used in two contexts: local development (e.g., with PM2) and within Docker containers.

For **each** of the following services, you must create and configure **both** a `.env` and a `docker.env` file:
-   `accommodation-service`
-   `api-gateway`
-   `auth-service`
-   `booking-service`
-   `email-service`
-   `image-service`
-   `review-service`
-   `room-service`
-   `user-service`

The process for each is the same:

1.  **Navigate into the service directory**:
    ```bash
    # Example for one service
    cd API/auth-service
    ```
2.  **Create the `.env` file for local development**:
    ```bash
    cp .env.example .env
    ```
    Open the newly created `.env` file and fill in required values. For database connections, typically use `localhost:3306` (or the host of your local database instance). For inter-service communication endpoints (e.g., `AUTH_ENDPOINT`, `USER_ENDPOINT`), use `localhost` with the appropriate port.

3.  **Create the `docker.env` file for Docker deployments**:
    ```bash
    cp docker.env.example docker.env
    ```
    Open the newly created `docker.env` file and fill in required values. **Crucially, for database connections when running within Docker, use `db:3306` instead of `localhost:3306`** (where `db` is the name of your database service in `docker-compose.yaml`). **Similarly, for inter-service communication endpoints (e.g., `AUTH_ENDPOINT`, `USER_ENDPOINT`), use the service name as the hostname (e.g., `auth-service:3002`, `user-service:3006`) instead of `localhost`.**

4.  **Update other variables**: Ensure other secret keys, API keys, etc., are correctly set in both files, as applicable.

### 2. Install Dependencies

You need to install dependencies for each service individually.

```bash
# Example for one service
cd API/user-service
npm install

# Repeat for all other services
```

### 3. gRPC Code Generation

Currently, three services (`auth-service`, `email-service`, `image-service`) communicate using gRPC. This requires generating TypeScript code from their corresponding protocol buffer (`.proto`) definitions located in the root `/contracts` directory.

This is a mandatory step before running the application for the first time, or after any changes have been made to the relevant `.proto` files.

**Step 1: Create Output Directories**

Before running the generation script, ensure the output directories exist for the three gRPC services. From the project's **root directory**, run the following commands:

```bash
# From the project root, create directories for the gRPC-enabled services
mkdir -p generated/grpc/auth-service
mkdir -p generated/grpc/email-service
mkdir -p generated/grpc/image-service
```

**Step 2: Generate the Code**

Now, from the **root directory** of the project, run the generation scripts for each of the three services.

```bash
# From the project root
npm run gen:grpc:auth-service
npm run gen:grpc:email-service
npm run gen:grpc:image-service
```
*(Note: While an `npm run gen:grpc:all` script exists, running the scripts individually is more precise as only the services above have corresponding `.proto` files in the `contracts` directory.)*

**Step 3: Copy Generated Files to Services**

The generated code is not automatically available to the individual services. You must manually copy the generated files from the root `generated/grpc/` subdirectories into the corresponding service's `API/.../generated/grpc/` directory.

You must do this for `auth-service`, `email-service`, and `image-service`. For example:

-   **From:** `[PROJECT_ROOT]/generated/grpc/auth-service/*`
-   **To:** `[PROJECT_ROOT]/API/auth-service/generated/grpc/`

Repeat this copy-and-paste process for the `email-service` and `image-service`.

### 4. Database Setup

Before running the full application, you need to ensure the database service is running and the Prisma schemas are pushed to the database.

**Step 1: Start the Database Service**

From the project's **root directory**, start only the `db` service using Docker Compose. This will create and start your MySQL database container.

```bash
# From the project root
docker-compose up -d db
```
Wait a moment for the database to fully initialize and become ready.

**Step 2: Push Prisma Schemas**

Once the database container is up and running, push all Prisma schemas to the database. This will create the necessary tables and relations.

```bash
# From the project root
npm run push:all
```
This command executes individual `npx prisma db push` commands for each service, syncing their schemas with the database.

*(If you encounter issues, ensure your `.env` files (especially `API/.env` and each service's `.env`) have the correct database connection strings and credentials.)*

### 5. Running the Services

#### Using Docker (Recommended)

The easiest way to get all services up and running is with Docker Compose.

1.  Ensure Docker Desktop is running.
2.  From the project's root directory, run:
    ```bash
    docker-compose up -d --build
    ```
3.  To view logs for all services, you can run `docker-compose logs -f`. To stop the services, run `docker-compose down`.

#### Using PM2 (for non-containerized development)

If you prefer to run the services directly on your host machine, you can use the provided PM2 ecosystem configuration.

1.  Make sure you have installed dependencies and configured the `.env` files for all services.
2.  From the project's root directory, run:
    ```bash
    npm install -g pm2
    pm2 start ecosystem.config.js
    ```
3.  You can monitor the services with `pm2 list` or `pm2 monit`.

## gRPC Contracts

Shared gRPC service definitions (`.proto` files) are located in the `/contracts` directory at the project root. These files define the API contracts for inter-service communication. When these files are updated, corresponding client and server code must be regenerated within each relevant service.
