const express = require('express');
const User = require('../models/User');
const Module = require('../models/Module');
const router = express.Router();

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Récupérer tous les modules
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find().populate('user', 'nom prenom email');
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des modules" });
  }
});

module.exports = router;
