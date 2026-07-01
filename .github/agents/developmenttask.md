# antigravity Development Prompt: Ticket Booking System Full-Stack App

You are antigravity antigravity / AI coding agent. Build a complete full-stack **Ticket Booking System** application based on the requirements below.

Important: **Do not perform antigravity submission tasks** such as creating repository, pushing code, setting branch to main, making repository public, or generating submission links. Only do the development work inside this project.

---

## 1. Mandatory Folder Structure

Use exactly these folders:

```text
/backend
/ui-frontend
```

- `/backend` must contain the complete Express.js backend.
- `/ui-frontend` must contain the complete Next.js frontend.
- Do not create folders named `frontend`, `client`, `server`, or `api` as root-level app folders.

---

## 2. Project Goal

Build a ticket booking platform for movies/events where:

- Organisers/Admins can create and manage events.
- Customers can register, log in, browse events, select seats from a live seat map, hold seats temporarily, book tickets, cancel bookings, and join a waitlist.
- The system prevents double booking of the same seat.
- Held seats automatically expire after a configurable TTL.
- Cancelled/expired seats are offered to waitlisted users using auto-assignment and a time-limited offer flow.
- Confirmed bookings generate QR code tickets and send an email to the customer.
- Organisers can view booking summary and revenue per event.

---

## 3. Tech Stack

Use this stack.

### Backend

Use **Node.js + Express.js**, not Java.

Required backend stack:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt
- dotenv
- cors
- helmet
- express-validator or zod
- nodemailer
- qrcode package
- node-cron
- morgan
- swagger-jsdoc + swagger-ui-express
- Jest + Supertest for basic tests

### Frontend

Use **Next.js**, not React Vite.

Required frontend stack:

- Next.js
- React
- JavaScript
- App Router or Pages Router, but keep structure clean and consistent
- Axios or fetch wrapper
- Tailwind CSS or normal CSS modules
- Responsive UI
- JWT stored in localStorage or secure cookie
- Protected frontend routes by role

### Database

Use MongoDB with Mongoose schemas.

---

## 4. User Roles

Implement role-based authentication and authorization.

### Roles

1. `CUSTOMER`
2. `ORGANISER`
3. `ADMIN`

### Access Rules

- Public users can view event listings and event details.
- Customers can book seats, cancel bookings, join waitlist, and view booking history.
- Organisers can create and manage their own events and view reports.
- Admin can manage users, events, and seat categories.

---

## 5. Functional Requirements

## 5.1 Authentication and Authorization

Implement:

- User registration
- Login
- JWT token generation
- Password hashing using bcrypt
- Role-based middleware
- Current logged-in user API
- Logout on frontend by removing token
- Protected frontend routes

### User Registration Fields

- Full name
- Email
- Password
- Role: Customer or Organiser

Admin can be seeded initially.

### APIs

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

---

## 5.2 Event Management

Organisers/Admins can create and manage movie/event listings.

### Event Fields

- Event ID
- Title
- Description
- Venue
- Event date
- Event time
- Poster/image URL
- Status: UPCOMING, ACTIVE, SOLD_OUT, COMPLETED, CANCELLED
- Created by organiser
- Created at
- Updated at

### Event Features

- Create event
- Update event
- Delete/cancel event
- Browse all upcoming events
- Search events by title, venue, date
- Filter events by status
- View event details
- Organiser can view only their own events
- Admin can view all events

### APIs

```http
POST /api/events
PUT /api/events/:eventId
DELETE /api/events/:eventId
GET /api/events
GET /api/events/:eventId
GET /api/organiser/events
```

---

## 5.3 Seat Category Management

Admin/Organiser can manage seat categories per event.

### Seat Category Fields

- Category ID
- Event ID
- Name: Premium, Gold, Silver, Standard, etc.
- Price
- Total seats
- Available seats

### APIs

```http
POST /api/events/:eventId/categories
PUT /api/categories/:categoryId
DELETE /api/categories/:categoryId
GET /api/events/:eventId/categories
```

---

## 5.4 Seat Map

Create a visual seat map for each event.

### Seat Fields

- Seat ID
- Event ID
- Seat category
- Row label
- Seat number
- Display label, example: A1, A2, B1
- Status:
  - AVAILABLE
  - HELD
  - BOOKED
  - BLOCKED
- Hold expiry time
- Held by user ID, if any
- Booking ID, if booked

### Seat Map Rules

