// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (error) {
    return null; // Retourne null si le token est invalide ou expiré
  }
}




// Vérification de l'authentification de l'utilisateur
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token existe dans l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log("Token manquant");

    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  // Extraire l'utilisateur associé au token
  const user = await getUserFromToken(token);

  if (!user) {
    console.log("Token invalide");

    return res.status(401).json({ message: 'Non autorisé, token invalide' });
  }

  // Attacher l'utilisateur à la requête
  req.user = user;
  next();
};

// Vérification si l'utilisateur est admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
};

// backend/middlewares/authMiddleware.js
exports.isAdminOrSearchWasher = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'searchwasher')) {
    return next(); // Autorise l'accès à la route
  } else {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs ou aux search washers' });
  }
};

// Vérification si l'utilisateur est un washer
exports.isWasher = (req, res, next) => {
  if (req.user && req.user.role === 'washer') {
    return next(); // Permet l'accès si l'utilisateur est un washer
  } else {
    return res.status(403).json({ message: 'Accès réservé aux washers' });
  }
};

// Vérification si l'utilisateur est un search washer
exports.isSearchWasher = (req, res, next) => {
  if (req.user && req.user.role === 'searchwasher') {
    return next(); // Permet l'accès si l'utilisateur est un search washer
  } else {
    return res.status(403).json({ message: 'Accès réservé aux search washers' });
  }
};

// Middleware de sécurité pour les connexions Socket.IO
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (token) {
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         return next(new Error('Token invalid or expired'));
//       }
//       socket.user = decoded;
//       next();
//     });
//   } else {
//     next(new Error('Authentication error'));
//   }
// });