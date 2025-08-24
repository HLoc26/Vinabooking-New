## How to set up
1. Clone the repository:
    ```bash
    git clone https://github.com/HLoc26/Microservice-Template.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Microservice-Template
    ```
3. Install the required dependencies:
    ```bash
    npm install
    ```
4. Set up env files
   In each `API/x-service` folder, set up the `.env` file based on the `.env.example`
   In `API`, set up `common.env` file based on `API/.env.example`
6. Start the application:
    ```bash
    docker compose up --build
    ```
