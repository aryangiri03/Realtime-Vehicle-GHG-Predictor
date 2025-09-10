const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// At the top of server.js, make sure you have:
const { Vehicle, PUCDetails, PetrolPumpVisit, User } = require('./models');
// const { Vehicle } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghgtracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));


app.get('/api/vehicle/:regNumber', async (req, res) => {
  try {
    const { regNumber } = req.params;
    

    const regNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{1,4}$/;
    if (!regNumberRegex.test(regNumber.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle registration number format'
      });
    }


    const vehicle = await Vehicle.findOne({ 
      registrationNumber: regNumber.toUpperCase().trim() 
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found in database'
      });
    }


    res.json({
      success: true,
      data: {
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        yearOfManufacture: vehicle.yearOfManufacture,
        fuelType: vehicle.fuelType,
        engineCC: vehicle.engineCC,
        seatingCapacity: vehicle.seatingCapacity,
        vehicleClass: vehicle.vehicleClass,
        ownerName: vehicle.ownerName,
        ownerAddress: vehicle.ownerAddress,
        registrationDate: vehicle.registrationDate,
        chassisNumber: vehicle.chassisNumber,
        engineNumber: vehicle.engineNumber,
        color: vehicle.color,
        status: vehicle.status
      }
    });

  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});



app.get('/api/vehicle-features/:regNumber', async (req, res) => {
  try {
    const { regNumber } = req.params;
    
    
    const regNumberRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{1,4}$/;
    if (!regNumberRegex.test(regNumber.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle registration number format'
      });
    }

    const formattedRegNumber = regNumber.toUpperCase().trim();

    const vehicle = await Vehicle.findOne({ registrationNumber: formattedRegNumber });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found in database'
      });
    }

    const pucDetails = await PUCDetails.findOne({
      registrationNumber: formattedRegNumber,
      status: 'Active'
    }).sort({ validUntil: -1 });


    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const visits = await PetrolPumpVisit.find({
      registrationNumber: formattedRegNumber,
      visitDate: { $gte: sixtyDaysAgo }
    }).sort({ visitDate: 1 });

    // Calculate derived features
    const features = await calculateVehicleFeatures(vehicle, pucDetails, visits);
    
    res.json({
      success: true,
      registrationNumber: formattedRegNumber,
      features: features
    });

  } catch (error) {
    console.error('Error fetching vehicle features:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Feature calculation function
async function calculateVehicleFeatures(vehicle, pucDetails, visits) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  // 1. Vehicle Technical Specifications
  const vehicleAge = currentDate.getFullYear() - vehicle.yearOfManufacture;
  
  // 2. PUC Emission Readings
  let pucCO = null, pucHC = null, pucCO2 = null, daysSinceLastPUC = null;
  if (pucDetails) {
    pucCO = pucDetails.emissionReadings?.co || null;
    pucHC = pucDetails.emissionReadings?.hc || null;
    pucCO2 = pucDetails.emissionReadings?.co2 || null;
    daysSinceLastPUC = Math.floor((currentDate - pucDetails.issueDate) / (1000 * 60 * 60 * 24));
  }

  // 3. Fuel Consumption Patterns
  let monthlyFuelConsumption = 0;
  let avgDaysBetweenRefuels = 0;
  let fuelConsumptionConsistency = 0;
  let refuelingFrequency = 0;
  let avgRefuelQuantity = 0;
  
  if (visits.length > 0) {
    // Monthly fuel consumption (extrapolate from available data)
    const totalFuel = visits.reduce((sum, visit) => sum + visit.litresFilled, 0);
    const daysOfData = (currentDate - visits[0].visitDate) / (1000 * 60 * 60 * 24);
    monthlyFuelConsumption = totalFuel * (30 / Math.max(1, daysOfData));
    
    // Refueling patterns
    const refuelQuantities = visits.map(v => v.litresFilled);
    avgRefuelQuantity = refuelQuantities.reduce((a, b) => a + b, 0) / refuelQuantities.length;
    
    // Calculate days between refuels
    const refuelIntervals = [];
    for (let i = 1; i < visits.length; i++) {
      const daysBetween = (visits[i].visitDate - visits[i-1].visitDate) / (1000 * 60 * 60 * 24);
      refuelIntervals.push(daysBetween);
    }
    
    if (refuelIntervals.length > 0) {
      avgDaysBetweenRefuels = refuelIntervals.reduce((a, b) => a + b, 0) / refuelIntervals.length;
      fuelConsumptionConsistency = calculateStandardDeviation(refuelQuantities);
      refuelingFrequency = visits.length / Math.max(1, daysOfData / 30); // visits per month
    }
  }

  // 4. Driving Behavior Inference
  let avgDailyDistance = 0;
  let drivingIntensityIndex = 0;
  
  // Estimate distance using average fuel efficiency
  const avgFuelEfficiency = getAverageFuelEfficiency(vehicle.make, vehicle.model, vehicle.fuelType);
  if (avgFuelEfficiency && monthlyFuelConsumption > 0) {
    avgDailyDistance = (monthlyFuelConsumption * avgFuelEfficiency) / 30;
    drivingIntensityIndex = (avgDailyDistance * monthlyFuelConsumption) / vehicle.engineCC;
  }

  // 5. Temporal and Seasonal Features
  const season = getSeason(currentMonth);
  const isWeekendRefuel = visits.length > 0 ? 
    isWeekend(visits[visits.length - 1].visitDate) : false;

  // 6. Geographical Features
  const city = vehicle.ownerAddress?.city || 'Unknown';
  const trafficCongestionIndex = getTrafficCongestionIndex(city);

  // 7. Vehicle Maintenance Score (0-100)
  const vehicleMaintenanceScore = calculateMaintenanceScore(
    vehicleAge, 
    pucCO, 
    pucHC, 
    daysSinceLastPUC
  );

  // 8. Driving Style Aggressiveness (0-100)
  const drivingStyleAggressiveness = calculateDrivingAggressiveness(
    fuelConsumptionConsistency,
    avgDaysBetweenRefuels,
    refuelingFrequency
  );

  return {
    // Vehicle Technical Specifications
    vehicle_id: vehicle.registrationNumber,
    make: vehicle.make,
    model: vehicle.model,
    vehicle_age: vehicleAge,
    engine_cc: vehicle.engineCC,
    fuel_type: vehicle.fuelType,
    seating_capacity: vehicle.seatingCapacity,

    // PUC Emission Readings
    puc_co_reading: pucCO,
    puc_hc_reading: pucHC,
    puc_co2_reading: pucCO2,
    days_since_last_puc: daysSinceLastPUC,

    // Fuel Consumption Patterns
    monthly_fuel_consumption: Math.round(monthlyFuelConsumption * 100) / 100,
    avg_days_between_refuels: Math.round(avgDaysBetweenRefuels * 100) / 100,
    fuel_consumption_consistency: Math.round(fuelConsumptionConsistency * 100) / 100,
    refueling_frequency: Math.round(refuelingFrequency * 100) / 100,
    avg_refuel_quantity: Math.round(avgRefuelQuantity * 100) / 100,

    // Driving Behavior
    avg_daily_distance: Math.round(avgDailyDistance * 100) / 100,
    driving_intensity_index: Math.round(drivingIntensityIndex * 100) / 100,

    // Temporal Features
    month: currentMonth,
    season: season,
    is_weekend_refuel: isWeekendRefuel,

    // Geographical Features
    city: city,
    traffic_congestion_index: trafficCongestionIndex,

    // Calculated Scores
    vehicle_maintenance_score: Math.round(vehicleMaintenanceScore * 100) / 100,
    driving_style_aggressiveness: Math.round(drivingStyleAggressiveness * 100) / 100
  };
}

// Helper functions
function calculateStandardDeviation(arr) {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b) / arr.length;
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / arr.length);
}

