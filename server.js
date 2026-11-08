import express from 'express';
import cors from 'cors';
import { destinationsData } from './data/destinations.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Southeast Asia Travels API',
    version: '1.0.0',
    endpoints: {
      destinations: '/destination-list',
      detail: '/destination-detail/:id'
    }
  });
});

// GET /destination-list - Get all destinations
app.get('/destination-list', (req, res) => {
  try {
    res.json({
      success: true,
      count: destinationsData.length,
      data: destinationsData
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching destinations',
        statusCode: 500
      }
    });
  }
});

// GET /destination-detail/:id - Get destination by ID
app.get('/destination-detail/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (expecting dest-XXX format)
    const idPattern = /^dest-\d{3}$/;
    if (!idPattern.test(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID_FORMAT',
          message: `Invalid destination ID format: "${id}". Expected format: dest-XXX (e.g., dest-001)`,
          statusCode: 400
        }
      });
    }

    // Find destination
    const destination = destinationsData.find(dest => dest.id === id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DESTINATION_NOT_FOUND',
          message: `Destination with ID "${id}" not found`,
          statusCode: 404
        }
      });
    }

    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error fetching destination detail:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching destination details',
        statusCode: 500
      }
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
      statusCode: 404
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred',
      statusCode: 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Southeast Asia Travels API Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`📊 Total destinations: ${destinationsData.length}`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log(`  GET  /destination-list`);
  console.log(`  GET  /destination-detail/:id`);
  console.log('');
});
