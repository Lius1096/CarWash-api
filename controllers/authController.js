const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/// Fonction pour l'inscription des utilisateurs
// Fonction pour l'inscription des utilisateurs
exports.register = async (req, res) => {
  try {
    const { role, email, password, username, firstName, lastName, age, gender, residence, phone } = req.body;

    // Vérifie si email ou username est déjà pris
    const existingUser = await User.isEmailOrUsernameTaken(email, username);
    if (existingUser) {
      return res.status(400).json({ message: "Email ou nom d'utilisateur déjà pris" });
    }

    // Construction de l'objet user
    const userData = {
      role,
      email,
      password,
      firstName,
      lastName,
      age,
      gender,
      residence,
      phone
    };

    if (role === 'washer' || role === 'searchwasher') {
      if (!username) {
        return res.status(400).json({ message: "Nom d'utilisateur requis pour ce rôle" });
      }
      userData.username = username;

      // Géolocalisation automatique par adresse
      if (residence) {
        try {
          const encodedAddress = encodeURIComponent(residence);
          const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`);

          if (geoRes.data && geoRes.data.length > 0) {
            userData.location = {
              latitude: parseFloat(geoRes.data[0].lat),
              longitude: parseFloat(geoRes.data[0].lon)
            };
          }
        } catch (geoError) {
          console.warn('Échec du géocodage automatique :', geoError.message);
        }
      }
    } else {
      return res.status(400).json({ message: 'Rôle non valide' });
    }

    // Création de l'utilisateur
    const user = new User(userData);
    await user.save();

    // Token JWT
    const token = generateToken(user);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        phone: user.phone,
        lastName: user.lastName,

      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification de l'existence de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé." });

    // Comparaison du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect." });

    // Génération du token
    const token = generateToken(user);

    res.status(200).json({
      message: "Connexion réussie.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        phone: user.phone,
        lastName: user.lastName,
      },
      token
    });

  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
