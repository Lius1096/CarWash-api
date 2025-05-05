// backend/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware d'authentification

// Route pour récupérer les Washers proches
router.post('/nearby-washers', userController.getNearbyWashers);

// Créer un utilisateur (admin seulement)
router.post('/create', authMiddleware.protect, userController.createUser); // Vérifie que `authMiddleware.protect` est une fonction

// Modifier les informations de l'utilisateur
router.put('/update', authMiddleware.protect, userController.updateUser);

// Supprimer un utilisateur (admin uniquement)
router.delete('/delete/:userId', authMiddleware.protect, userController.deleteUser);

module.exports = router;
