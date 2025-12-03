# Vinabooking

Welcome to Vinabooking, a comprehensive online platform for accommodation booking. This repository contains the full-stack application, comprising a microservices-based backend and a modern React frontend.

## Architecture

The Vinabooking application follows a microservices architecture for its backend, built with Node.js and TypeScript, communicating primarily via gRPC. A dedicated API Gateway acts as the single entry point. The frontend is a single-page application developed with React and Vite, consuming the APIs exposed by the backend. The entire system is containerized using Docker and orchestrated with Docker Compose for easy deployment and development.

## Core Features

*   **User Management:** Registration, authentication, user profiles.
*   **Accommodation Listings:** Browse, view details, search, and filter accommodations.
*   **Room Management:** Detailed room information and availability within accommodations.
*   **Booking System:** Seamless reservation and booking process.
*   **Reviews & Ratings:** Users can leave reviews and ratings for accommodations.
*   **Image Management:** Upload and display images for accommodations and users.
*   **Email Notifications:** Transactional emails for booking confirmations, etc.

## Technology Stack

*   **Frontend:** React, TypeScript, Vite
*   **Backend:** Node.js, TypeScript, Express.js
*   **Database:** MySQL (via Prisma ORM)
*   **Inter-service Communication:** gRPC
*   **Containerization:** Docker, Docker Compose
*   **Process Management:** PM2 (for non-containerized backend development)
*   **Version Control:** Git

## Getting Started

To get the Vinabooking application up and running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HLoc26/Vinabooking-New.git
    cd Vinabooking-New
    ```

2.  **Backend Setup:**
    Follow the detailed instructions in the [API/README.md](./API/README.md) for environment configuration, gRPC code generation, database setup, and installing dependencies for all backend services.

3.  **Frontend Setup:**
    Follow the detailed instructions in the [UI/README.md](./UI/README.md) for environment configuration and installing dependencies for the frontend application.

4.  **Run the entire application with Docker Compose (Recommended):**
    Once you have configured the environment variables as described in the `API/README.md` and `UI/README.md`, you can start all services (backend and frontend) with a single command from the project root:

    ```bash
    docker-compose up -d --build
    ```
    -   The API Gateway will be accessible at `http://localhost:3000`.
    -   The UI application will be accessible at `http://localhost:5173`.

    Refer to the individual `README.md` files for instructions on running services locally without Docker or for specific development workflows.

## Project Structure

*   `API/`: Contains all backend microservices.
*   `UI/`: Contains the React frontend application.
*   `contracts/`: Protocol buffer (`.proto`) definitions for gRPC communication.
*   `generated/`: Generated gRPC code (and potentially other generated files).
*   `docker-compose.yaml`: Defines and orchestrates the multi-container Docker application.