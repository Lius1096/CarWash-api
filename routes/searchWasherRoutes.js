const express = require('express');
const router = express.Router();
const searchWasherController = require('../controllers/searchWasherController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ CRUD COMPLET

// 🔹 Create
router.post('/', authMiddleware.verifyToken, searchWasherController.createSearchWasher);

// 🔹 Read (all users)
router.get('/', authMiddleware.verifyToken, searchWasherController.getAllSearchWashers);

// 🔹 Read (one user by ID)
router.get('/:userId', authMiddleware.verifyToken, searchWasherController.getSearchWasherProfile);

// 🔹 Update
router.put('/:userId', authMiddleware.verifyToken, searchWasherController.updateSearchWasherProfile);

// 🔹 Delete
router.delete('/:userId', authMiddleware.verifyToken, searchWasherController.deleteSearchWasher);

// ✅ FONCTIONNALITÉS SUPPLÉMENTAIRES

// 🔍 Trouver des washers proches
router.get('/:userId/nearby-washers', authMiddleware.verifyToken, searchWasherController.getNearbyWashers);

// 🕓 Historique des services
router.get('/:userId/services-history', authMiddleware.verifyToken, searchWasherController.getServicesHistory);

// 📈 Statistiques
router.get('/:userId/statistics', authMiddleware.verifyToken, searchWasherController.getSearchWasherStatistics);

// ➕ Commander un service
router.post('/create-service', authMiddleware.verifyToken, searchWasherController.createService);

module.exports = router;
