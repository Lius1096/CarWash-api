// controllers/searchwasherDashboardController.js

exports.getServiceHistory = async (req, res) => {
    try {
      const history = await ServiceRequest.find({ user: req.user._id })
        .populate('washer', 'username firstName lastName')
        .sort({ serviceDate: -1 });
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l’historique' });
    }
  };
  
  exports.getPaymentHistory = async (req, res) => {
    try {
      const payments = await ServiceRequest.find({ user: req.user._id, paymentStatus: 'paid' })
        .select('price serviceDate')
        .sort({ serviceDate: -1 });
      const totalSpent = payments.reduce((acc, p) => acc + p.price, 0);
      res.json({ totalSpent, payments });
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
    }
  };
  
  exports.getGivenRatings = async (req, res) => {
    try {
      const services = await ServiceRequest.find({ 'ratings.user': req.user._id })
        .select('ratings washer serviceDate')
        .populate('washer', 'firstName lastName');
      const ratings = services.flatMap(service =>
        service.ratings.filter(r => r.user.toString() === req.user._id.toString())
      );
      res.json(ratings);
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
    }
  };
  