function getAverageFuelEfficiency(make, model, fuelType) {
  // Mock data - replace with actual efficiency database
  const efficiencyMap = {
    'Petrol': { 'Maruti Suzuki': 18, 'Hyundai': 17, 'Tata': 16, 'Honda': 19, 'Toyota': 18 },
    'Diesel': { 'Maruti Suzuki': 22, 'Hyundai': 21, 'Tata': 20, 'Honda': 23, 'Toyota': 22 },
    'CNG': { 'Maruti Suzuki': 25, 'Hyundai': 24, 'Tata': 23, 'Honda': 26, 'Toyota': 25 }
  };
  return efficiencyMap[fuelType]?.[make] || 
         (fuelType === 'Petrol' ? 17 : fuelType === 'Diesel' ? 21 : 24);
}

function getSeason(month) {
  if (month >= 3 && month <= 5) return 'summer';
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 10 && month <= 11) return 'autumn';
  return 'winter';
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getTrafficCongestionIndex(city) {
  // Mock data - replace with actual traffic data API
  const trafficIndex = {
    'Mumbai': 75, 'Delhi': 80, 'Bangalore': 70, 
    'Chennai': 65, 'Kolkata': 60, 'Hyderabad': 68,
    'Pune': 62, 'Ahmedabad': 58
  };
  return trafficIndex[city] || 50;
}

function calculateMaintenanceScore(age, coReading, hcReading, daysSincePUC) {
  let score = 100;
  
  // Penalize for age
  score -= Math.min(age * 2, 30);
  
  // Penalize for poor emission readings
  if (coReading !== null) score -= Math.min((coReading / 0.5) * 10, 20);
  if (hcReading !== null) score -= Math.min((hcReading / 200) * 10, 20);
  
  // Penalize for overdue PUC
  if (daysSincePUC !== null && daysSincePUC > 365) {
    score -= Math.min((daysSincePUC - 365) / 30 * 5, 30);
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateDrivingAggressiveness(consistency, avgDays, frequency) {  
  let score = 50;
  
  if (consistency > 0) score -= Math.min(consistency * 5, 20);
  if (frequency > 0) score += Math.min(frequency * 10, 30);
  if (avgDays > 0 && avgDays < 7) score += Math.min((7 - avgDays) * 5, 20);
  
  return Math.max(0, Math.min(100, score));
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});




process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});