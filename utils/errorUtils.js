// Gestion des erreurs
const handleError = (res, err) => {
    console.error(err);
    if (err.message.includes('Erreur')) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(400).json({ message: 'Une erreur est survenue, veuillez réessayer plus tard.' });
  };
  
  module.exports = { handleError };
  