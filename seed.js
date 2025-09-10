const mongoose = require('mongoose');
const { Vehicle, PUCDetails, PetrolPumpVisit, User } = require('./models');
require('dotenv').config();

// Sample data arrays
const MAKES_MODELS = [
  { make: 'Maruti Suzuki', models: ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Ertiga'] },
  { make: 'Hyundai', models: ['i20', 'Creta', 'Verna', 'Venue', 'Alcazar'] },
  { make: 'Tata', models: ['Nexon', 'Altroz', 'Harrier', 'Safari', 'Punch'] },
  { make: 'Honda', models: ['City', 'Amaze', 'Jazz', 'WR-V', 'Elevate'] },
  { make: 'Toyota', models: ['Innova', 'Fortuner', 'Glanza', 'Urban Cruiser', 'Hilux'] }
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'LPG'];
const VEHICLE_CLASSES = ['Two-Wheeler', 'Three-Wheeler', 'Four-Wheeler', 'Commercial', 'Heavy Vehicle'];
const COLORS = ['White', 'Black', 'Red', 'Blue', 'Silver', 'Grey', 'Green', 'Yellow'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan'];
const PETROL_PUMPS = ['Indian Oil', 'Bharat Petroleum', 'Hindustan Petroleum', 'Reliance', 'Shell', 'Nayara'];
const TESTING_CENTERS = [
  'ABC Emission Testing Center',
  'XYZ PUC Center',
  'Green Environment Testing',
  'Quick PUC Services',
  'Auto Care Emission Test'
];

// Generate random registration numbers
function generateRegistrationNumber() {
  const states = ['MH', 'DL', 'KA', 'TN', 'WB', 'TS', 'GJ', 'RJ'];
  const state = states[Math.floor(Math.random() * states.length)];
  const district = Math.floor(Math.random() * 50) + 1;
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${state}${district}${series}${number}`;
}

// Generate random phone number
function generatePhoneNumber() {
  return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Generate random email
function generateEmail(username) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return `${username.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

// Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate sample vehicles
async function createSampleVehicles() {
  const vehicles = [];
  
  for (let i = 0; i < 5; i++) {
    const regNumber = generateRegistrationNumber();
    const makeModel = MAKES_MODELS[Math.floor(Math.random() * MAKES_MODELS.length)];
    
    const vehicle = new Vehicle({
      registrationNumber: regNumber,
      make: makeModel.make,
      model: makeModel.models[Math.floor(Math.random() * makeModel.models.length)],
      variant: ['Base', 'Mid', 'Top', 'ZXi', 'VXi'][Math.floor(Math.random() * 5)],
      yearOfManufacture: 2018 + Math.floor(Math.random() * 6),
      fuelType: FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)],
      engineCC: [998, 1197, 1498, 1998, 2198][Math.floor(Math.random() * 5)],
      seatingCapacity: [2, 4, 5, 7, 9][Math.floor(Math.random() * 5)],
      vehicleClass: VEHICLE_CLASSES[Math.floor(Math.random() * VEHICLE_CLASSES.length)],
      ownerName: ['Rajesh Kumar', 'Priya Singh', 'Amit Sharma', 'Sneha Patel', 'Vikram Malhotra'][i],
      ownerAddress: {
        addressLine1: `${Math.floor(Math.random() * 100) + 1} Main Street`,
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        state: STATES[Math.floor(Math.random() * STATES.length)],
        pincode: Math.floor(100000 + Math.random() * 900000).toString()
      },
      registrationDate: randomDate(new Date(2018, 0, 1), new Date()),
      chassisNumber: 'CH' + Math.floor(10000000000000000 + Math.random() * 90000000000000000).toString(),
      engineNumber: 'EN' + Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      status: 'Active'
    });
    
    vehicles.push(vehicle);
  }
  
  await Vehicle.insertMany(vehicles);
  console.log('✅ 5 sample vehicles created');
  return vehicles;
}

// Generate sample PUC details
async function createSamplePUCDetails(vehicles) {
  const pucDetails = [];
  
  for (const vehicle of vehicles) {
    const puc = new PUCDetails({
      registrationNumber: vehicle.registrationNumber,
      certificateNumber: 'PUC' + Math.floor(1000000 + Math.random() * 9000000).toString(),
      issueDate: randomDate(new Date(2023, 0, 1), new Date()),
      validUntil: randomDate(new Date(), new Date(2024, 11, 31)),
      emissionReadings: {
        co: (Math.random() * 2).toFixed(2),
        hc: Math.floor(50 + Math.random() * 150),
        co2: (1 + Math.random() * 3).toFixed(2),
        opacity: vehicle.fuelType === 'Diesel' ? (Math.random() * 50).toFixed(1) : undefined
      },
      testingCenter: {
        name: TESTING_CENTERS[Math.floor(Math.random() * TESTING_CENTERS.length)],
        address: `${Math.floor(Math.random() * 100) + 1} Test Road, ${vehicle.ownerAddress.city}`,
        licenseNumber: 'TL' + Math.floor(10000 + Math.random() * 90000).toString()
      },
      status: Math.random() > 0.2 ? 'Active' : 'Expired'
    });
    
    pucDetails.push(puc);
  }
  
  await PUCDetails.insertMany(pucDetails);
  console.log('✅ 5 sample PUC details created');
}

// Generate sample petrol pump visits
async function createSamplePetrolPumpVisits(vehicles) {
  const visits = [];
  
  for (const vehicle of vehicles) {
    // Create 2-3 visits per vehicle
    const numVisits = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numVisits; i++) {
      const litres = [5, 10, 15, 20, 25, 30][Math.floor(Math.random() * 6)];
      const pricePerLitre = [95, 96, 97, 98, 99, 100][Math.floor(Math.random() * 6)];
      
      const visit = new PetrolPumpVisit({
        registrationNumber: vehicle.registrationNumber,
        visitDate: randomDate(new Date(2023, 6, 1), new Date()),
        petrolPumpName: PETROL_PUMPS[Math.floor(Math.random() * PETROL_PUMPS.length)],
        petrolPumpLocation: {
          address: `${Math.floor(Math.random() * 100) + 1} Fuel Street`,
          city: vehicle.ownerAddress.city,
          state: vehicle.ownerAddress.state
        },
        fuelType: vehicle.fuelType,
        litresFilled: litres,
        pricePaid: litres * pricePerLitre,
        pricePerLitre: pricePerLitre,
        paymentMethod: ['Cash', 'UPI', 'Card'][Math.floor(Math.random() * 3)],
        odometerReading: Math.floor(5000 + Math.random() * 50000)
      });
      
      visits.push(visit);
    }
  }
  
  await PetrolPumpVisit.insertMany(visits);
  console.log('✅ Sample petrol pump visits created');
}

// Generate sample users
async function createSampleUsers(vehicles) {
  const users = [];
  const usernames = ['rajeshk', 'priyas', 'amits', 'snehap', 'vikramm'];
  
  for (let i = 0; i < 5; i++) {
    const username = usernames[i];
    const phone = generatePhoneNumber();
    
    const user = new User({
      username: username,
      phone: phone,
      email: generateEmail(username),
      password: 'password123', // Will be hashed by pre-save hook
      isVerified: true,
      vehicles: [{
        registrationNumber: vehicles[i].registrationNumber,
        isDefault: true
      }],
      notifications: [
        {
          title: 'Welcome to Vehicle Tracker!',
          message: 'Your account has been successfully created.',
          type: 'success',
          isRead: true
        },
        {
          title: 'PUC Expiry Alert',
          message: `Your PUC for ${vehicles[i].registrationNumber} will expire soon.`,
          type: 'warning',
          isRead: false
        }
      ],
      preferences: {
        emailNotifications: true,
        smsNotifications: Math.random() > 0.5,
        pushNotifications: true
      }
    });
    
    users.push(user);
  }
  
  await User.insertMany(users);
  console.log('✅ 5 sample users created');
}

// Main function to seed all data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ghgtracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🚀 Connected to MongoDB');
    
    // Clear existing data
    await Vehicle.deleteMany({});
    await PUCDetails.deleteMany({});
    await PetrolPumpVisit.deleteMany({});
    await User.deleteMany({});
    
    console.log('🧹 Cleared existing data');
    
    // Create sample data
    const vehicles = await createSampleVehicles();
    await createSamplePUCDetails(vehicles);
    await createSamplePetrolPumpVisits(vehicles);
    await createSampleUsers(vehicles);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Created:');
    console.log('   - 5 Vehicles');
    console.log('   - 5 PUC Details');
    console.log('   - 10-15 Petrol Pump Visits');
    console.log('   - 5 Users');
    
    // Display sample registration numbers for testing
    console.log('\n🔑 Sample Registration Numbers for testing:');
    vehicles.forEach(vehicle => {
      console.log(`   - ${vehicle.registrationNumber}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔗 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seeding script
seedDatabase();