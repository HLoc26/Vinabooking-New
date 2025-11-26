# Vinabooking User Interface

This directory contains the frontend application for Vinabooking, built with React and Vite. It serves as the user interface for interacting with the Vinabooking Backend API.

## Core Technologies

-   **Framework**: React (with TypeScript)
-   **Build Tool**: Vite
-   **Styling**: (Assume a common library like Tailwind CSS, Bootstrap, or Material UI if known, otherwise leave general or check `package.json` for specific styling libraries. For now, keep it general.)
-   **API Client**: (Assume `fetch` or `axios` if not specified. For now, keep it general.)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   `npm` (or your preferred package manager)
-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (if running with Docker)

### 1. Environment Configuration

The UI application requires environment variables, primarily to specify the backend API Gateway URL.

1.  **Create a `.env` file** by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  **Open `.env` and configure the `VITE_API_GATEWAY_URL`**:
    *   If you are running the **backend services locally (via PM2 or direct Node.js execution)** and the UI locally:
        Set `VITE_API_GATEWAY_URL=http://localhost:3000` (assuming your API Gateway is running on port 3000 on your host machine).
    *   If you are running the **backend services with Docker Compose** and the UI locally:
        Set `VITE_API_GATEWAY_URL=http://localhost:3000` (assuming the API Gateway's port 3000 is exposed to your host machine).
    *   If you are running **both the UI and backend services with Docker Compose** (as part of the overall `docker-compose up` command from the project root):
        Set `VITE_API_GATEWAY_URL=http://api-gateway:3000` (using the Docker service name for inter-container communication).

### 2. Install Dependencies

Navigate into the `UI` directory and install the project dependencies:

```bash
cd UI
npm install
```

### 3. Run Locally (Development)

To start the development server for the UI:

```bash
cd UI
npm run dev
```
The application will typically be available at `http://localhost:5173`.

### 4. Run with Docker Compose (Development)

To run the UI along with the entire backend using Docker, navigate to the **project root** and execute:

```bash
# From the project root
docker-compose up -d --build
```
This will build and start all backend services and the UI. The UI will be accessible at `http://localhost:5173` (or the port configured in `docker-compose.yaml`). Ensure your `VITE_API_GATEWAY_URL` in `UI/.env` is set correctly as per the instructions in "1. Environment Configuration" for this scenario (`http://api-gateway:3000`).