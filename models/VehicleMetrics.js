// models/VehicleMetrics.js
const mongoose = require('mongoose');

const vehicleMetricsSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
  forMonth: { type: String, required: true, index: true }, // "YYYY-MM"
  totalFuelThisMonth: { type: Number, default: 0 }, // liters
  refuelCountThisMonth: { type: Number, default: 0 },
  avgRefuelLitresThisMonth: { type: Number, default: 0 },
  totalDistanceThisMonth: { type: Number, default: 0 },
  avgDailyDistanceThisMonth: { type: Number, default: 0 },
  fuelConsumptionConsistency: { type: Number, default: 0 }, // std dev of refuels
  lastOdometerReading: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

vehicleMetricsSchema.index({ registrationNumber: 1, forMonth: 1 }, { unique: true });

module.exports = mongoose.model('VehicleMetrics', vehicleMetricsSchema);