- Seat map must be stored per event/show.
- Seat map must render on frontend as a visual grid.
- Seat color/status should clearly show:
  - Available
  - Held
  - Booked
  - Selected by current user
- Held and booked seats must not be selectable by other users.
- Expired held seats should automatically become available again.
- Seat status updates must be visible after refresh.

### APIs

```http
POST /api/events/:eventId/seats/generate
GET /api/events/:eventId/seats
```

---

## 5.5 Seat Hold with TTL

Customers can temporarily hold selected seats before booking.

### Rules

- Customer selects one or more available seats.
- System places a hold on those seats for a configurable TTL, default 10 minutes.
- Held seats are unavailable to other customers.
- If customer completes booking before TTL, seats become BOOKED.
- If customer abandons checkout or TTL expires, seats become AVAILABLE again.
- Implement auto-release using node-cron.
- Prevent race conditions using MongoDB transaction/session where possible.
- Also validate inside the transaction that all requested seats are still AVAILABLE.

### APIs

```http
POST /api/seats/hold
DELETE /api/seats/hold/:holdId
GET /api/seats/hold/:holdId
```

### Request Example

```json
{
  "eventId": "eventMongoId",
  "seatIds": ["seatMongoId1", "seatMongoId2"]
}
```

### Response Example

```json
{
  "holdId": "holdMongoId",
  "eventId": "eventMongoId",
  "seatIds": ["seatMongoId1", "seatMongoId2"],
  "expiresAt": "2026-06-29T22:30:00.000Z"
}
```

---

## 5.6 Booking Flow

Customers can confirm booking from a valid active hold.

### Rules

- Booking can be created only from a valid non-expired hold.
- Payment can be mocked; do not integrate real payment gateway.
- On successful booking:
  - Hold becomes confirmed.
  - Seats become BOOKED.
  - Booking reference is generated.
  - QR code is generated.
  - Email is sent with booking details and QR code.
- Prevent double booking of same seat.

### Booking Fields

- Booking ID
- Booking reference
- Customer
- Event
- Seats
- Total amount
- Status:
  - CONFIRMED
  - CANCELLED
  - EXPIRED
- QR code path or base64
- Created at
- Cancelled at

### APIs

```http
POST /api/bookings
GET /api/bookings/my
GET /api/bookings/:bookingId
DELETE /api/bookings/:bookingId/cancel
```

### Request Example

```json
{
  "holdId": "holdMongoId"
}
```

---

## 5.7 Cancellation Flow

Customers can cancel their booking.

### Rules

- Customer can cancel their own confirmed booking.
- Admin/Organiser can cancel booking if required.
- On cancellation:
  - Booking status becomes CANCELLED.
  - Seats become AVAILABLE or offered to waitlist users.
  - Waitlist processing starts automatically.
  - Customer receives cancellation confirmation email.

---

## 5.8 Waitlist Management

When an event or category is sold out, customer can join waitlist.

### Rules

- Customer can join waitlist for a specific event and seat category.
- Waitlist should be ordered by joining time.
- When seat becomes available due to cancellation or hold expiry:
  - First eligible waitlisted customer receives an offer.
  - Seat is auto-held for that customer for a limited time.
  - Customer gets email notification with time-limited message/link.
  - If customer does not complete booking within time limit, offer expires and next waitlisted customer gets the offer.
- Customer can view and leave waitlist.

### Waitlist Fields

- Waitlist ID
- Event
- Seat category
- Customer
- Status:
  - WAITING
  - OFFERED
  - BOOKED
  - EXPIRED
  - CANCELLED
- Offered hold ID
- Offer expiry time
- Created at
- Updated at

### APIs

```http
POST /api/waitlist
GET /api/waitlist/my
DELETE /api/waitlist/:waitlistId
POST /api/waitlist/:waitlistId/accept
```

---

## 5.9 QR Code Ticket

Generate a QR code after successful booking.

### QR Code Data

Include:

- Booking reference
- Event title
- Customer email
- Seat labels
- Event date and time

### Requirements

- Store QR code as base64 or image file path.
- Show QR code in frontend booking details page.
- Attach or include QR code in booking confirmation email.

---

## 5.10 Email Notifications

Implement email delivery using nodemailer.

For development:

- Use Ethereal, Mailtrap, Gmail SMTP, or mock email mode.
- Add `.env.example`.
- Do not commit real secrets.

### Emails Required

