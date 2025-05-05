const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const mongoose = require('mongoose');
const getDistance = require('../utils/distance'); // ta fonction de calcul distance (en km)

exports.createServiceRequest = async (req, res) => {
  const { latitude, longitude, timeRange, details, address, typeOfService, travelFee, price } = req.body;

  if (!address) return res.status(400).json({ error: "L'adresse est requise." });
  if (isNaN(price) || isNaN(travelFee)) {
    return res.status(400).json({ error: 'Le prix et les frais de déplacement doivent être valides.' });
  }

  try {
    const user = req.user;
    if (!user || user.role !== 'searchwasher') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const serviceRequest = await ServiceRequest.create({
      user: user._id,
      timeRange,
      details,
      address,
      latitude,
      longitude,
      typeOfService,
      travelFee,
      price: parseFloat(price) + parseFloat(travelFee),
      status: 'pending',
      washer: null,
    });

    res.status(201).json({
      message: 'Demande de service créée avec succès.',
      serviceRequest,
    });
  } catch (err) {
    console.error('Erreur création demande:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};


// 2. Assignation manuelle d'une demande à un washer
exports.assignWasherToService = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID invalide.' });
  }

  try {
    const washer = req.user;
    if (!washer || washer.role !== 'washer') {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    const request = await ServiceRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Demande non trouvée.' });
    if (request.washer) return res.status(400).json({ error: 'Demande déjà assignée.' });

    request.washer = washer._id;
    request.status = 'assigned';
    await request.save();

    res.json({ message: 'Demande assignée avec succès.', request });
  } catch (err) {
    console.error('Erreur assignation:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 3. Accepter ou refuser une demande assignée
exports.acceptOrRejectRequest = async (req, res) => {
  const washerId = req.user._id;
  const { requestId } = req.params;
  const { decision } = req.body;

  console.log('Décision reçue:', decision);

  if (!['accepted', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'La décision doit être "accepted" ou "rejected".' });
  }

  try {
    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    if (request.status !== 'pending' || (request.washer && request.washer.toString() !== washerId.toString())) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette demande.' });
    }

    if (request.status !== 'assigned' || request.washer.toString() !== washerId.toString()) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette demande.' });
    }
    

    if (decision === 'accepted') {
      request.status = 'accepted';
      request.washer = washerId;
    } else if (decision === 'rejected') {
      request.status = 'rejected';
      request.washer = null;
    }

    await request.save();

    return res.status(200).json({ message: `Demande ${decision === 'accepted' ? 'acceptée' : 'refusée'} avec succès.` });

  } catch (error) {
    console.error('Erreur lors de la décision du washer :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 4. Mise à jour du statut d’une demande (ex: in_progress → completed)
exports.updateServiceStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const validStatuses = ['in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  try {
    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Demande non trouvée.' });
    if (!request.washer.equals(req.user._id)) {
      return res.status(403).json({ error: 'Accès interdit.' });
    }

    request.status = status;
    await request.save();

    res.json({ message: 'Statut mis à jour avec succès.', request });
  } catch (err) {
    console.error('Erreur mise à jour statut:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 5. Voir les demandes disponibles autour du washer (10km max)
exports.getAvailableServiceRequests = async (req, res) => {
  const washer = req.user;

  // Vérification des coordonnées du washer
  if (
    !washer.location ||
    typeof washer.location.latitude !== 'number' ||
    typeof washer.location.longitude !== 'number'
  ) {
    return res.status(400).json({ error: 'Coordonnées manquantes pour ce washer.' });
  }

  try {
    // On récupère les demandes sans washer assigné
    const requests = await ServiceRequest.find({ status: 'pending', washer: null })
    .populate('user', 'firstName lastName phone');

    // On filtre celles proches (dans un rayon de 10km)
    const nearby = requests
      .map((req) => {
        if (
          typeof req.latitude !== 'number' ||
          typeof req.longitude !== 'number'
        ) return null;

        const distance = getDistance(
          washer.location.latitude,
          washer.location.longitude,
          req.latitude,
          req.longitude
        );

        if (distance <= 10) {
          return {
            ...req.toObject(),
            distance: distance.toFixed(2) // facultatif, pour arrondir
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance); // tri par distance croissante

    res.json(nearby);
  } catch (err) {
    console.error('Erreur récupération demandes proches:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 6. Voir les demandes disponibles (sans filtre géographique)
exports.getAvailableRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ status: 'pending', washer: null });
    res.json(requests);
  } catch (err) {
    console.error('Erreur récupération demandes:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// 7. Voir les demandes assignées au washer
exports.getServiceRequestsForWasher = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ washer: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Erreur récupération demandes washer:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};




// const ServiceRequest = require('../models/ServiceRequest');
// const User = require('../models/User');
// const mongoose = require('mongoose');
// const getDistance = require('../utils/distance'); // ta fonction de calcul distance (en km)

// exports.createServiceRequest = async (req, res) => {
//   const { latitude, longitude, timeRange, details, address, typeOfService, travelFee, price } = req.body;

//   if (!address) return res.status(400).json({ error: "L'adresse est requise." });
//   if (isNaN(price) || isNaN(travelFee)) {
//     return res.status(400).json({ error: 'Le prix et les frais de déplacement doivent être valides.' });
//   }

//   try {
//     const user = req.user;
//     if (!user || user.role !== 'searchwasher') {
//       return res.status(403).json({ error: 'Accès non autorisé' });
//     }

//     // Stockage de `price`, `travelFee`, et `totalPrice`
//     const serviceRequest = await ServiceRequest.create({
//       user: user._id,
//       timeRange,
//       details,
//       address,
//       latitude,
//       longitude,
//       typeOfService,
//       travelFee: parseFloat(travelFee),
//       price: parseFloat(price),
//       totalPrice: parseFloat(price) + parseFloat(travelFee),
//       status: 'pending',
//       washer: null,
//     });

//     res.status(201).json({
//       message: 'Demande de service créée avec succès.',
//       serviceRequest,
//     });
//   } catch (err) {
//     console.error('Erreur création demande:', err);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// };

// // 2. Assignation manuelle d'une demande à un washer
// exports.assignWasherToService = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ error: 'ID invalide.' });
//   }

//   try {
//     const washer = req.user;
//     if (!washer || washer.role !== 'washer') {
//       return res.status(403).json({ error: 'Accès refusé.' });
//     }

//     const request = await ServiceRequest.findById(id);
//     if (!request) return res.status(404).json({ error: 'Demande non trouvée.' });
//     if (request.washer) return res.status(400).json({ error: 'Demande déjà assignée.' });

//     request.washer = washer._id;
//     request.status = 'assigned';
//     await request.save();

//     res.json({ message: 'Demande assignée avec succès.', request });
//   } catch (err) {
//     console.error('Erreur assignation:', err);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// };

// // 3. Accepter ou refuser une demande assignée
// exports.acceptOrRejectRequest = async (req, res) => {
//   const washerId = req.user._id;
//   const { requestId } = req.params;
//   const { decision, reason } = req.body;

//   console.log('Décision reçue:', decision);

//   if (!['accepted', 'rejected'].includes(decision)) {
//     return res.status(400).json({ error: 'La décision doit être "accepted" ou "rejected".' });
//   }

//   try {
//     const request = await ServiceRequest.findById(requestId);

//     if (!request) {
//       return res.status(404).json({ error: 'Demande introuvable.' });
//     }

//     // Vérification si le washer a bien assigné cette demande
//     if (request.status !== 'assigned' || request.washer.toString() !== washerId.toString()) {
//       return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette demande.' });
//     }

//     if (decision === 'accepted') {
//       request.status = 'accepted';
//       request.washer = washerId;
//     } else if (decision === 'rejected') {
//       request.status = 'rejected';
//       request.rejectionReason = reason || 'Non spécifiée';
//       request.washer = null;
//     }

//     await request.save();

//     return res.status(200).json({ message: `Demande ${decision === 'accepted' ? 'acceptée' : 'refusée'} avec succès.` });

//   } catch (error) {
//     console.error('Erreur lors de la décision du washer :', error);
//     return res.status(500).json({ error: 'Erreur serveur' });
//   }
// };

// // 4. Mise à jour du statut d’une demande (ex: in_progress → completed)
// exports.updateServiceStatus = async (req, res) => {
//   const { requestId } = req.params;
//   const { status } = req.body;

//   const validStatuses = ['in_progress', 'completed', 'cancelled'];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ error: 'Statut invalide.' });
//   }

//   try {
//     const request = await ServiceRequest.findById(requestId);
//     if (!request) return res.status(404).json({ error: 'Demande non trouvée.' });
//     if (!request.washer.equals(req.user._id)) {
//       return res.status(403).json({ error: 'Accès interdit.' });
//     }

//     request.status = status;
//     await request.save();

//     res.json({ message: 'Statut mis à jour avec succès.', request });
//   } catch (err) {
//     console.error('Erreur mise à jour statut:', err);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// };

// // 5. Voir les demandes disponibles autour du washer (10km max)
// exports.getAvailableServiceRequests = async (req, res) => {
//   const washer = req.user;

//   // Vérification des coordonnées du washer
//   if (
//     !washer.location ||
//     isNaN(washer.location.latitude) ||
//     isNaN(washer.location.longitude)
//   ) {
//     return res.status(400).json({ error: 'Coordonnées manquantes ou invalides pour ce washer.' });
//   }

//   try {
//     // On récupère les demandes sans washer assigné
//     const requests = await ServiceRequest.find({ status: 'pending', washer: null })
//       .populate('user', 'firstName lastName phone');

//     // On filtre celles proches (dans un rayon de 10km)
//     const nearby = requests
//       .map((req) => {
//         if (
//           isNaN(req.latitude) ||
//           isNaN(req.longitude)
//         ) return null;

//         const distance = getDistance(
//           washer.location.latitude,
//           washer.location.longitude,
//           req.latitude,
//           req.longitude
//         );

//         if (distance <= 10) {
//           return {
//             ...req.toObject(),
//             distance: distance.toFixed(2) // facultatif, pour arrondir
//           };
//         }
//         return null;
//       })
//       .filter(Boolean)
//       .sort((a, b) => a.distance - b.distance); // tri par distance croissante

//     res.json(nearby);
//   } catch (err) {
//     console.error('Erreur récupération demandes proches:', err);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// };

// // 6. Voir les demandes disponibles (sans filtre géographique)
// exports.getAvailableRequests = async (req, res) => {
//   try {
//     const requests = await ServiceRequest.find({ status: 'pending', washer: null });
//     res.json(requests);
//   } catch (err) {
//     console.error('Erreur récupération demandes:', err);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// };

// // 7. Voir les demandes assignées au washer
// exports.getServiceRequestsForWasher = async (req, res) => {
//   try {
//     const requests = await ServiceRequest.find({ washer: req.user._id }).sort({ createdAt: -1 });
//     res.json(requests);
//   } catch (err) {
//     console.error('Erreur récupération demandes washer:', err);
//     res.status(500).json({ error: 'Erreur serveur.' });
//   }
// };
