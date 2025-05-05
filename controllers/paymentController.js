require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // assure-toi que ta clé est bien dans ton .env
// 1. Créer un PaymentIntent avec capture manuelle
exports.createPaymentIntent = async (req, res) => {
  const { price, travelFee } = req.body;

  if (isNaN(price) || isNaN(travelFee)) {
    return res.status(400).json({ error: 'Montants invalides.' });
  }

  try {
    const totalAmount = Math.round((parseFloat(price) + parseFloat(travelFee)) * 100); // en centimes

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      capture_method: 'manual',
      description: 'Demande de lavage',
      metadata: {
        purpose: 'washer_request',
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Échec de création du paiement.' });
  }
};

// 2. Capturer un paiement après acceptation
exports.capturePayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    res.status(200).json({
      message: 'Paiement capturé avec succès.',
      paymentIntent,
    });
  } catch (err) {
    console.error('Erreur capture:', err);
    res.status(500).json({ error: 'Erreur lors de la capture du paiement.' });
  }
};

// 3. Annuler un paiement si aucun washer n’a répondu
exports.cancelPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const cancelled = await stripe.paymentIntents.cancel(paymentIntentId);

    res.status(200).json({
      message: 'Paiement annulé avec succès.',
      cancelled,
    });
  } catch (err) {
    console.error('Erreur annulation:', err);
    res.status(500).json({ error: 'Erreur lors de l’annulation du paiement.' });
  }
};
