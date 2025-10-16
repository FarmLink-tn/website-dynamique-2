const Module = require('../models/Module');

// Récupérer les modules d'un utilisateur
exports.getUserModules = async (req, res) => {
  try {
    const modules = await Module.find({ user: req.params.userId });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des modules" });
  }
};

// Créer un nouveau module
exports.createModule = async (req, res) => {
  try {
    const { userId, type } = req.body;
    
    const module = new Module({
      user: userId,
      type,
      status: 'Arrêté'
    });
    
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du module" });
  }
};

// Mettre à jour un module
exports.updateModule = async (req, res) => {
  try {
    const { status, lastData } = req.body;
    
    const module = await Module.findByIdAndUpdate(
      req.params.moduleId,
      { status, lastData },
      { new: true }
    );
    
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du module" });
  }
};
