const Message = require('../models/Message');

// Envoyer un message au conseiller IA
exports.sendMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;
    
    // Simulation d'une réponse IA
    const responses = [
      "Pour ce problème, je recommande de vérifier l'humidité du sol et d'ajuster l'irrigation.",
      "Cette maladie peut être traitée avec un fongicide biologique. Surveillez l'évolution.",
      "Vos plants montrent des signes de stress hydrique. Augmentez la fréquence d'arrosage.",
      "Ce type de ravageur peut être contrôlé avec des prédateurs naturels."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    const message = new Message({
      user: userId,
      text,
      response
    });
    
    await message.save();
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
};

// Récupérer l'historique des messages
exports.getHistory = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
  }
};
