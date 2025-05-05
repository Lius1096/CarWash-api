// services/dashboardService.js
const db = require('../models');  // Supposons que vous utilisez un ORM comme Sequelize ou Mongoose

exports.getWasherData = async (userId) => {
  // Logique pour récupérer les données d'un laveur
  const data = await db.Washer.findOne({ where: { id: userId } });
  return {
    totalServices: data.totalServices,
    pendingServices: data.pendingServices,
    totalSpent: data.totalSpent,
    recentServices: data.recentServices
  };
};

// Vous pouvez ajouter des méthodes similaires pour les autres rôles (washer_company, searchwasher, etc.)
