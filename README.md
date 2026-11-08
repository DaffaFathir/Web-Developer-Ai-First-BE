# Southeast Asia Travels Backend API

Backend API service for Southeast Asia Travel Destinations application.

## Features

- RESTful API with Express.js
- CORS enabled for frontend integration
- Comprehensive error handling
- ID format validation
- Dummy data (no database required)

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Server will run on: `http://localhost:3000`

## API Endpoints

### 1. Get All Destinations
**GET** `/destination-list`

Returns all available travel destinations.

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [...]
}
```

### 2. Get Destination Detail
**GET** `/destination-detail/:id`

Returns detailed information for a specific destination.

**Parameters:**
- `id` (path parameter) - Destination ID in format `dest-XXX` (e.g., `dest-001`)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "dest-001",
    "name": "Bali Paradise Beach",
    ...
  }
}
```

**Error Responses:**

**400 - Invalid ID Format:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID_FORMAT",
    "message": "Invalid destination ID format: \"abc\". Expected format: dest-XXX (e.g., dest-001)",
    "statusCode": 400
  }
}
```

**404 - Destination Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "DESTINATION_NOT_FOUND",
    "message": "Destination with ID \"dest-999\" not found",
    "statusCode": 404
  }
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while fetching destination details",
    "statusCode": 500
  }
}
```

## Testing Examples

```bash
# Get all destinations
curl http://localhost:3000/destination-list

# Get specific destination
curl http://localhost:3000/destination-detail/dest-001

# Test invalid ID format
curl http://localhost:3000/destination-detail/invalid-id

# Test non-existent ID
curl http://localhost:3000/destination-detail/dest-999
```

## Project Structure

```
BackEnd/
├── server.js              # Main server file
├── data/
│   └── destinations.js    # Dummy data
├── package.json
└── README.md
```
