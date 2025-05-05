// routes/cookieConsent.routes.js
const express = require('express');
const router = express.Router();

// Route pour gérer le consentement aux cookies
router.post("/cookie-consent", (req, res) => {
  const { statistics, marketing } = req.body;

  // Définir les préférences de consentement
  const consent = {
    necessary: true, // Le consentement nécessaire est toujours vrai
    statistics: !!statistics, // Vérifie si la statistique est activée
    marketing: !!marketing,   // Vérifie si le marketing est activé
  };

  // Définir un cookie avec les préférences de consentement
  res.cookie("cookieConsent", JSON.stringify(consent), {
    httpOnly: true,    // Le cookie ne peut pas être lu par JavaScript côté client
    secure: process.env.NODE_ENV === "production",  // Ne fonctionne que sur HTTPS en production
    sameSite: "Lax",   // Empêche le cookie d'être envoyé avec des requêtes cross-site
    maxAge: 365 * 24 * 60 * 60 * 1000,  // Durée du cookie (1 an)
  });

  // Réponse après avoir enregistré le consentement
  res.status(200).json({ message: "Consentement enregistré." });
});

module.exports = router;  // Utiliser module.exports au lieu d'export default
