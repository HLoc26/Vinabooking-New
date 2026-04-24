# API Documentation

The Vinabooking API is a RESTful service built with Express.js.

## Base URL
- Local: `http://localhost:8080/api`
- Production: TBD

## Resource Groups

### 1. Auth (`/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Authenticate and receive tokens.
- `POST /forgot-password`: Initiate password recovery.

### 2. User (`/user`)
- `GET /me`: Get current user profile.
- `PUT /update`: Update user details.
- `GET /favourites`: Manage traveller favourite lists.

### 3. Accommodation (`/accommodation`)
- `GET /`: Search and list accommodations.
- `GET /:id`: Get detailed info for a property.
- `POST /`: Create a new property (Owner only).

### 4. Room (`/room`)
- `GET /accommodation/:id`: List rooms for a property.
- `POST /`: Add a room to a property.

### 5. Booking (`/booking`)
- `POST /`: Create a new booking.
- `GET /my-bookings`: List bookings for the current user.
- `GET /:id`: Get booking details.

### 6. Owner (`/owner`)
- `GET /properties`: List properties owned by the user.
- `GET /bookings`: Manage bookings for owned properties.

### 7. Image (`/image`)
- `POST /upload`: Upload images to S3.
- `GET /:id`: Retrieve image metadata.

## Authentication
Most endpoints require a JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

## Error Handling
The API uses standard HTTP status codes:
- `200 OK`: Success.
- `400 Bad Request`: Validation or logic error.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Insufficient permissions (role-based).
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unexpected server error.
