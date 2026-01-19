const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// MySQL Database connection (NOT MongoDB!)
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const hotelRoutes = require('./routes/hotels');
const restaurantRoutes = require('./routes/restaurants');

const uploadRoutes = require('./routes/upload');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.use('/api/upload', uploadRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AboutSL Backend is running!',
    database: 'MySQL',
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AboutSL API',
    version: '1.0.0',
    database: 'MySQL with phpMyAdmin',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      destinations: '/api/destinations',
      hotels: '/api/hotels',
      restaurants: '/api/restaurants',

      upload: '/api/upload',
    },
  });
});

// 404 Error Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Connect to MySQL Database and Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MySQL (NOT MongoDB!)
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💾 Database: MySQL (phpMyAdmin)`);
      console.log(`✅ Ready to accept requests!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
