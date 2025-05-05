const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email requis.' });

  try {
    const existing = await Newsletter.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Cet email est déjà inscrit.' });

    await Newsletter.create({ email });
    res.status(201).json({ message: 'Inscription réussie à la newsletter.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
