const Washer = require('../models/Washer');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');

// Récupérer les informations du washer de l'utilisateur connecté
const getMyWasher = async (req, res) => {
  try {
    const washer = await Washer.findOne({ user: req.user.id });

    if (!washer) {
      return res.status(404).json({ message: 'Aucun washer trouvé pour cet utilisateur.' });
    }

    return res.status(200).json(washer);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des informations du washer.' });
  }
};

// Créer un Washer
const createWasher = async (req, res) => {
  try {
    const { serviceDescription, availableEquipments, location } = req.body;

    const newWasher = new Washer({
      user: req.user.id,
      serviceDescription,
      availableEquipments,
      location,
    });

    const savedWasher = await newWasher.save();
    res.status(201).json(savedWasher);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du Washer", error });
  }
};

// Obtenir un Washer par ID
const getWasherById = async (req, res) => {
  try {
    const washer = await Washer.findById(req.params.id).populate('user');

    if (!washer) {
      return res.status(404).json({ message: "Washer non trouvé" });
    }

    res.json(washer);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du Washer", error });
  }
};

// Obtenir tous les Washers
const getAllWashers = async (req, res) => {
  try {
    const washers = await Washer.find().populate('user');
    res.json(washers);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des Washers", error });
  }
};

// Ajouter un avis sur un Washer
const addRating = async (req, res) => {
  const { stars, comment } = req.body;

  try {
    const washer = await Washer.findById(req.params.id);

    if (!washer) {
      return res.status(404).json({ message: "Washer non trouvé" });
    }

    const rating = {
      stars,
      comment,
      from: req.user.id,
    };

    washer.ratings.push(rating);
    washer.totalServices += 1;
    washer.averageRating = (
      washer.ratings.reduce((acc, rating) => acc + rating.stars, 0) / washer.ratings.length
    ).toFixed(1);

    await washer.save();

    res.status(201).json(washer);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout de l'avis", error });
  }
};

// Mettre à jour un Washer
const updateWasher = async (req, res) => {
  try {
    const { serviceDescription, availableEquipments, location } = req.body;

    const washer = await Washer.findByIdAndUpdate(
      req.params.id,
      { serviceDescription, availableEquipments, location },
      { new: true }
    );

    if (!washer) {
      return res.status(404).json({ message: "Washer non trouvé" });
    }

    res.json(washer);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du Washer", error });
  }
};

// Supprimer un Washer
const deleteWasher = async (req, res) => {
  try {
    const washer = await Washer.findByIdAndDelete(req.params.id);

    if (!washer) {
      return res.status(404).json({ message: "Washer non trouvé" });
    }

    res.json({ message: "Washer supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du Washer", error });
  }
};

// Rechercher des Washers par critères
const searchWashers = async (req, res) => {
  try {
    const { location, equipment, serviceDescription } = req.query;

    const query = {};
    if (location) query.location = location;
    if (equipment) query.availableEquipments = equipment;
    if (serviceDescription) query.serviceDescription = { $regex: serviceDescription, $options: 'i' };

    const washers = await Washer.find(query).populate('user');

    if (washers.length === 0) {
      return res.status(404).json({ message: 'Aucun washer trouvé avec ces critères.' });
    }

    return res.status(200).json(washers);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur lors de la recherche de washers.' });
  }
};

// Évaluer un washer (par son ID dans le modèle User)
const rateWasher = async (req, res) => {
  const { washerId } = req.params;
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 1 et 5.' });
  }

  try {
    const washer = await Washer.findById(washerId); 

    if (!washer || washer.role !== 'washer') {
      return res.status(404).json({ message: 'Le washer n\'existe pas.' });
    }

    const totalRatings = (washer.numberOfRatings || 0) + 1;
    const newRating = (((washer.averageRating || 0) * (washer.numberOfRatings || 0)) + rating) / totalRatings;

    washer.averageRating = newRating;
    washer.numberOfRatings = totalRatings;

    await washer.save();

    await ServiceRequest.updateMany(
      { washerId: washerId, status: 'completed' },
      { $push: { ratings: { rating: rating, user: req.user.id } } }
    );

    return res.status(200).json({ message: 'Merci pour votre évaluation.', washer });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.', error: err });
  }
};

// Obtenir les washers les mieux notés
const getTopRatedWashers = async (req, res) => {
  try {
    const washers = await User.find({ role: 'washer' })
      .sort({ averageRating: -1 })
      .limit(10);

    return res.status(200).json(washers);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.', error: err });
  }
};

module.exports = {
  getMyWasher,
  createWasher,
  getWasherById,
  getAllWashers,
  addRating,
  updateWasher,
  deleteWasher,
  searchWashers,
  rateWasher,
  getTopRatedWashers
};