- Booking confirmation email with QR code
- Booking cancellation email
- Waitlist offer email
- Waitlist offer expired email, optional

If actual email sending is not configured, create a mock email service that logs email content clearly.

---

## 5.11 Reports

Organiser/Admin can view:

- Total bookings per event
- Total revenue per event
- Booked seats count
- Cancelled bookings count
- Available seats count
- Waitlist count

### APIs

```http
GET /api/reports/events/:eventId
GET /api/reports/organiser
GET /api/reports/admin
```

---

## 6. Non-Functional Requirements

Implement:

- Clean MVC/layered architecture
- Mongoose models
- DTO-like request/response mapping where useful
- Validation middleware
- Global error handling
- Standard API response format
- Proper HTTP status codes
- MongoDB indexes and constraints
- Secure password storage
- Proper CORS configuration
- Swagger documentation
- README with setup instructions
- `.env.example`
- Comments only where necessary

---

## 7. Backend Architecture

Create backend structure exactly under `/backend`.

```text
/backend
 ├── package.json
 ├── .env.example
 ├── src
 │   ├── app.js
 │   ├── server.js
 │   ├── config
 │   │   ├── db.js
 │   │   ├── env.js
 │   │   ├── cors.js
 │   │   └── swagger.js
 │   ├── middleware
 │   │   ├── authMiddleware.js
 │   │   ├── roleMiddleware.js
 │   │   ├── errorMiddleware.js
 │   │   └── validate.js
 │   ├── modules
 │   │   ├── auth
 │   │   │   ├── auth.controller.js
 │   │   │   ├── auth.routes.js
 │   │   │   ├── auth.service.js
 │   │   │   └── auth.validation.js
 │   │   ├── users
 │   │   │   ├── user.model.js
 │   │   │   ├── user.service.js
 │   │   │   └── user.routes.js
 │   │   ├── events
 │   │   │   ├── event.model.js
 │   │   │   ├── event.controller.js
 │   │   │   ├── event.routes.js
 │   │   │   ├── event.service.js
 │   │   │   └── event.validation.js
 │   │   ├── seats
 │   │   │   ├── seat.model.js
 │   │   │   ├── seatCategory.model.js
 │   │   │   ├── seat.controller.js
 │   │   │   ├── seat.routes.js
 │   │   │   └── seat.service.js
 │   │   ├── holds
 │   │   │   ├── seatHold.model.js
 │   │   │   ├── hold.controller.js
 │   │   │   ├── hold.routes.js
 │   │   │   └── hold.service.js
 │   │   ├── bookings
 │   │   │   ├── booking.model.js
 │   │   │   ├── booking.controller.js
 │   │   │   ├── booking.routes.js
 │   │   │   └── booking.service.js
 │   │   ├── waitlist
 │   │   │   ├── waitlist.model.js
 │   │   │   ├── waitlist.controller.js
 │   │   │   ├── waitlist.routes.js
 │   │   │   └── waitlist.service.js
 │   │   ├── reports
 │   │   │   ├── report.controller.js
 │   │   │   ├── report.routes.js
 │   │   │   └── report.service.js
 │   │   └── notifications
 │   │       ├── email.service.js
 │   │       └── qr.service.js
 │   ├── routes
 │   │   └── index.js
 │   ├── jobs
 │   │   ├── holdExpiry.job.js
 │   │   └── waitlistOffer.job.js
 │   ├── utils
 │   │   ├── apiResponse.js
 │   │   ├── asyncHandler.js
 │   │   ├── appError.js
 │   │   └── token.js
 │   └── seed
 │       └── seedData.js
 └── tests
     ├── auth.test.js
     ├── hold.test.js
     └── booking.test.js
```

---

## 8. MongoDB Schema Design

Create Mongoose schemas with relationships using ObjectId references.

### Main Collections

- users
- events
- seatcategories
- seats
- seatholds
- bookings
- waitlistentries

### Important Indexes / Constraints

Implement indexes where possible:

- User email unique.
- Seat label unique per event.
- Booking reference unique.
- Prevent duplicate active waitlist entry for same user, event, and category using application-level validation and index if possible.
- Prevent duplicate active booking of a seat using transaction checks and seat status.
- Prevent duplicate active hold of a seat using transaction checks and seat status.

---

## 9. Concurrency Protection

This is very important.

Implement MongoDB transaction/session logic for:

- Holding seats
- Confirming booking
- Cancelling booking
- Releasing expired holds
- Processing waitlist offers

