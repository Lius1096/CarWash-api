// routes/washerDashboard.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const washerDashboardController = require('../controllers/washerDashboardController');

router.get('/services', authMiddleware, washerDashboardController.getServicesDone);
router.get('/earnings', authMiddleware, washerDashboardController.getEarnings);
router.get('/ratings', authMiddleware, washerDashboardController.getRatingsReceived);

module.exports = router;
