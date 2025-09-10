const mongoose = require('mongoose');

const petrolPumpVisitSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  petrolPumpName: {
    type: String,
    required: true,
    trim: true
  },
  petrolPumpLocation: {
    address: String,
    city: String,
    state: String
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'CNG', 'LPG']
  },
  litresFilled: {
    type: Number,
    required: true,
    min: 0.1
  },
  pricePaid: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerLitre: {
    type: Number,
    required: true,
    min: 1
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Wallet'],
    default: 'Cash'
  },
  odometerReading: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

petrolPumpVisitSchema.index({ registrationNumber: 1, visitDate: -1 });
petrolPumpVisitSchema.index({ visitDate: 1 });

module.exports = mongoose.model('PetrolPumpVisit', petrolPumpVisitSchema);