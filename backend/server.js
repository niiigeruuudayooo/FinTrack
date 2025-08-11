require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budget', require('./routes/budget'));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Error handler
app.use(require('./middleware/errorHandler'));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
