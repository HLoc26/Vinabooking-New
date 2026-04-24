# Business Rules

This document defines the constraints and logic that govern the Vinabooking platform.

## 1. User Roles & Permissions

- **TRAVELLER**:
    - Can search for and view accommodations.
    - Can manage their own favourite lists.
    - Can create bookings.
    - Can leave reviews for completed bookings.
- **ACCOMMODATION_OWNER**:
    - Includes all TRAVELLER permissions.
    - Can create and manage their own accommodations.
    - Can manage rooms and pricing for their properties.
    - Can respond to reviews on their properties.
    - Can view and manage incoming bookings.

## 2. Booking Lifecycle

- **DRAFT**: The booking is being prepared but not yet confirmed.
- **PENDING**: The user has submitted the booking, awaiting payment or owner confirmation.
- **BOOKED**: Payment verified and the reservation is confirmed.
- **CANCELLED**: The booking was voided by either the user, the owner, or the system (timeout).
- **COMPLETED**: The stay has successfully ended.

## 3. Review Eligibility

- A user can only leave a review if they have a `COMPLETED` booking for that accommodation.
- Only one review can be left per booking.
- Owners can only reply to reviews that belong to their properties.

## 4. Accommodation Management

- New accommodations default to `DRAFT` status and must be manually `PUBLISHED` by the owner.
- An accommodation must have at least one room and an address before it can be published.
- Images uploaded must be assigned a primary image for listing displays.

## 5. Pricing Logic

- Total price for a booking is calculated based on:
    - Base room price * Number of nights.
    - Number of guests (if pricing type is per person).
    - Any additional fees from selected facilities.
