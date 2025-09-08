const express=require('express')
const router=express.Router()
const controlleDeGestion=require('../controllers/controleDeGestion')
const Auth=require('../middleware/auth')

//ajouter un utilisateur
router.post('/utilisateur', controlleDeGestion.addUtilisateur);
//ajouter un produit
router.post('/produit', Auth.authentification ,controlleDeGestion.addproduct);
// ajouter un mouvement de stock
router.post('/mouvementStock', controlleDeGestion.addmouvementStock);
// ajouter un fournisseur
router.post('/fournisseur',Auth.authentification, controlleDeGestion.addFournisseur);


// obtenir liste des produits
router.get('/produits',Auth.authentification, controlleDeGestion.getAllProducts);

// suprimer un produit  
router.delete('/produit/:id', Auth.authentification,controlleDeGestion.deleteProduct);

// mofifier un produit
router.put('/produit/:id', controlleDeGestion.updateProduct);

// connextion du User
router.post('/connexion', controlleDeGestion.login);

// utilusateur connecter ?
router.get('/isConnected', controlleDeGestion.isConnected);

// information sur l'utilisateur connecter
router.get('/me', Auth.authentification, controlleDeGestion.getConnectedUser);

// enregistrer une sortie
router.post('/sortie', Auth.authentification, controlleDeGestion.enregistrerSorties);

// historique des entree
router.get('/entrees', Auth.authentification, controlleDeGestion.getHistoriqueEntrees);

// historique des sorties
router.get('/sorties', Auth.authentification, controlleDeGestion.getHistoriqueSorties);

// ajouter un credit
router.post('/credit', Auth.authentification, controlleDeGestion.enregistrerCredit);

// liste des credits
router.get('/creditsList', Auth.authentification, controlleDeGestion.getCredits);


// information du tableau de bord
// valeur total des produits en stock
router.get('/dashboard/totalStockValue', Auth.authentification, controlleDeGestion.getValeurTotalStock);

// article critiaues
router.get('/dashboard/criticalItems', Auth.authentification, controlleDeGestion.getNombreArticlesSeuilAlerte);

// nombre total des produits
router.get('/dashboard/totalProducts', Auth.authentification, controlleDeGestion.getNombreTotalArticlesEnStock);

// nombre et cout credits
router.get('/dashboard/totalCredits', Auth.authentification, controlleDeGestion.getTotalCredits);

// graphique des ventes journalieres
router.get('/dashboard/salesGraph', Auth.authentification, controlleDeGestion.getChartDay);


// obtenir liste des fournisseurs
router.get('/fournisseurs', Auth.authentification, controlleDeGestion.getFournisseurs);

// valider credit req avec deux parametres : id credit et montant payer
router.post('/validerCredit/:creditId', Auth.authentification, controlleDeGestion.validerCredit);

// genere une licence
router.get('/licence', controlleDeGestion.enregistrerLicence);




// verification licence
router.get('/verifLicence',Auth.authentification, controlleDeGestion.verifierLicence);

// mise a jour licence
router.put('/licenceMj',Auth.authentification, controlleDeGestion.updateLicenceUser);



module.exports=router;