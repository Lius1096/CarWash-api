//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/*const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['washer', 'searchwasher', 'washer_company', 'searchwasher_company', 'admin'],
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

  // Champs spécifiques aux entreprises
  companyName: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    }
  },
  companyAddress: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    }
  },
  companyPhone: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    },
    match: [/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide']
  },
  businessType: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    }
  },
  companyWebsite: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    },
    match: [/^(https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,6}(\.[a-z]{2})?(\/[\w-]*)*$/, 'Site web invalide']
  },

  isActive: {
    type: Boolean,
    default: true
  },

  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false }
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


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['washer', 'searchwasher', 'washer_company', 'searchwasher_company', 'admin'],
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Email invalide'],
    lowercase: true,
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
      return this.role === 'washer' || this.role === 'searchwasher';
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

  // Champs spécifiques aux entreprises
  companyName: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    }
  },
  companyAddress: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    }
  },
  companyPhone: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    },
    match: [/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide']
  },
  businessType: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    }
  },
  companyWebsite: {
    type: String,
    required: function () {
      return this.role === 'washer_company' || this.role === 'searchwasher_company';
    },
    match: [/^(https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,6}(\.[a-z]{2})?(\/[\w-]*)*$/, 'Site web invalide']
  },

  // Champs supplémentaires
  status: {
    type: String,
    enum: ['actif', 'en attente', 'suspendu', 'validé'],
    default: 'en attente'
  },
  statusChangedAt: {
    type: Date,
    default: Date.now
  },

  // Validation de l'email
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Services totaux et dépenses
  totalServices: {
    type: Number,
    default: 0
  },
  pendingServices: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },

  // Services récents
  recentServices: [{
    serviceName: String,
    carModel: String,
    status: String
  }],

  isActive: {
    type: Boolean,
    default: true
  },

  // Sécurité supplémentaire
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },

  securityQuestions: [{
    question: String,
    answer: String
  }],

  // Historique de connexion
  lastLogin: {
    type: Date
  },

  loginHistory: [{
    date: { type: Date, default: Date.now },
    ipAddress: { type: String },
  }],

  adminPermissions: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });

// Création des indices uniques pour les champs email et username
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, partialFilterExpression: { role: { $in: ['washer', 'searchwasher'] } } });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
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
  const query = {};
  if (email) query.email = email;
  if (username) query.username = username;

  const existingUser = await this.findOne(query);
  return existingUser;
};

module.exports = mongoose.model('User', userSchema);
*/