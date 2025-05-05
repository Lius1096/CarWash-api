const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  capturePayment,
  cancelPayment
} = require('../controllers/paymentController');

// Créer un PaymentIntent (autorisation)
router.post('/intent', createPaymentIntent);

// Capturer un paiement autorisé (quand un washer accepte)
router.post('/capture', capturePayment);

// Annuler un paiement (si personne n’a accepté)
router.post('/cancel', cancelPayment);

module.exports = router;
