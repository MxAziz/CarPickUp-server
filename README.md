# CarPickUp - Server

## Purpose
This server-side application is the backend for a car rental service, managing car data, user bookings, and real-time updates. It connects with the client-side app and ensures a smooth user experience by handling database operations and API requests.

## Live URL
Currently not deployed.

## Key Features
- RESTful API for car and booking management.
- Dynamic updates for booking counts using MongoDB's `$inc` operator.
- Separate endpoints for creating, updating, and deleting bookings.
- Modular structure for scalability and maintainability.
- MongoDB for database management.

## Endpoints
1. **GET /cars**: Fetch all cars.
2. **POST /bookings**: Create a new booking and update car booking counts.
3. **DELETE /bookings/:id**: Delete a booking.

## Technologies Used
- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for API development.
- **MongoDB**: NoSQL database for storing car and booking data.
- **dotenv**: For environment variable management.
- **cors**: To handle Cross-Origin Resource Sharing.
- **nodemon**: For automatic server restarting during development.

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd server
