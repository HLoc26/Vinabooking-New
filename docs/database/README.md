# Database Schema

Vinabooking uses **MySQL** as its primary relational database, managed through **Prisma ORM**.

## Core Tables

### 1. User & Profiles
- **User**: Stores basic identity info (ID from Cognito, email, name, role).
- **OwnerProfile**: Extended information for accommodation owners (business name, tax ID).
- **UserAuthProvider**: Tracks authentication methods (Credentials, Google).

### 2. Accommodation
- **Accommodation**: The main property record (name, type, status, owner).
- **Address**: Geographic location details for a property.
- **Facility / FacilityConfig**: Available services (e.g., Wi-Fi, Pool) and their specific settings for a property.

### 3. Room
- **Room**: Details about units within an accommodation (price, size, capacity).
- **Bed**: Specific bed types within a room.
- **Amenity / AmenityConfig**: Room-specific features (e.g., AC, TV).

### 4. Booking
- **Booking**: The header record for a reservation (dates, total price, status, reference number).
- **BookingDetail**: Links a booking to specific rooms or beds.

### 5. Review
- **Review**: User-submitted feedback and star ratings for a stay. Supports threaded replies (parent-child).

### 6. Media
- **Image**: Metadata for files stored in S3.
- **ImageReference**: Polymorphic-like links between images and entities (Accommodation, Room, Review, User).
- **ImageVariant**: Tracks different versions of an image (Thumbnail, WebP).

## Key Relationships
- **User -> Accommodation**: 1-to-Many (One owner can have many properties).
- **Accommodation -> Room**: 1-to-Many.
- **Room -> Bed**: 1-to-Many.
- **User -> Booking**: 1-to-Many (One traveller can make many bookings).
- **Booking -> BookingDetail**: 1-to-Many.
- **Accommodation -> Review**: 1-to-Many.

## Enumerations
The schema heavily uses enums to enforce data integrity:
- `ERole`: TRAVELLER, ACCOMMODATION_OWNER.
- `EBookingStatus`: DRAFT, PENDING, CANCELLED, BOOKED, COMPLETED.
- `EAccommodationType`: HOTEL, APARTMENT, VILLA, etc.
- `EVariantType`: ORIGINAL, THUMBNAIL, WEBP.
