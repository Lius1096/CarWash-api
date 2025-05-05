const express = require('express');
const { getAllWashersStats } = require('../controllers/adminController');
const router = express.Router();
const protectAdminRoute = require('../middlewares/adminAuth');
const adminController = require('../controllers/adminController'); // Importation du contrôleur

// Route pour l'inscription de l'admin
router.post('/register', adminController.registerAdmin);

// Route pour la connexion de l'admin
router.post('/login', adminController.loginAdmin);

// Route pour récupérer les statistiques des washers
router.get('/washers/stats', getAllWashersStats);

router.get('/admin/dashboard', protectAdminRoute, (req, res) => {
    // Logic for fetching the admin dashboard data
    res.json({ message: 'Bienvenue sur le tableau de bord admin' });
  });

module.exports = router;
