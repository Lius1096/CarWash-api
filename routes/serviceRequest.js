const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assurez-vous d'importer votre middleware

// Créer une demande de service
router.post('/service-request', authMiddleware.protect, serviceRequestController.createServiceRequest);

// Assignation d'un washer à une demande
router.put('/service-request/:id/assign', authMiddleware.protect, authMiddleware.isWasher, serviceRequestController.assignWasherToService);

// Accepter ou refuser une demande assignée
router.put('/service-request/:requestId/decision', authMiddleware.protect, authMiddleware.isWasher, serviceRequestController.acceptOrRejectRequest);

// Mettre à jour le statut d’une demande
router.put('/service-request/:requestId/status', authMiddleware.protect, authMiddleware.isWasher, serviceRequestController.updateServiceStatus);

// Voir les demandes disponibles autour du washer (10km max)
router.get('/service-requests/nearby', authMiddleware.protect, authMiddleware.isWasher, serviceRequestController.getAvailableServiceRequests);

// Voir les demandes disponibles sans filtre géographique
router.get('/service-requests', authMiddleware.protect, authMiddleware.isSearchWasher, serviceRequestController.getAvailableRequests);

// Voir les demandes assignées au washer
router.get('/service-requests/washer', authMiddleware.protect, authMiddleware.isWasher, serviceRequestController.getServiceRequestsForWasher);

module.exports = router;
