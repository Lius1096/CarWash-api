const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Fonction pour l'inscription des utilisateurs
exports.register = async (req, res) => {
  try {
    const { role, email, password, username, companyName, firstName, lastName, age, gender, residence, phone, companyAddress, companyPhone, businessType, companyWebsite } = req.body;

    // Vérification si le email est déjà pris
    const existingUser = await User.isEmailOrUsernameTaken(email, username);
    if (existingUser) {
      return res.status(400).json({ message: 'Email ou nom d\'utilisateur déjà pris' });
    }

    // Création d'un nouvel utilisateur en fonction du rôle
    const userData = {
      role,
      email,
      password,
      firstName,
      lastName,
      age,
      gender,
      residence,
      phone,
      companyName,
      companyAddress,
      companyPhone,
      businessType,
      companyWebsite
    };

    // Pour les utilisateurs particuliers
    if (role === 'washer' || role === 'searchwasher') {
      if (!username) {
        return res.status(400).json({ message: 'Nom d\'utilisateur requis pour ce rôle' });
      }
      userData.username = username; // On définit le username pour les utilisateurs particuliers
    }

    // Pour les entreprises
    if (role === 'washer_company' || role === 'searchwasher_company') {
      if (!companyName) {
        return res.status(400).json({ message: 'Nom de l\'entreprise requis pour ce rôle' });
      }
    }

    // Hash du mot de passe
    userData.password = password;
    // Création de l'utilisateur dans la base de données
    const user = new User(userData);
    await user.save();

    // Création d'un token JWT pour l'utilisateur
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
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
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect." });

    // Génération du token
    const token = generateToken(user);

    res.status(200).json({
      message: "Connexion réussie.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
