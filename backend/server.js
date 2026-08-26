require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Middleware to check database connection status with initial wait window
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && req.path.startsWith('/api')) {
    // Wait up to 3 seconds for DB connection to establish if server just started
    let retries = 15;
    while (mongoose.connection.readyState !== 1 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      retries--;
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database connection is initializing or unavailable. Please try again in a moment.' 
      });
    }
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/supplier-bills', require('./routes/supplierBillRoutes'));
app.use('/api/supplier-payments', require('./routes/supplierPaymentRoutes'));
app.use('/api/supplier-dashboard', require('./routes/supplierDashboardRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/purchase-list', require('./routes/purchaseListRoutes'));

// 404 handler for API routes (always return JSON)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

// Serve static frontend files from dist directory if available
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for React Router SPA routes
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not Found' });
    }
  });
});

async function seedDefaultUser() {
  try {
    const User = require('./models/User');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    let user = await User.findOne({ username: 'username' });
    if (!user) {
      user = new User({ username: 'username', password: hashedPassword });
      await user.save();
      console.log('Seeded admin user: username / password');
    } else {
      user.password = hashedPassword;
      await user.save();
    }
  } catch (err) {
    console.error('Error seeding default user:', err.message);
  }
}

async function connectDB() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('Connected to MongoDB Atlas successfully');
    await seedDefaultUser();
  } catch (err) {
    console.warn('MongoDB Atlas connection failed (Ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas):', err.message);
    console.log('Starting in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to In-Memory MongoDB Fallback at:', uri);
      await seedDefaultUser();
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB fallback:', memErr);
    }
  }
}

connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
