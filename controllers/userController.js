const geolib = require('geolib');
const User = require('../models/User');

// Récupérer les Washers et calculer la distance
exports.getNearbyWashers = async (req, res) => {
  try {
    const { searchWasherId } = req.body;
    const searchWasher = await User.findById(searchWasherId);
    
    if (!searchWasher) {
      return res.status(404).json({ message: 'SearchWasher non trouvé' });
    }

    // Récupérer tous les Washers
    const washers = await User.find({ role: 'washer' });
    const nearbyWashers = [];

    // Calculer la distance pour chaque Washer
    washers.forEach(washer => {
      const distance = geolib.getDistance(
        { latitude: searchWasher.latitude, longitude: searchWasher.longitude },
        { latitude: washer.latitude, longitude: washer.longitude }
      );
      
      // Ajouter seulement les Washers dans un certain rayon (par exemple, 10 km)
      if (distance <= 10000) { // distance en mètres
        nearbyWashers.push({ washer, distance });
      }
    });

    // Trier les Washers par distance croissante
    nearbyWashers.sort((a, b) => a.distance - b.distance);

    res.status(200).json({ nearbyWashers });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des Washers', error });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  const { username, password, role, email, phone, latitude, longitude, profilePicture } = req.body;
  
  try {
    // Vérification de l'existence de l'utilisateur
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      username,
      password,
      role,
      email,
      phone,
      location: { latitude, longitude },
      profilePicture
    });

    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
  }
};

// Modifier les informations de l'utilisateur
exports.updateUser = async (req, res) => {
  const { email, phone, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user.id); // Assurez-vous que l'utilisateur est authentifié et que son ID est dans req.user.id
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();
    res.status(200).json({ message: 'Informations mises à jour', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des informations', error });
  }
};

// Supprimer un utilisateur (admin uniquement)
exports.deleteUser = async (req, res) => {
  const { userId } = req.params; // L'ID de l'utilisateur à supprimer

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.remove();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
  }
};
