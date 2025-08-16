const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tel: { type: String, required: true },
  date: { type: Date, default: Date.now },
  produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }]
});

module.exports = mongoose.model('User', userSchema);