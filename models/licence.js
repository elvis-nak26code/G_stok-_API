const mongoose = require('mongoose');

const licenceSchema = new mongoose.Schema({
  code: [{ type: String }], // 🔥 tableau de chaînes de caractères
});

module.exports = mongoose.model('Licence', licenceSchema);