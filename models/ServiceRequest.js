const mongoose = require('mongoose');

// Schéma pour la demande de service
const serviceRequestSchema = new mongoose.Schema(
  {
    washer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Washer',
      default: null
    },

    details: {
      type: String, // texte libre
      required: false,
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Référence à l'utilisateur qui a fait la demande
      required: true
    },
    address: { // Nouvelle propriété pour l'adresse
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    timeRange: {
      type: String,
      required: true
    },
    typeOfService: { // Type de service choisi
      type: String,
      enum: ['lavage', 'nettoyage', 'réparation', 'entretien'],
      required: true
    },
    travelFee: { // Frais de déplacement
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'in_progress', 'completed', 'cancelled', 'accepted', 'rejected', 'assigned'],  // Ajout des nouvelles valeurs
      default: 'available'
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    price: { // Prix total (frais de service + frais de déplacement)
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'pending'
    },
    
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // L'utilisateur qui évalue
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      }
    ],
  },
  { timestamps: true }
);

// Création du modèle ServiceRequest basé sur le schéma
const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
