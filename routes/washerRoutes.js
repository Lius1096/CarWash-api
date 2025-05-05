const express = require('express');
const router = express.Router();
const washerController = require('../controllers/washerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Afficher les informations de son propre washer
router.get('/me', authMiddleware.protect, washerController.getMyWasher);

// Créer un Washer (Service offert)
router.post('/create', authMiddleware.protect, washerController.createWasher);

// Obtenir un Washer par ID
router.get('/:id', washerController.getWasherById);

// Obtenir tous les Washers (par exemple pour une liste générale)
router.get('/', washerController.getAllWashers);

// Ajouter un avis sur un Washer
router.post('/rate/:id', authMiddleware.protect, washerController.addRating);

// Mettre à jour un Washer
router.put('/update/:id', authMiddleware.protect, washerController.updateWasher);

// Supprimer un Washer (Administration)
router.delete('/delete/:id', authMiddleware.protect, authMiddleware.isAdmin, washerController.deleteWasher);

// Route de recherche des washers
router.get('/search', authMiddleware.protect, washerController.searchWashers);

module.exports = router;
