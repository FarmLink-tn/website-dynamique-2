const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connecté');
}).catch(err => {
  console.error('❌ Erreur MongoDB:', err);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API FarmLink fonctionnelle !' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur FarmLink démarré sur port ${PORT}`);
});
