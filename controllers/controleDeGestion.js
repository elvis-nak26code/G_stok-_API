
//ajouter un produit
exports.addproduct=async (req, res) => {
    const Produit = require('../models/produit');
    try {
        const produit = new Produit(req.body);
        await produit.save();
        res.status(201).json(produit);
        console.log("Produit ajouté avec succès :", produit);
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Erreur lors de l'ajout du produit :", error);
    }
}

//ajouter un mouvement de stock
exports.addmouvementStock = async (req, res) => {
    const MouvementStock = require('../models/mouvementStock');
    try {
        const mouvementStock = new MouvementStock(req.body);
        await mouvementStock.save();
        res.status(201).json(mouvementStock);
        console.log("Mouvement de stock ajouté avec succès :", mouvementStock);
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Erreur lors de l'ajout du mouvement de stock :", error);
    }
}

//ajouter un fournisseur
exports.addFournisseur = async (req, res) => {
    const Fournisseur = require('../models/fournisseur');
    try {
        const fournisseur = new Fournisseur(req.body);
        await fournisseur.save();
        res.status(201).json(fournisseur);
        console.log("Fournisseur ajouté avec succès :", fournisseur);
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Erreur lors de l'ajout du fournisseur :", error);
    }
}

//ajouter un utilisateur avc mote de pass crypté
exports.addUtilisateur = async (req, res) => {
    const Utilisateur = require('../models/user');
    const bcrypt = require('bcrypt');
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const utilisateur = new Utilisateur({
            ...req.body,
            password: hashedPassword
        });
        await utilisateur.save();
        res.status(201).json(utilisateur);
        console.log("Utilisateur ajouté avec succès :", utilisateur);
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Erreur lors de l'ajout de l'utilisateur :", error);
    }
}
