const mongoose = require("mongoose");
const mouvementStockSchema = new mongoose.Schema({
    type: { type: String, enum: ['ENTREE', 'SORTIE'], required: true },
    date: { type: Date, default: Date.now },
    quantite: { type: Number, required: true },
    prix: { type: Number, required: true },
    total: { type: Number, required: true },
    client: { type: String }, // utilisé seulement si SORTIE
    fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur' }, // utilisé seulement si ENTREE
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true }
  });
  
  module.exports = mongoose.model('MouvementStock', mouvementStockSchema);
  