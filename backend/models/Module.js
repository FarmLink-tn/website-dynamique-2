const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Irrigation intelligente', 'Contrôle des pompes', 'Surveillance environnementale']
  },
  status: {
    type: String,
    enum: ['Actif', 'Arrêté', 'Maintenance'],
    default: 'Arrêté'
  },
  lastData: {
    temperature: Number,
    humidity: Number,
    soilMoisture: Number,
    waterLevel: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Module', ModuleSchema);
