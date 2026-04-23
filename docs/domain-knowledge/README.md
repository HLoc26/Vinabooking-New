# Domain Knowledge

This document outlines the core business domains and terminology used in Vinabooking.

## Core Domains

### 1. User Management
- **Traveller**: A user who searches for and books accommodations.
- **Accommodation Owner**: A user who lists and manages properties.
- **Identity Provider**: AWS Cognito handles the secure storage and authentication of users.

### 2. Accommodation
- **Property Types**: Hotel, Apartment, Villa, Hostel, etc.
- **Facilities**: General amenities provided by the property (e.g., Wi-Fi, Pool).
- **Rooms**: Individual units within an accommodation that can be booked.
- **Amenities**: Features specific to a room (e.g., AC, TV, Bed type).

### 3. Booking
- **Reservation**: The act of holding a room for a specific date range.
- **Status Flow**: `DRAFT` -> `PENDING` -> `BOOKED` -> `COMPLETED` / `CANCELLED`.
- **Pricing**: Can be per night, per person, or custom.

### 4. Reviews & Ratings
- **Review**: Feedback left by a traveller after a completed stay.
- **Star Rating**: Numeric assessment of the stay.
- **Reply**: Owners can respond to reviews left on their properties.

## Key Relationships
- A **User** can be a **Traveller** and/or an **Owner**.
- an **Accommodation** belongs to one **Owner**.
- An **Accommodation** has many **Rooms**.
- A **Booking** is made by a **User** for specific **Rooms**.
- A **Review** is linked to a **Booking**, a **User**, and an **Accommodation**.
