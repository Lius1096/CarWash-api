const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['washer', 'searchwasher'], 
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Email invalide'],
    lowercase: true, // Pour convertir l'email en minuscules avant de le stocker
  },
  password: {
    type: String,
    required: true
  },

  // Champs spécifiques aux personnes physiques (particuliers)
  username: {
    type: String,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    },
    unique: function () {
      return this.role === 'washer' || this.role === 'searchwasher';  // Ajouter condition pour l'unicité uniquement pour ces rôles
    },
  },
  firstName: {
    type: String,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    }
  },
  lastName: {
    type: String,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    }
  },
  age: {
    type: Number,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    }
  },
  gender: {
    type: String,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    }
  },
  residence: {
    type: String,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    }
  },
  phone: {
    type: String,
    required: function () {
      return this.role === 'washer' || this.role === 'searchwasher';
    },
    match: [/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide']
  },

  isActive: {
    type: Boolean,
    default: true
  },

  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
  }
,
averageRating: {
  type: Number,
  default: 0
},
numberOfRatings: {
  type: Number,
  default: 0
},

availableEquipments: {
  type: [String],
  default: [],
  required: function () {
    return this.role === 'washer';
  }
},

bio: {
  type: String,
  /*required: function () {
    return this.role === 'washer';
  },*/
  default: ''
},

profilePhoto: {
  type: String,
  default: ''
},

totalServices: {
  type: Number,
  default: 0
},
totalEarnings: {
  type: Number,
  default: 0
},
totalSpent: {
  type: Number,
  default: 0
}


}, { timestamps: true });

// Création des indices uniques pour les champs email et username
// On fait un index unique conditionnel sur `username` pour les utilisateurs particuliers uniquement
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, partialFilterExpression: { role: { $in: ['washer', 'searchwasher'] } } });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

// Si washer/searchwasher et qu'on n'a pas encore les coordonnées
if ((this.role === 'washer' || this.role === 'searchwasher') &&
(!this.location.latitude || !this.location.longitude)) {

try {
const encodedAddress = encodeURIComponent(this.residence);
const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`);

if (response.data && response.data.length > 0) {
  const loc = response.data[0];
  this.location.latitude = parseFloat(loc.lat);
  this.location.longitude = parseFloat(loc.lon);
} else {
  console.warn('Aucune coordonnée trouvée pour:', this.residence);
}
} catch (err) {
console.error('Erreur de géocodage :', err.message);
}
}

  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error('Erreur de comparaison des mots de passe');
  }
};

// Fonction pour vérifier si l'email ou le nom d'utilisateur existe déjà
userSchema.statics.isEmailOrUsernameTaken = async function (email, username) {
  // Vérification de l'existence d'un utilisateur avec le même email ou le même nom d'utilisateur
  const query = {};
  if (email) query.email = email;
  if (username) query.username = username;

  const existingUser = await this.findOne(query);
  return existingUser;
};

module.exports = mongoose.model('User', userSchema);




