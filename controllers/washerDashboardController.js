const ServiceRequest = require('../models/ServiceRequest');

exports.getWasherServices = async (req, res) => {
  try {
    const washerId = req.user._id;

    const services = await ServiceRequest.find({ washer: washerId })
      .populate('user', 'firstName lastName email')
      .sort({ serviceDate: -1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des services." });
  }
};

exports.getWasherEarnings = async (req, res) => {
  try {
    const washerId = req.user._id;

    const paidServices = await ServiceRequest.find({
      washer: washerId,
      paymentStatus: 'paid',
    });

    const totalEarned = paidServices.reduce((acc, curr) => acc + curr.price, 0);

    res.status(200).json({
      totalEarned,
      serviceCount: paidServices.length,
      services: paidServices
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du calcul des gains." });
  }
};

exports.getWasherRatings = async (req, res) => {
  try {
    const washerId = req.user._id;

    const services = await ServiceRequest.find({ washer: washerId, ratings: { $exists: true, $ne: [] } });

    const ratings = services.flatMap(service =>
      service.ratings.filter(r => r.user) // garde tous les avis avec utilisateur
    );

    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
      : 0;

    res.status(200).json({
      ratings,
      averageRating: averageRating.toFixed(1),
      totalRatings: ratings.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des avis." });
  }
};