### Required Behavior

- Two customers must not hold or book the same seat simultaneously.
- If two requests come at the same time, only one succeeds.
- The other request receives meaningful error message: `Seat already held or booked`.

### Suggested Hold Logic

Inside transaction:

1. Load all requested seats by IDs and event ID.
2. Check all seats exist.
3. Check every seat status is `AVAILABLE`.
4. Update all requested seats to:
   - `status = HELD`
   - `heldBy = currentUserId`
   - `holdExpiresAt = now + ttl`
5. Create `SeatHold` document.
6. Commit transaction.

---

## 10. Scheduler / Cron Requirements

Implement scheduled jobs using `node-cron`.

### Seat Hold Expiry Job

Runs every 1 minute.

It should:

- Find expired active holds.
- Release seats from HELD to AVAILABLE.
- Mark hold as EXPIRED.
- Trigger waitlist processing if applicable.

### Waitlist Offer Job

Runs every 1 minute.

It should:

- Find expired waitlist offers.
- Mark them EXPIRED.
- Release offered seats/hold.
- Offer available seats to next waiting customer.

---

## 11. Frontend Architecture

Create frontend structure exactly under `/ui-frontend`.

Use Next.js.

```text
/ui-frontend
 ├── package.json
 ├── .env.example
 ├── next.config.js
 ├── src
 │   ├── app
 │   │   ├── layout.jsx
 │   │   ├── page.jsx
 │   │   ├── login
 │   │   │   └── page.jsx
 │   │   ├── register
 │   │   │   └── page.jsx
 │   │   ├── events
 │   │   │   ├── page.jsx
 │   │   │   └── [eventId]
 │   │   │       ├── page.jsx
 │   │   │       └── seats
 │   │   │           └── page.jsx
 │   │   ├── checkout
 │   │   │   └── page.jsx
 │   │   ├── bookings
 │   │   │   ├── page.jsx
 │   │   │   └── [bookingId]
 │   │   │       └── page.jsx
 │   │   ├── waitlist
 │   │   │   └── page.jsx
 │   │   ├── organiser
 │   │   │   ├── page.jsx
 │   │   │   ├── events
 │   │   │   │   ├── page.jsx
 │   │   │   │   └── new
 │   │   │   │       └── page.jsx
 │   │   │   └── reports
 │   │   │       └── [eventId]
 │   │   │           └── page.jsx
 │   │   └── admin
 │   │       └── page.jsx
 │   ├── components
 │   │   ├── Navbar.jsx
 │   │   ├── EventCard.jsx
 │   │   ├── SeatGrid.jsx
 │   │   ├── CountdownTimer.jsx
 │   │   ├── ProtectedRoute.jsx
 │   │   ├── Loading.jsx
 │   │   └── ErrorMessage.jsx
 │   ├── context
 │   │   └── AuthContext.jsx
 │   ├── lib
 │   │   ├── api.js
 │   │   ├── auth.js
 │   │   └── constants.js
 │   └── styles
 │       └── globals.css
```

---

## 12. Frontend Pages

Create these pages:

1. Login
2. Register
3. Home / Event List
4. Event Details
5. Seat Selection Page
6. Checkout Page
7. My Bookings
8. Booking Details with QR Code
9. My Waitlist
10. Organiser Dashboard
11. Create/Edit Event
12. Event Report Page
13. Admin Dashboard, basic

### Frontend Features

- JWT token stored in localStorage or secure cookie.
- API wrapper adds `Authorization: Bearer <token>`.
- Protected routes by role.
- Seat map visual grid.
- Selected seats summary.
- Hold countdown timer.
- Confirm booking button.
- Cancel booking button.
- Join waitlist button.
- Booking history.
- QR code display.
- Responsive layout.
- Clear success/error messages.

---

## 13. UI Guidelines

Use simple clean UI.

### Seat Colors

- Available: green
- Held: yellow/orange
- Booked: gray/red
- Selected: blue

### UX Rules

- User cannot click booked/held seats.
- Show selected seat labels and total price.
- Show countdown when hold is active.
- Disable confirm button when hold expires.
- Show clear validation and API errors.

---

## 14. API Response Format

Use a consistent response wrapper.

