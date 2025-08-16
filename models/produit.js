
const mongoose = require("mongoose");
const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  categorie: { type: String, required: true },
  prix: { type: Number, required: true },
  seuilAlerte: { type: Number, required: true },
  quantite: { type: Number, required: true },
  sorties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MouvementStock' }],
  entrees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MouvementStock' }]
});

module.exports = mongoose.model('Produit', produitSchema);