const searchWasherService = require('../services/searchWasherService');

// ✅ Créer un utilisateur de type "search washer"
exports.createSearchWasher = async (req, res) => {
  try {
    const newUser = await searchWasherService.createSearchWasher(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la création', error: err.message });
  }
};

// ✅ Obtenir tous les utilisateurs "search washer"
exports.getAllSearchWashers = async (req, res) => {
  try {
    const users = await searchWasherService.getAllSearchWashers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Obtenir un profil de search washer
exports.getSearchWasherProfile = async (req, res) => {
  try {
    const user = await searchWasherService.getSearchWasherById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Modifier un profil
exports.updateSearchWasherProfile = async (req, res) => {
  try {
    const updatedUser = await searchWasherService.updateSearchWasher(req.params.userId, req.body);
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: err.message });
  }
};

// ✅ Supprimer un profil
exports.deleteSearchWasher = async (req, res) => {
  try {
    await searchWasherService.deleteSearchWasher(req.params.userId);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression', error: err.message });
  }
};

// ✅ Trouver des washers proches
exports.getNearbyWashers = async (req, res) => {
  try {
    const washers = await searchWasherService.getNearbyWashers(req.params.userId);
    res.status(200).json(washers);
  } catch (err) {
    res.status(500).json({ message: 'Erreur géolocalisation', error: err.message });
  }
};

// ✅ Historique des services
exports.getServicesHistory = async (req, res) => {
  try {
    const history = await searchWasherService.getServiceHistoryByUser(req.params.userId);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: 'Erreur historique', error: err.message });
  }
};

// ✅ Statistiques utilisateur
exports.getSearchWasherStatistics = async (req, res) => {
  try {
    const stats = await searchWasherService.getStatisticsByUser(req.params.userId);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Erreur statistiques', error: err.message });
  }
};

// ✅ Créer une demande de service
exports.createService = async (req, res) => {
  try {
    const service = await searchWasherService.createNewService(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création de service', error: err.message });
  }
};
