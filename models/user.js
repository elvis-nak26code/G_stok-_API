const mongoose = require('mongoose');
const fournisseur = require('./fournisseur');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  numero: { type: String, required: true },
  entreprise: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produit' }],
  credits:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Credit' }],
  fournisseurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur' }],
  licence:{ type: String },
  chartDay:[{
    month: { type: String, required: true, },
    desktop: {type: Number,required: true,  default: 0, },
    mobile: { type: Number,required: true,  default: 0, }
  }]
});

module.exports = mongoose.model('User', userSchema);