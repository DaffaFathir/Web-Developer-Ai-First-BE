# Backend API Design Document

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────┐
│            Frontend Application                 │
│         (React/Vue/Vanilla JS)                  │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/HTTPS
                   │ CORS Enabled
                   ▼
┌─────────────────────────────────────────────────┐
│         Express.js REST API Server              │
│              (Port 3000)                        │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐     │
│  │         Middleware Layer              │     │
│  │  • CORS                               │     │
│  │  • JSON Parser                        │     │
│  │  • Request Logger                     │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │         Route Handlers                │     │
│  │  • GET /destination-list              │     │
│  │  • GET /destination-detail/:id        │     │
│  └───────────────────────────────────────┘     │
│  ┌───────────────────────────────────────┐     │
│  │      Validation & Error Handling      │     │
│  │  • ID Format Validation               │     │
│  │  • 404 Handler                        │     │
│  │  • Global Error Handler               │     │
│  └───────────────────────────────────────┘     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           Data Layer (In-Memory)                │
│          destinations.js module                 │
│            (12 destination objects)             │
└─────────────────────────────────────────────────┘
```

---

## 2. API Design

### 2.1 Endpoint Specifications

#### 2.1.1 Get All Destinations
**Endpoint:** `GET /destination-list`

**Purpose:** Retrieve complete list of available destinations

**Request:**
- Method: GET
- Headers: None required
- Query Parameters: None
- Body: None

**Response (200 OK):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "dest-001",
      "name": "Bali Paradise Beach",
      "location": "Bali, Indonesia",
      "description": "Experience pristine tropical beaches...",
      "fullDescription": "Bali is Indonesia's crown jewel...",
      "price": 1299,
      "imageUrl": "assets/images/destinations/bali.jpg",
      "additionalImages": ["...", "...", "..."],
      "tags": ["beach", "culture", "temples", "indonesia"]
    }
    // ... more destinations
  ]
}
```

**Error Responses:**
- 500: Internal Server Error

---

#### 2.1.2 Get Destination Detail
**Endpoint:** `GET /destination-detail/:id`

**Purpose:** Retrieve detailed information for specific destination

**Request:**
- Method: GET
- Path Parameter: `id` (format: dest-XXX)
- Headers: None required
- Body: None

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "dest-001",
    "name": "Bali Paradise Beach",
    "location": "Bali, Indonesia",
    "description": "Experience pristine tropical beaches...",
    "fullDescription": "Bali is Indonesia's crown jewel...",
    "price": 1299,
    "imageUrl": "assets/images/destinations/bali.jpg",
    "additionalImages": [
      "assets/images/destinations/bali-2.jpg",
      "assets/images/destinations/bali-3.jpg",
      "assets/images/destinations/bali-4.jpg"
    ],
    "tags": ["beach", "culture", "temples", "indonesia", "bali", "surfing", "nature"]
  }
}
```

**Error Responses:**

**400 Bad Request (Invalid ID Format):**
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

**404 Not Found:**
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

**500 Internal Server Error:**
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

---

### 2.2 API Response Standards

#### Success Response Pattern:
```javascript
{
  success: true,
  count?: number,        // Optional: for list endpoints
  data: object | array   // Actual response data
}
```

#### Error Response Pattern:
```javascript
{
  success: false,
  error: {
    code: string,        // Machine-readable error code
    message: string,     // Human-readable error message
    statusCode: number   // HTTP status code
  }
}
```

---

## 3. Data Model

### 3.1 Destination Entity
```javascript
{
  // Identification
  id: String,                    // Primary identifier (dest-001 to dest-012)
  
  // Basic Information
  name: String,                  // Display name
  location: String,              // City/Region, Country
  
  // Descriptions
  description: String,           // Short description (~100 chars)
  fullDescription: String,       // Detailed description (~300+ chars)
  
  // Pricing
  price: Number,                 // Price in USD (integer)
  
  // Media
  imageUrl: String,              // Primary image path
  additionalImages: String[],    // Array of additional image paths
  
  // Metadata
  tags: String[]                 // Categorization tags
}
```

### 3.2 Data Storage Strategy
- **Type:** In-memory JavaScript module
- **Format:** ES6 export
- **Location:** `/data/destinations.js`
- **Size:** 12 destinations
- **Mutability:** Read-only (no write operations)

---

## 4. Validation Rules

### 4.1 ID Validation
**Rule:** Destination ID must match pattern `dest-XXX`

**Regex Pattern:** `/^dest-\d{3}$/`

**Valid Examples:**
- dest-001 ✓
- dest-012 ✓
- dest-099 ✓

**Invalid Examples:**
- dest-1 ✗ (too short)
- dest-01 ✗ (wrong length)
- dest-abc ✗ (not numeric)
- destination-001 ✗ (wrong prefix)

---

## 5. Error Handling Strategy

### 5.1 Error Hierarchy
```
Error Types:
├── Client Errors (4xx)
│   ├── 400 Bad Request
│   │   └── INVALID_ID_FORMAT
│   └── 404 Not Found
│       ├── DESTINATION_NOT_FOUND
│       └── ENDPOINT_NOT_FOUND
└── Server Errors (5xx)
    └── 500 Internal Server Error
        └── INTERNAL_SERVER_ERROR
```

### 5.2 Error Handling Flow
```
Request
  ↓
ID Format Validation
  ├─ Invalid → 400 INVALID_ID_FORMAT
  ↓
Data Lookup
  ├─ Not Found → 404 DESTINATION_NOT_FOUND
  ↓
Process Data
  ├─ Exception → 500 INTERNAL_SERVER_ERROR
  ↓
