const mongoose = require("mongoose");
const fournisseurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    tel: { type: String, required: true }
  });
  
module.exports = mongoose.model('Fournisseur', fournisseurSchema);