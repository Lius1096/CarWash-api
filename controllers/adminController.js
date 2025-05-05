const Admin = require('../models/Admin');
const Washer = require('../models/Washer'); // Assurez-vous que ce modèle existe
const jwt = require('jsonwebtoken');

// Fonction pour l'inscription de l'admin
async function registerAdmin(req, res) {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'admin existe déjà
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin déjà existant' });
    }

    // Créer un nouvel admin
    const admin = new Admin({
      username,
      email,
      password,
    });

    // Sauvegarder l'admin dans la base de données
    await admin.save();

    return res.status(201).json({ message: 'Admin enregistré avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Fonction pour la connexion de l'admin
async function loginAdmin(req, res) {
  const { email, password } = req.body;

  try {
    // Trouver l'admin par son email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }

    // Comparer le mot de passe
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: admin._id, username: admin.username, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Fonction pour récupérer les statistiques des laveurs
async function getAllWashersStats(req, res) {
  try {
    const washersStats = await Washer.find(); // Assurez-vous que ce modèle existe
    res.status(200).json(washersStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques des laveurs' });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllWashersStats, // Assurez-vous que vous avez besoin de cette fonction
};
