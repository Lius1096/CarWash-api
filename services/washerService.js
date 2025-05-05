const Washer = require('../models/Washer');

// Fonction pour rechercher des washers avec des filtres
const searchWashers = async (filters) => {
  try {
    const { location, equipment, serviceDescription } = filters;

    // Construction des critères de recherche
    let filterCriteria = {};

    if (location) {
      filterCriteria.location = { $regex: location, $options: 'i' }; // Recherche insensible à la casse
    }

    if (equipment) {
      filterCriteria.availableEquipments = { $in: [equipment] };  // Recherche dans un tableau d'équipements
    }

    if (serviceDescription) {
      filterCriteria.serviceDescription = { $regex: serviceDescription, $options: 'i' };  // Recherche dans la description du service
    }

    // Exécution de la recherche
    return await Washer.find(filterCriteria).populate('user', 'username email');
  } catch (error) {
    throw new Error('Erreur lors de la recherche des washers');
  }
};

module.exports = {
  searchWashers,
};
