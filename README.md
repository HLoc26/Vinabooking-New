# Vinabooking

Welcome to Vinabooking, a comprehensive online platform for accommodation booking. This repository contains the full-stack application, comprising a monolithic backend and a modern React frontend.

**Project Documentation:** [docs/](docs/)

## Architecture

The Vinabooking application follows a monolithic architecture for its backend, built with Node.js and TypeScript. The frontend is a single-page application developed with React and Vite, consuming the APIs exposed by the backend. The entire system is containerized using Docker and orchestrated with Docker Compose for easy deployment and development.

## Core Features

*   **User Management:** Registration, authentication, user profiles.
*   **Accommodation Listings:** Browse, view details, search, and filter accommodations.
*   **Room Management:** Detailed room information and availability within accommodations.
*   **Booking System:** Seamless reservation and booking process.
*   **Reviews & Ratings:** Users can leave reviews and ratings for accommodations.
*   **Image Management:** Upload and display images for accommodations and users.

## Technology Stack

*   **Frontend:** React 19, TypeScript, Vite, MUI, Redux Toolkit, React Query
*   **Backend:** Node.js, TypeScript, Express.js
*   **Database:** MySQL (via Prisma ORM)
*   **Cache:** Redis
*   **Infrastructure:** AWS (Cognito, S3)
*   **Containerization:** Docker, Docker Compose
*   **Version Control:** Git

## Getting Started

To get the Vinabooking application up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HLoc26/Vinabooking-New.git
    cd Vinabooking-New
    ```

2.  **Backend Setup:**
    Follow the detailed instructions in the [API/monolith-service/README.md](./API/monolith-service/README.md) for environment configuration, database setup, and installing dependencies.

3.  **Frontend Setup:**
    Follow the detailed instructions in the [UI/README.md](./UI/README.md) for environment configuration and installing dependencies.

4.  **Run the entire application with Docker Compose (Recommended):**
    Once you have configured the environment variables as described in the backend and frontend READMEs, you can start all services with a single command from the project root:

    ```bash
    docker-compose up -d --build
    ```
    -   The API will be accessible at `http://localhost:8080`.
    -   The UI application will be accessible at `http://localhost:5173`.

    Refer to the individual `README.md` files for instructions on running services locally without Docker or for specific development workflows.

## Project Structure

*   `API/monolith-service/`: Contains the monolithic backend service.
*   `UI/`: Contains the React frontend application.
*   `docker-compose.yaml`: Defines and orchestrates the multi-container Docker application.

## AI Integration

This project uses Gemini CLI as an AI coding assistant. The `docs/` folder serves as the single source of truth for both developers and the Gemini agent. For details on how to write code according to project conventions, refer to the local `GEMINI.md` context files and any rules configured in the workspace.