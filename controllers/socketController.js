// backend/socketController.js
const User = require('../models/User');  // Le modèle User
const { getUserFromToken } = require('../middlewares/authMiddleware');  // Fonction pour obtenir l'utilisateur depuis le token

// Lorsque le searchwasher accepte un washer, envoyer une notification via socket
async function notifyWasherOnAcceptance(socket, washerId) {
  const washer = await User.findById(washerId);
  if (!washer) {
    return socket.emit('error', { message: 'Washer not found' });
  }

  // Émettre un événement de notification vers la room du washer
  socket.to(washerId).emit('washerAccepted', {
    message: 'Vous avez été accepté par un searchwasher !',
    timestamp: new Date(),
  });
}

// Exemple de gestion de l'acceptation d'un washer par un searchwasher
async function handleSearchWasherAcceptance(socket, searchwasherId, washerId) {
  // Effectuer ici toute la logique nécessaire pour l'acceptation du washer
  // Par exemple, mettre à jour un champ 'accepted' dans la base de données
  const washer = await User.findById(washerId);
  if (!washer) {
    return socket.emit('error', { message: 'Washer not found' });
  }

  // Simuler l'acceptation (mettre à jour le statut ou effectuer d'autres actions)
  washer.status = 'accepted';
  await washer.save();

  // Envoyer une notification au washer
  notifyWasherOnAcceptance(socket, washerId);
}

// Logique de connexion et gestion des événements
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Quand un searchwasher accepte un washer
  socket.on('acceptWasher', async (data) => {
    const { searchwasherId, washerId } = data;
    await handleSearchWasherAcceptance(socket, searchwasherId, washerId);
  });

  // Quand un utilisateur se déconnecte
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté');
  });
});
