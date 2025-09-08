const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  nomCeancier: { type: String, required: true },
  numero: { type: String, required: true },
  produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }],
  montantTotal: { type: Number, required: true },
});

module.exports = mongoose.model('Credit', creditSchema);