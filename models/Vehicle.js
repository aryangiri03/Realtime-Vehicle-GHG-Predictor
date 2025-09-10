const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{1,4}$/, 'Please enter a valid registration number']
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    trim: true
  },
  yearOfManufacture: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
  },
  engineCC: {
    type: Number,
    required: true,
    min: 0
  },
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  vehicleClass: {
    type: String,
    required: true,
    enum: ['Two-Wheeler', 'Three-Wheeler', 'Four-Wheeler', 'Commercial', 'Heavy Vehicle']
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String
  },
  registrationDate: {
    type: Date,
    required: true
  },
  chassisNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  engineNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  color: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Scrapped', 'Stolen', 'Transferred'],
    default: 'Active'
  }
}, {
  timestamps: true
});

vehicleSchema.index({ registrationNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);