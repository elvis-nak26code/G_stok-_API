const User=require('../models/user')
// const Credit=require('../models/credit')
require('../models/produit')


// ajouter un produit
exports.addproduct=async (req, res) => { 
    const userId = req.user.id;
    const Produit = require('../models/produit');
    const mouvementStock = require('../models/mouvementStock');
    try {
        const { prix, quantite , fournisseur} = req.body;
        // creation du [roduit]
        const produit = new Produit(req.body);
        
        const user = await User.findById(userId)
        if (!user) {
           return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        await user.produits.push(produit._id);  
        await user.save();
        // creation du mouvement
        const mouvement = new mouvementStock({
            type: 'ENTREE',
            date: new Date(),
            quantite,
            prix,
            total: prix * quantite,
            fournisseur,
            produit: produit._id
        });
        // creation du fournisseur
        await produit.entrees.push(mouvement._id);
        await produit.save();
        await mouvement.save();
        res.status(201).json({ message: "Produit ajouté avec succès :"});
        console.log("Produit ajouté avec succès :", produit);
    } catch (error) {
        res.status(400).json({ message: 'Tous les champs sont requis' });
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
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
           return res.status(404).json({ message: "Utilisateur non trouvé" });
        }


        const fournisseur = new Fournisseur(req.body);
        await user.fournisseurs.push(fournisseur._id);
        await user.save();
        await fournisseur.save();
        res.status(201).json({ message: "Fournisseur ajouté avec succès"});
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
    const jwt = require('jsonwebtoken');
    const { password, confirmPassword } = req.body;
    try {
        // Vérification si l'utilisateur existe déjà
        // const User= Utilisateur.findOne({ email: req.body.email });
        // if (User) {
        //     return res.status(400).json({ message: "L'utilisateur existe déjà" });
        // }
        if(password!=confirmPassword)res.status(400).json({ message: "confirmer le mot de pass" });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const utilisateur = new Utilisateur({
            ...req.body,
            password: hashedPassword
        });
        await utilisateur.save();

        // connextion auto apres inscription
        const token = jwt.sign({ id: utilisateur._id }, "gstockNak263secret" , { expiresIn: '24h' });

        res.status(201).json({ token, utilisateur });

        console.log("Utilisateur ajouté avec succès :", utilisateur);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log("Erreur lors de l'ajout de l'utilisateur :", error);
    }
}

//obtenir tous les produits dun utilusateur
exports.getAllProducts = async (req, res) => {
    // console.log("Récupération des produits pour l'utilisateur :", req.user);
    const userId = req.user.id;
    const user = await User.findById(userId).populate("produits");
    if (!user) {
       return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const Produit = require('../models/produit');
    try {
        // const produits = await Produit.find();
        console.log("userId:"+ userId);
        res.status(200).json(user.produits);
        console.log("Liste des produits récupérée avec succès :", user.produits);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la récupération des produits :", error);
    }
}


// suprimer un produit  
exports.deleteProduct = async (req, res) => {
    const userId = req.user.id;
    
    const Produit = require('../models/produit');
    try {
        const user = await User.findById(userId).populate("produits");
        if (!user) {
           return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si le produit appartient à l'utilisateur
        if (!user.produits.some(produit => produit._id.toString() === req.params.id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce produit" });
        }
        
        // suprimer la reference du produit dans la liste des produits de l'utilisateur
        user.produits = user.produits.filter(produit => produit._id.toString() !== req.params.id);
        await user.save();
        // suprimer le produit

        const produit = await Produit.findByIdAndDelete(req.params.id);
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.status(200).json({ message: "Produit supprimé avec succès" });
        console.log("Produit supprimé avec succès :", produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la suppression du produit :", error);
    }
}

// Modifier un produit
exports.updateProduct = async (req, res) => {
    const Produit = require('../models/produit');
    const mouvementStock = require('../models/mouvementStock');
    try {
        const { id } = req.params;
        const updateData = req.body; // Les champs à modifier envoyés dans la requête

        // Trouver le produit et le mettre à jour
        const produit = await Produit.findByIdAndUpdate(id, updateData, { new: true });

        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
         
        // Créer le mouvement de stock pour la sortie
        const mouvement = new mouvementStock({
            type: 'ENTREE',
            date: new Date(),
            quantite: updateData.quantite,
            prix: updateData.prix, // fallback si prix absent
            total: updateData.prix * updateData.quantite,
            produit: id
        });
       await mouvement.save();


        res.status(200).json({ message: "Produit modifié avec succès", produit });
        console.log("Produit modifié avec succès :", produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la modification du produit :", error);
    }
};


// connection et generation du token
exports.login = async (req, res) => {
    const Utilisateur = require('../models/user');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    try {
        const { email, password } = req.body;
        const utilisateur = await Utilisateur.findOne({ email });

        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isPasswordValid = await bcrypt.compare(password, utilisateur.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        const token = jwt.sign({ id: utilisateur._id }, "gstockNak263secret" , { expiresIn: '24h' });
        res.status(200).json({ token, utilisateur });
        console.log("Utilisateur connecté avec succès :", utilisateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la connexion de l'utilisateur :", error);
    }
};


// verification si user est connecter
exports.isConnected=(req,res)=>{
    const jwt = require('jsonwebtoken');
    const Authorization=req.headers.authorization;
    if(!Authorization || !Authorization.startsWith('Bearer ')) return res.status(401).json({
        isConnected: false,
        message: 'Token manquant ou invalide'
    })
    const token=Authorization.split(' ')[1]
    // console.log(token)
    try{
     const decoded=jwt.verify(token,"gstockNak263secret")
     return res.status(200).json({
         isConnected: true
     })
    }catch(e){
      return res.status(401).json({ isConnected: false, message: 'Token invalide.' });
    }
 }


// recuperation des information de l'utilisateur connecter
exports.getConnectedUser=async (req,res)=>{
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).select('-password'); // Exclure le mot de passe
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// enregistrer les sorties des produit solo ou en lot en recevent un objet de sorties
exports.enregistrerSorties = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    const MouvementStock = require('../models/mouvementStock');

    try {
        let { sorties } = req.body; // Peut être un tableau ou un objet

        // ✅ Si c’est un objet (clé = produitId), on le transforme en tableau
        if (!Array.isArray(sorties)) {
            sorties = Object.entries(sorties).map(([produitId, details]) => ({
                produitId,
                ...details
            }));
        }
        if(sorties.length===0) return res.status(400).json({ message: "Aucune sortie à enregistrer" });

        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        for (const sortie of sorties) {
            const { produitId, quantite, prix, total } = sortie;

            // Vérifier si le produit appartient à l'utilisateur
            if (!user.produits.some(produit => produit._id.toString() === produitId)) {
                return res.status(403).json({ message: `Vous n'êtes pas autorisé à enregistrer une sortie pour le produit ${produitId}` });
            }

            const produit = await Produit.findById(produitId);
            if (!produit) {
                return res.status(404).json({ message: `Produit avec ID ${produitId} non trouvé` });
            }

            if (produit.quantite < quantite) {
                return res.status(400).json({ message: `Quantité insuffisante pour le produit ${produit.nom}` });
            }

            // Créer le mouvement de stock pour la sortie
            const mouvement = new MouvementStock({
                type: 'SORTIE',
                date: new Date(),
                quantite,
                prix: prix || details?.prix || 0, // fallback si prix absent
                total,
                produit: produit._id
            });

            // Mettre à jour la quantité du produit
            produit.quantite -= quantite;
            await produit.sorties.push(mouvement._id);
            await produit.save();
            await mouvement.save();
        }



        // enregistrement dees donnee de la chart par jour *********************************
        const today = new Date();
        const jours = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche"
        ];
        
        // getDay() retourne 0 = Dimanche, 1 = Lundi, ...
        // on aligne l'index sur ton tableau qui commence par "Lundi"
        const jourActuel = jours[(today.getDay() + 6) % 7];
        
        // sécurité si sorties est undefined
        const ajout = Array.isArray(sorties) ? sorties.length : (Number(sorties) || 0);
        
        if (user.chartDay.length === 0) {
          for (let i = 0; i < jours.length; i++) {
            const ancienneValeur = user.chartDay[i] || { desktop: 0, mobile: 0 };
        
            if (jourActuel === jours[i]) {
              user.chartDay.push({
                month: jours[i],
                desktop: ancienneValeur.desktop + ajout,
                mobile: ancienneValeur.mobile + ajout
              });
            } else {
              user.chartDay.push({
                month: jours[i],
                desktop: ancienneValeur.desktop,
                mobile: ancienneValeur.mobile
              });
            }
          }
        } else {
          // si le jour actuel existe déjà on l'update, sinon on pousse le jour actuel
          let found = false;
          for (let i = 0; i < user.chartDay.length; i++) {
            if (jourActuel === user.chartDay[i].month) {
              const ancienneValeur = user.chartDay[i] || { desktop: 0, mobile: 0 };
              user.chartDay[i] = {
                month: user.chartDay[i].month,
                desktop: ancienneValeur.desktop + ajout,
                mobile: ancienneValeur.mobile + ajout
              };
              found = true;
              break; // on a trouvé, on sort de la boucle
            }
          }
        
          if (!found) {
            // jour non trouvé -> on ajoute le jour actuel et on enlève le premier (fenêtre glissante)
            user.chartDay.push({
              month: jourActuel,
              desktop: ajout,
              mobile: ajout
            });
            user.chartDay.shift();
          }
        }
        
        await user.save();
        
        // *********************************************************************************

        res.status(200).json({ message: "Sorties enregistrées avec succès" });
        console.log("Sorties enregistrées avec succès");
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de l'enregistrement des sorties :", error);
    }
}


// recuperation de l'historique des entrees  
exports.getHistoriqueEntrees = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    const MouvementStock = require('../models/mouvementStock');

    try {
        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Récupérer tous les mouvements d'entrée pour les produits de l'utilisateur
        const produitIds = user.produits.map(produit => produit._id);
        const entrees = await MouvementStock.find({ produit: { $in: produitIds }, type: 'ENTREE' }).populate('produit');

        res.status(200).json(entrees);
        // console.log("Historique des entrées récupéré avec succès :", entrees);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la récupération de l'historique des entrées :", error);
    }
}


// recuperation de l'historique des sorties
exports.getHistoriqueSorties = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    const MouvementStock = require('../models/mouvementStock');

    try {
        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Récupérer tous les mouvements d'entrée pour les produits de l'utilisateur
        const produitIds = user.produits.map(produit => produit._id);
        const entrees = await MouvementStock.find({ produit: { $in: produitIds }, type: 'SORTIE' }).populate('produit');

        res.status(200).json(entrees);
        // console.log("Historique des entrées récupéré avec succès :", entrees);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la récupération de l'historique des entrées :", error);
    }
}

// enregistrer un credit
exports.enregistrerCredit = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    const Credit = require('../models/credit');

    try {
        let { produits, nomCeancier, numero, montantTotal } = req.body; // Peut être un tableau ou un objet

        // ✅ Si c’est un objet (clé = produitId), on le transforme en tableau
        if (!Array.isArray(produits)) {
            produits = Object.entries(produits).map(([produitId, details]) => ({
                produitId,
                ...details
            }));
        }
        if(produits.length===0) return res.status(200).json({ message: "Aucun produit selectionner" });

        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        for (const item of produits) {
            const { produitId, quantite } = item;

            // Vérifier si le produit appartient à l'utilisateur
            if (!user.produits.some(produit => produit._id.toString() === produitId)) {
                return res.status(403).json({ message: `Vous n'êtes pas autorisé à enregistrer une sortie pour le produit ${produitId}` });
            }

            const produit = await Produit.findById(produitId);
            if (!produit) {
                return res.status(404).json({ message: `Produit avec ID ${produitId} non trouvé` });
            }

            if (produit.quantite < quantite) {
                return res.status(400).json({ message: `Quantité insuffisante pour le produit ${produit.nom}` });
            }

            // Mettre à jour la quantité du produit
            produit.quantite -= quantite;
            await produit.save();
        }

        // Créer le crédit
        const credit = new Credit({
            nomCeancier,
            numero,
            produits: produits.map(item => item.produitId),
            montantTotal
        });
        
        
        await user.credits.push(credit._id);
        await user.save();
        await credit.save();
        
        
        

        res.status(200).json({ message: "Crédit enregistré avec succès" });
        console.log("Crédit enregistré avec succès");
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de l'enregistrement du crédit:", error);
    }
}


// get credit
exports.getCredits = async (req, res) => {
    const userId = req.user.id;
    const Credit = require('../models/credit');
    const produit = require('../models/produit');

    try {
        const user = await User.findById(userId)
        .populate({
            path: "credits",      // populate les crédits de l'utilisateur
            populate: {
                path: "produits", // populate les produits de chaque crédit
                model: "Produit"
            }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(user.credits);
        console.log("Crédits récupérés avec succès :", user.credits);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la récupération des crédits :", error);
    }
}


// valeur total du stock
exports.getValeurTotalStock = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    try {
        // console.log("Calcul de la valeur totale du stock pour l'utilisateur :", userId);
        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        // Calculer la valeur totale du stock
        const valeurTotale = user.produits.reduce((total, produit) => {
            return total + (produit.prix * produit.quantite);
        }, 0);

        res.status(200).json({ valeurTotale });
        // console.log("Valeur totale du stock calculée avec succès :", valeurTotale);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors du calcul de la valeur totale du stock :", error);
    }
}


// nombre darticle avc stock inferieur a seuil dalerte du produit   
exports.getNombreArticlesSeuilAlerte = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    try {
        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Compter le nombre de produits en dessous du seuil d'alerte
        const nombreArticlesAlerte = user.produits.filter(produit => produit.quantite < produit.seuilAlerte).length;

        res.status(200).json({ nombreArticlesAlerte });
        // console.log("Nombre d'articles en dessous du seuil d'alerte calculé avec succès :", nombreArticlesAlerte);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors du calcul du nombre d'articles en dessous du seuil d'alerte :", error);
    }
}

// nombre totale darticle en stock
exports.getNombreTotalArticlesEnStock = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    try {
        const user = await User.findById(userId).populate("produits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Compter le nombre total de produits en stock
        const nombreTotalArticlesEnStock = user.produits.reduce((total, produit) => total + produit.quantite, 0);

        res.status(200).json({ nombreTotalArticlesEnStock });
        // console.log("Nombre total d'articles en stock calculé avec succès :", nombreTotalArticlesEnStock);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors du calcul du nombre total d'articles en stock :", error);
    }
}

// nombre et prix totale des credits
 exports.getTotalCredits = async (req, res) => {
     const userId = req.user.id;
     const Credit = require('../models/credit');
     try {
         const user = await User.findById(userId).populate("credits");
         if (!user) {
             return res.status(404).json({ message: "Utilisateur non trouvé" });
         }
         // Calculer le nombre total de crédits et le montant total
         const nombreTotalCredits = user.credits.length;
         const montantTotalCredits = user.credits.reduce((total, credit) => total + credit.montantTotal, 0);

         res.status(200).json({ nombreTotalCredits, montantTotalCredits });
         console.log("Nombre total de crédits et montant total calculés avec succès :", { nombreTotalCredits, montantTotalCredits });
     } catch (error) {
         res.status(500).json({ message: error.message });
         console.log("Erreur lors du calcul du nombre total de crédits et du montant total :", error);
     }
 }


//  recuperation de chertDay
 exports.getChartDay = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(user.chartDay);
        console.log("Données chartDay récupérées avec succès :", user.chartDay);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la récupération des données chartDay :", error);
    }
}


// recuperer les fournisseurs
exports.getFournisseurs = async (req, res) => {
    const userId = req.user.id;
    const Fournisseur = require('../models/fournisseur');
    try {
        const user = await User.findById(userId).populate("fournisseurs");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(user.fournisseurs);
        console.log("Fournisseurs récupérés avec succès :", user.fournisseurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la récupération des fournisseurs :", error);
    }
}

// valider un credit en creant une sortie
exports.validerCredit = async (req, res) => {
    const userId = req.user.id;
    const Produit = require('../models/produit');
    const MouvementStock = require('../models/mouvementStock');
    const Credit = require('../models/credit');

    try {
        const { creditId } = req.params; // ID du crédit à valider

        const user = await User.findById(userId).populate("produits").populate("credits");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const credit = await Credit.findById(creditId);
        if (!credit) {
            return res.status(404).json({ message: "Crédit non trouvé" });
        }
        

        // Vérifier si le crédit appartient à l'utilisateur
        if (!user.credits.some(c => c._id.toString() === creditId)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à valider ce crédit" });
        }
       
        for (const produitId of credit.produits) {
            const produit = await Produit.findById(produitId);
            if (!produit) {
                return res.status(404).json({ message: `Produit avec ID ${produitId} non trouvé` });
            }

            // Ici, on suppose que chaque produit dans le crédit a une quantité de 1 pour la sortie
            if (produit.quantite < 1) {
                return res.status(400).json({ message: `Quantité insuffisante pour le produit ${produit.nom}` });
            }

            // Créer le mouvement de stock pour la sortie
            const mouvement = new MouvementStock({
                type: 'SORTIE',
                date: new Date(),
                quantite: 1, // On sort un exemplaire du produit
                prix: produit.prix,
                total: produit.prix * 1,
                produit: produit._id
            });

            // Mettre à jour la quantité du produit
            // produit.quantite -= 1;
            await produit.sorties.push(mouvement._id);
            await produit.save();
            await mouvement.save();
        }

        // Optionnel : Marquer le crédit comme "validé" ou le supprimer
        await Credit.findByIdAndDelete(creditId);
        user.credits = user.
credits.filter(c => c._id.toString() !== creditId);
        await user.save();

        res.status(200).json({ message: "Crédit validé et sorties enregistrées avec succès" });
        console.log("Crédit validé et sorties enregistrées avec succès");
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la validation du crédit :", error);
    }
}



// enregistrer une licence
exports.enregistrerLicence = async (req, res) => {
    const Licence = require('../models/licence');
    const crypto = require('crypto');
    try {
        function generateLicense(daysValid = 30) {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + daysValid);
        
          const data = JSON.stringify({ expiry: expiry.toISOString() });
          const code = Buffer.from(data).toString("base64");
          return code;
        }
        
        const licenseCode = generateLicense(30);

        console.log("Code licence :", licenseCode);
        
        // Créer la licence
        const licence = new Licence({ code: licenseCode });
        await licence.save();

        res.status(200).json({ message: "Licence enregistrée avec succès", licence });
        console.log("Licence enregistrée avec succès :", licence);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de l'enregistrement de la licence :", error);
    }
}

// verification si la licence de user correspond a une licence valide
exports.verifierLicence = async (req, res) => {
    const userId = req.user.id;
    console.log("Vérification de la licence pour l'utilisateur :", userId);
    const Licence = require('../models/licence');
    try {
        console.log("Vérification de la licence pour l'utilisateur :", userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log("Utilisateur non trouvé");
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (!user.licence) {
            console.log("Aucune licence associée à l'utilisateur");
            return res.status(400).json({ message: "Aucune licence associée à l'utilisateur" });
        }
        
        console.log(user.licence)
        const licence = await Licence.findOne({ code: { $in: [user.licence] } });
        console.log("Licence trouvée :", licence);

        if (!licence) {
            console.log("Licence non valide");
            return res.status(404).json({ message: "Licence non valide" });
        }
        // Décoder le code de la licence
        function verifyLicense(code) {
            try {
              const decoded = Buffer.from(code, "base64").toString("utf-8");
              const { expiry } = JSON.parse(decoded);
              if (new Date() > new Date(expiry)) {
                console.log("licence vraiment expireee")
                return false; // licence expirée
               
              }
              return true; // licence valide
            } catch (err) {
                console.log("pronlemmm erreeeeuuu")
              return false; // code invalide
             
            }
          }
     
        // Vérifier si la licence est expirée
        if (!verifyLicense(user.licence)) {
            console.log("Licence expirée");
            return res.status(400).json({ message: "Licence expirée" });
        }

        res.status(200).json({ isvalid: true });
        console.log("Licence valide pour l'utilisateur :", userId);
    } catch (error) {
        res.status(500).json({ isvalid: false });
        console.log("Erreur lors de la vérification de la licence :", error);
    }
}




// mettre a jour la licence de l'utilisateur
exports.updateLicenceUser = async (req, res) => {
    
    const userId = req.user.id;
    // const Licence = require('../models/licence');
    console.log(req.user.id)
    
    try {
        const { licenceCode } = req.body;
        console.log(licenceCode)
        
        if (!licenceCode) {
            console.log("Le code de la licence est requis");
            return res.status(400).json({ message: "Le code de la licence est requis" });
            
        }

        const user = await User.findById(userId);
        if (!user) {
            console.log("Utilisateur non trouvé");
            return res.status(404).json({ message: "Utilisateur non trouvé" });
           
        }

        // const licence = await Licence.findOne({ code: licenceCode });
        // if (!licence) {
        //     console.log("Licence non valide");
        //     return res.status(404).json({ message: "Licence non valide" });
            
        // }

        user.licence = licenceCode;
        await user.save();

        res.status(200).json({ message: "Licence mise à jour avec succès", user });
        console.log("Licence mise à jour avec succès pour l'utilisateur :", userId);
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Erreur lors de la mise à jour de la licence de l'utilisateur :", error);
    }
}