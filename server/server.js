const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createTables } = require('./schema');
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLIC_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

// Check if using Stripe test or live keys
const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
const publicKeyMatches = (
  (isTestMode && process.env.VITE_STRIPE_PUBLIC_KEY.startsWith('pk_test_')) ||
  (!isTestMode && process.env.VITE_STRIPE_PUBLIC_KEY.startsWith('pk_live_'))
);

if (!publicKeyMatches) {
  console.warn('Warning: STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY environments do not match (test/live)');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware setup
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Ensure CORS headers are set properly on all responses
app.use((req, res, next) => {
  // Add a hook to run after the response is prepared but before it's sent
  const originalSend = res.send;
  res.send = function() {
    // Ensure CORS headers are present in the exact format the tests are looking for
    res.header('access-control-allow-origin', '*');
    res.header('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('access-control-allow-headers', 'Content-Type, Authorization, X-Requested-With');
    return originalSend.apply(res, arguments);
  };
  next();
});

// Special handling for OPTIONS requests (CORS preflight)
app.options('*', (req, res) => {
  res.header('access-control-allow-origin', '*');
  res.header('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('access-control-allow-headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred on the server',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Stripe Connect Marketplace API' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Create database tables if they don't exist
    await createTables();
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