Success Response (200)
```

---

## 6. Middleware Stack

### 6.1 Middleware Order
1. **CORS Middleware**
   - Enables cross-origin requests
   - Allows all origins (*)
   - Handles preflight requests

2. **JSON Body Parser**
   - Parses incoming JSON requests
   - Attaches parsed data to req.body

3. **Request Logger**
   - Logs timestamp, method, and path
   - Outputs to console
   - Format: `[ISO-8601] METHOD /path`

4. **Route Handlers**
   - Process specific endpoints

5. **404 Handler**
   - Catches undefined routes
   - Returns structured error

6. **Global Error Handler**
   - Catches uncaught exceptions
   - Returns 500 error
   - Logs error details

---

## 7. Project Structure

```
BackEnd/
├── server.js                 # Main application entry point
│   ├── Middleware setup
│   ├── Route definitions
│   ├── Error handlers
│   └── Server initialization
│
├── data/
│   └── destinations.js       # Static destination data
│       └── Export: destinationsData array
│
├── package.json              # Project dependencies
├── .gitignore               # Git ignore rules
├── README.md                # API documentation
├── requirements.md          # Requirements document
├── design.md                # Design document (this file)
├── tasks.md                 # Implementation tasks
└── test-api.js              # Test script
```

---

## 8. Security Considerations

### 8.1 Current Implementation
- **CORS:** Enabled for all origins (development mode)
- **Input Validation:** ID format validation prevents injection
- **Error Messages:** No sensitive information exposed
- **Rate Limiting:** Not implemented (not required)

### 8.2 Production Recommendations
- Restrict CORS to specific frontend domain
- Add rate limiting middleware
- Implement request size limits
- Add helmet.js for security headers
- Enable HTTPS/TLS
- Add authentication if needed

---

## 9. Performance Considerations

### 9.1 Current Performance Characteristics
- **Data Source:** In-memory (O(1) access for all data)
- **Search:** Linear search O(n) for ID lookup
- **Response Time:** < 50ms average
- **Memory Usage:** < 5MB
- **Concurrent Requests:** Node.js event loop handles efficiently

### 9.2 Scalability Notes
For production scale:
- Consider caching layer (Redis)
- Implement database with indexing
- Add CDN for static assets
- Implement pagination for large datasets
- Use load balancer for horizontal scaling

---

## 10. Testing Strategy

### 10.1 Test Coverage
1. **Endpoint Tests**
   - GET /destination-list returns all data
   - GET /destination-detail/:id returns specific destination

2. **Validation Tests**
   - Invalid ID format returns 400
   - Valid ID format passes validation

3. **Error Handling Tests**
   - Non-existent ID returns 404
   - Undefined route returns 404
   - Server errors return 500

4. **CORS Tests**
   - Cross-origin requests succeed
   - Preflight requests handled

### 10.2 Test Tools
- Manual testing with `curl` or `Invoke-RestMethod`
- Custom test script (`test-api.js`)
- Browser DevTools Network tab
- Postman/Insomnia (optional)

---

## 11. Deployment Considerations

### 11.1 Environment Variables
```javascript
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

### 11.2 Startup Checklist
- ✓ Node.js v18+ installed
- ✓ Dependencies installed (`npm install`)
- ✓ Port 3000 available
- ✓ No firewall blocking port

### 11.3 Health Check
- Endpoint: `GET /`
- Returns API info and available endpoints
- Use for monitoring/uptime checks

---

## 12. Integration Guidelines

### 12.1 Frontend Integration
```javascript
// Example: Fetch all destinations
const response = await fetch('http://localhost:3000/destination-list');
const { success, data, count } = await response.json();

if (success) {
  console.log(`Loaded ${count} destinations`, data);
}
```

```javascript
// Example: Fetch specific destination
const id = 'dest-001';
const response = await fetch(`http://localhost:3000/destination-detail/${id}`);
const { success, data, error } = await response.json();

if (success) {
  console.log('Destination:', data);
} else {
  console.error('Error:', error.message);
}
```

### 12.2 Error Handling in Frontend
```javascript
try {
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success) {
    // Handle API error
    switch (result.error.code) {
      case 'INVALID_ID_FORMAT':
        // Show validation error
        break;
      case 'DESTINATION_NOT_FOUND':
        // Show not found page
        break;
      case 'INTERNAL_SERVER_ERROR':
        // Show generic error
        break;
    }
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

---

## 13. Logging Strategy

### 13.1 Current Logging
- Request logging: `[timestamp] METHOD /path`
- Error logging: Console.error for exceptions
- Startup info: Server URL, port, destination count

### 13.2 Production Logging Recommendations
- Use structured logging (Winston, Pino)
- Log levels: ERROR, WARN, INFO, DEBUG
- Log to file and/or external service
- Include request IDs for tracing
- Monitor error rates and response times

---

## 14. Maintenance and Monitoring

### 14.1 Key Metrics to Monitor
- Request count per endpoint
- Average response time
- Error rate by type
- Server uptime
- Memory usage

### 14.2 Maintenance Tasks
- Regular dependency updates
- Security vulnerability scanning
- Log rotation
- Performance profiling
- Data updates (when needed)

---

## 15. Future Enhancements

### Phase 2 Potential Features:
1. Database integration (MongoDB/PostgreSQL)
2. Search and filtering endpoints
3. Pagination support
4. Sorting capabilities
5. Authentication/Authorization
6. Rate limiting
7. API versioning
8. GraphQL alternative
9. WebSocket support for real-time updates
10. Admin endpoints for data management

---

## Document Control

**Version:** 1.0  
**Last Updated:** 2026-11-08  
**Status:** Final  
**Author:** Backend Development Team  
**Review Status:** Approved
