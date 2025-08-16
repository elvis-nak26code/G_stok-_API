const express=require('express')
const router=express.Router()
const controlleDeGestion=require('../controllers/controleDeGestion')

//ajouter un utilisateur
router.post('/utilisateur', controlleDeGestion.addUtilisateur);
//ajouter un produit
router.post('/produit', controlleDeGestion.addproduct);
// ajouter un mouvement de stock
router.post('/mouvementStock', controlleDeGestion.addmouvementStock);
// ajouter un fournisseur
router.post('/fournisseur', controlleDeGestion.addFournisseur);

module.exports=router;