### Success

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Seat already held or booked",
  "errors": []
}
```

---

## 15. Sample Data Seeder

Add sample data command:

```bash
npm run seed
```

Seed:

### Admin User

- Email: `admin@example.com`
- Password: `admin123`
- Role: `ADMIN`

### Organiser User

- Email: `organiser@example.com`
- Password: `organiser123`
- Role: `ORGANISER`

### Customer User

- Email: `customer@example.com`
- Password: `customer123`
- Role: `CUSTOMER`

Also seed:

- At least 3 sample events
- Seat categories for each event
- Generated seat map for each event

Use bcrypt for seeded passwords.

---

## 16. Environment Example

Create safe example config only.

### `/backend/.env.example`

```env
PORT=8080
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/ticket_booking_db

JWT_SECRET=change-this-secret-key
JWT_EXPIRES_IN=1d

SEAT_HOLD_TTL_MINUTES=10
WAITLIST_OFFER_TTL_MINUTES=10

EMAIL_MODE=mock
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@ticketbooking.local

FRONTEND_URL=http://localhost:3000
```

### `/ui-frontend/.env.example`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Do not include real passwords or secrets.

---

## 17. README Requirements

Create a complete root `README.md` with:

- Project overview
- Features
- Tech stack
- Backend setup
- Frontend setup
- Database setup
- Environment variables
- Default test users
- API documentation URL
- Important business flows:
  - Register/login
  - Event creation
  - Seat hold
  - Booking
  - Cancellation
  - Waitlist offer
  - QR generation
- Known limitations
- How to run backend and frontend

---

## 18. Scripts

### Backend scripts

In `/backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seedData.js",
    "test": "jest"
  }
}
```

### Frontend scripts

In `/ui-frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 19. Testing Requirements

Add basic tests where possible.

### Backend Tests

- Auth service login/register
- Seat hold success
- Seat hold failure when seat already held
- Booking success from valid hold
- Booking failure from expired hold
- Waitlist creation

### Frontend Manual Testing

Ensure:

- Login works.
- Role-based pages work.
- Event list loads.
- Seat selection works.
- Hold countdown works.
- Booking confirmation works.
- QR code appears.
- Cancel booking works.
- Waitlist works.

---

## 20. Deliverables to Generate

Create all required files for a runnable application:

```text
/backend
/ui-frontend
README.md
.env.example
```

Do not create unnecessary files.

Do not include:

- `node_modules`
- `.env`
- `.idea`
- `.vscode`
- `.next`
- `dist`
- `build`
- `coverage`
- temporary/editor files

---

## 21. Development Instructions for antigravity

Follow these steps:

1. Inspect the existing folder structure.
2. Create `/backend` and `/ui-frontend` if they do not exist.
3. Build the Express.js backend first.
4. Implement MongoDB connection, Mongoose schemas, controllers, services, routes, middleware, validation, and global error handling.
5. Implement JWT security and role-based authorization.
6. Implement event management.
7. Implement seat categories and seat generation.
8. Implement seat hold with TTL.
9. Implement booking confirmation and cancellation.
10. Implement waitlist offer flow.
11. Implement QR generation.
12. Implement mock/nodemailer email service.
13. Implement organiser/admin reports.
14. Implement cron jobs.
15. Add Swagger API documentation.
16. Build the Next.js frontend inside `/ui-frontend`.
17. Connect frontend to backend APIs.
18. Add root README and example environment files.
19. Ensure the app runs without errors.
20. Do not do antigravity submission tasks.

---

## 22. Acceptance Criteria

The app is complete when:

- `/backend` contains a working Express.js API.
- `/ui-frontend` contains a working Next.js frontend.
- User can register and login.
- Customer can browse events.
- Customer can select available seats.
- Seats can be held with TTL.
- Held seats are unavailable to others.
- Expired holds are released automatically.
- Customer can confirm booking.
- Same seat cannot be booked twice.
- Customer receives/generated QR ticket.
- Customer can cancel booking.
- Cancelled seats are released or offered to waitlist.
- Customer can join waitlist.
- Waitlist customer receives time-limited offer.
- Organiser can create events and view reports.
- Admin can manage/view system data.
- Frontend and backend run successfully.
- README contains setup and usage instructions.

---

## 23. Final Note

Prioritize correctness, clean code, and working functionality over unnecessary styling.

Build the full application end-to-end using:

```text
/backend       => Express.js backend
/ui-frontend   => Next.js frontend
```

Do not use Java, Spring Boot, or Vite.

Do not perform antigravity repository creation, branch setup, push, public link creation, or submission tasks.