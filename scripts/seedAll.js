const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PASSWORD_HASH = bcrypt.hashSync('Password123', 12);

// ============================================
// MOCK DATA DEFINITIONS
// ============================================

const ownerUsers = [
  { name: 'Rajesh Sharma', email: 'rajesh.owner@example.com', phone: '+919000000001', gender: 'male', occupation: 'Businessman', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { name: 'Priya Patel', email: 'priya.owner@example.com', phone: '+919000000002', gender: 'female', occupation: 'Real Estate Agent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { name: 'Amit Singh', email: 'amit.owner@example.com', phone: '+919000000003', gender: 'male', occupation: 'Property Investor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { name: 'Neha Gupta', email: 'neha.owner@example.com', phone: '+919000000004', gender: 'female', occupation: 'Interior Designer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { name: 'Vikram Mehta', email: 'vikram.owner@example.com', phone: '+919000000005', gender: 'male', occupation: 'Retired Officer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { name: 'Sunita Reddy', email: 'sunita.owner@example.com', phone: '+919000000006', gender: 'female', occupation: 'Architect', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
];

const providerUsers = [
  { name: 'Quick Clean Services', email: 'quickclean@example.com', phone: '+919100000001', gender: 'male', occupation: 'Cleaning Professional', avatar: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200' },
  { name: 'HomeChef Anitha', email: 'anitha.cook@example.com', phone: '+919100000002', gender: 'female', occupation: 'Professional Cook', avatar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200' },
  { name: 'FreshPress Laundry', email: 'freshpress@example.com', phone: '+919100000003', gender: 'male', occupation: 'Laundry Business Owner', avatar: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200' },
  { name: 'FurnishWale', email: 'furnishwale@example.com', phone: '+919100000004', gender: 'male', occupation: 'Furniture Specialist', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200' },
  { name: 'FixIt Appliances', email: 'fixit@example.com', phone: '+919100000005', gender: 'male', occupation: 'Appliance Technician', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
  { name: 'SparkleHome Deep Clean', email: 'sparklehome@example.com', phone: '+919100000006', gender: 'female', occupation: 'Deep Cleaning Expert', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200' },
  { name: 'TiffinBox Meals', email: 'tiffinbox@example.com', phone: '+919100000007', gender: 'male', occupation: 'Tiffin Service Owner', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200' },
];

const regularUsers = [
  { name: 'Arjun Kumar', email: 'arjun.user@example.com', phone: '+919200000001', gender: 'male', occupation: 'Software Engineer' },
  { name: 'Meera Nair', email: 'meera.user@example.com', phone: '+919200000002', gender: 'female', occupation: 'Doctor' },
  { name: 'Ravi Teja', email: 'ravi.user@example.com', phone: '+919200000003', gender: 'male', occupation: 'Marketing Manager' },
  { name: 'Kavya Iyer', email: 'kavya.user@example.com', phone: '+919200000004', gender: 'female', occupation: 'Data Analyst' },
  { name: 'Deepak Joshi', email: 'deepak.user@example.com', phone: '+919200000005', gender: 'male', occupation: 'Graphic Designer' },
  { name: 'Pooja Banerjee', email: 'pooja.user@example.com', phone: '+919200000006', gender: 'female', occupation: 'Content Writer' },
  { name: 'Karthik Menon', email: 'karthik.user@example.com', phone: '+919200000007', gender: 'male', occupation: 'Finance Analyst' },
  { name: 'Divya Chopra', email: 'divya.user@example.com', phone: '+919200000008', gender: 'female', occupation: 'HR Manager' },
  { name: 'Suresh Pillai', email: 'suresh.user@example.com', phone: '+919200000009', gender: 'male', occupation: 'Civil Engineer' },
  { name: 'Ananya Das', email: 'ananya.user@example.com', phone: '+919200000010', gender: 'female', occupation: 'Lawyer' },
];

const houseListings = [
  // === APARTMENTS ===
  {
    ownerIdx: 0, title: 'Spacious 3BHK in Banjara Hills', type: 'APARTMENT',
    description: 'Beautifully designed 3BHK apartment with panoramic city views, modular kitchen, and premium flooring. Located in the heart of Banjara Hills with easy access to shopping malls, restaurants, and metro station.',
    addressLine1: '45-89 Road No. 10', addressLine2: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034',
    latitude: 17.4156, longitude: 78.4347, rent: 35000, deposit: 100000, maintenanceCharges: 2000,
    bedrooms: 3, bathrooms: 3, area: 1800, floor: 5, totalFloors: 12,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Gym', 'Swimming Pool', 'Power Backup', 'Lift', 'Security', 'Parking', 'Wi-Fi']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),
    preferredTenants: JSON.stringify(['Family', 'Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 0, title: 'Cozy 2BHK nearHITEC City Metro', type: 'APARTMENT',
    description: 'Well-ventilated 2BHK apartment walking distance from HITEC City metro. Ideal for IT professionals. Gated community with 24/7 security and power backup.',
    addressLine1: '12-34 Madhapur', addressLine2: 'Near Cyber Towers', city: 'Hyderabad', state: 'Telangana', pincode: '500081',
    latitude: 17.4486, longitude: 78.3908, rent: 22000, deposit: 66000, maintenanceCharges: 1500,
    bedrooms: 2, bathrooms: 2, area: 1100, floor: 3, totalFloors: 8,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['AC', 'Power Backup', 'Lift', 'Security', 'Parking']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']),
    preferredTenants: JSON.stringify(['Bachelors', 'Family']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 1, title: 'Modern 1BHK in Koramangala', type: 'APARTMENT',
    description: 'Compact and modern 1BHK in the vibrant neighborhood of Koramangala. Walking distance to cafes, pubs, and tech parks. Fully furnished with smart storage solutions.',
    addressLine1: '80 Feet Road', addressLine2: 'Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560034',
    latitude: 12.9352, longitude: 77.6245, rent: 18000, deposit: 54000, maintenanceCharges: 1200,
    bedrooms: 1, bathrooms: 1, area: 650, floor: 2, totalFloors: 5,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Wi-Fi', 'Power Backup', 'Security']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 1, title: 'Luxury 4BHK Penthouse in Indiranagar', type: 'APARTMENT',
    description: 'Premium 4BHK penthouse with a sprawling terrace garden. Imported Italian marble flooring, smart home automation, and a private jacuzzi. Perfect for those who appreciate the finer things in life.',
    addressLine1: '100 Feet Road', addressLine2: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038',
    latitude: 12.9784, longitude: 77.6408, rent: 85000, deposit: 250000, maintenanceCharges: 5000,
    bedrooms: 4, bathrooms: 4, area: 3200, floor: 8, totalFloors: 8,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Gym', 'Swimming Pool', 'Power Backup', 'Lift', 'Security', 'Parking', 'Wi-Fi', 'Jacuzzi', 'Terrace Garden', 'Smart Home']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 2, title: 'Budget-Friendly 2BHK in Andheri West', type: 'APARTMENT',
    description: 'Affordable 2BHK in a well-connected area of Andheri West. Close to the metro station, schools, and hospitals. Ideal for small families or working professionals.',
    addressLine1: 'Link Road', addressLine2: 'Andheri West, Near station', city: 'Mumbai', state: 'Maharashtra', pincode: '400053',
    latitude: 19.1364, longitude: 72.8296, rent: 28000, deposit: 84000, maintenanceCharges: 1800,
    bedrooms: 2, bathrooms: 2, area: 900, floor: 4, totalFloors: 15,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Lift', 'Security', 'Parking', 'Power Backup']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 2, title: 'Sea-View 3BHK in Worli', type: 'APARTMENT',
    description: 'Stunning 3BHK with breathtaking Arabian Sea views. Premium high-rise living with world-class amenities including infinity pool, spa, and concierge services.',
    addressLine1: 'Worli Sea Face', addressLine2: 'Worli', city: 'Mumbai', state: 'Maharashtra', pincode: '400018',
    latitude: 18.9847, longitude: 72.8147, rent: 65000, deposit: 195000, maintenanceCharges: 4000,
    bedrooms: 3, bathrooms: 3, area: 2100, floor: 22, totalFloors: 40,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Gym', 'Swimming Pool', 'Power Backup', 'Lift', 'Security', 'Parking', 'Wi-Fi', 'Spa', 'Concierge', 'Sea View']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: false, status: 'AVAILABLE',
  },
  // === INDEPENDENT HOUSES ===
  {
    ownerIdx: 3, title: 'Charming Independent House in JP Nagar', type: 'INDEPENDENT_HOUSE',
    description: 'Independent 2-story house with a beautiful garden and parking space for 2 cars. Located in a peaceful residential area with parks nearby. Ideal for families who value privacy.',
    addressLine1: '15th Cross', addressLine2: 'JP Nagar 7th Phase', city: 'Bangalore', state: 'Karnataka', pincode: '560078',
    latitude: 12.8850, longitude: 77.5880, rent: 30000, deposit: 90000, maintenanceCharges: 0,
    bedrooms: 3, bathrooms: 3, area: 2000, floor: 0, totalFloors: 2,
    furnishing: 'UNFURNISHED', amenities: JSON.stringify(['Garden', 'Parking', 'Servant Quarter', 'Water Tank']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 3, title: 'Independent House with Lawn in Whitefield', type: 'INDEPENDENT_HOUSE',
    description: 'Spacious independent house with a manicured lawn and covered parking. Well-connected to IT parks via Old Madras Road. Quiet, tree-lined street.',
    addressLine1: '8th Main', addressLine2: 'Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066',
    latitude: 12.9698, longitude: 77.7500, rent: 35000, deposit: 105000, maintenanceCharges: 0,
    bedrooms: 3, bathrooms: 2, area: 2200, floor: 0, totalFloors: 2,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Garden', 'Parking', 'Water Tank', 'Power Backup']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 4, title: 'Heritage House in Old City, Hyderabad', type: 'INDEPENDENT_HOUSE',
    description: 'Restored heritage house with traditional Nizami architecture. High ceilings, ornate wooden doors, and a central courtyard. A piece of history in the heart of the old city.',
    addressLine1: 'Jahanuma', addressLine2: 'Near Charminar', city: 'Hyderabad', state: 'Telangana', pincode: '500002',
    latitude: 17.3616, longitude: 78.4747, rent: 25000, deposit: 75000, maintenanceCharges: 0,
    bedrooms: 2, bathrooms: 2, area: 1800, floor: 0, totalFloors: 2,
    furnishing: 'UNFURNISHED', amenities: JSON.stringify(['Courtyard', 'Heritage Architecture', 'High Ceilings']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: false, status: 'AVAILABLE',
  },
  // === VILLAS ===
  {
    ownerIdx: 4, title: 'Premium Villa in Electronic City', type: 'VILLA',
    description: 'Luxurious independent villa with a private pool, landscaped garden, and home theater. Gated community with clubhouse, tennis court, and jogging track.',
    addressLine1: 'Phase 1', addressLine2: 'Electronic City', city: 'Bangalore', state: 'Karnataka', pincode: '560100',
    latitude: 12.8450, longitude: 77.6600, rent: 75000, deposit: 225000, maintenanceCharges: 3000,
    bedrooms: 4, bathrooms: 4, area: 4500, floor: 0, totalFloors: 3,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'Parking', 'Wi-Fi', 'Home Theater', 'Tennis Court', 'Jogging Track', 'Clubhouse']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 5, title: 'Beach Villa in Candolim, Goa', type: 'VILLA',
    description: 'Stunning beach villa just 200 meters from Candolim Beach. Private pool, BBQ area, and rooftop sit-out with sea views. Perfect for expats and remote workers.',
    addressLine1: 'Candolim', addressLine2: 'Sinquerim Road', city: 'Goa', state: 'Goa', pincode: '403515',
    latitude: 15.5150, longitude: 73.7640, rent: 55000, deposit: 165000, maintenanceCharges: 0,
    bedrooms: 3, bathrooms: 3, area: 2800, floor: 0, totalFloors: 2,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Swimming Pool', 'Security', 'Parking', 'Wi-Fi', 'BBQ Area', 'Sea View', 'Rooftop']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800']),
    preferredTenants: JSON.stringify(['Family', 'Bachelors']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 5, title: 'Mountain View Villa in Ooty', type: 'VILLA',
    description: 'Serene villa with panoramic Nilgiri Mountain views. Stone fireplace, wraparound veranda, and organic garden. A perfect retreat for nature lovers.',
    addressLine1: 'Kelbatty Road', addressLine2: 'Near Botanical Garden', city: 'Ooty', state: 'Tamil Nadu', pincode: '643001',
    latitude: 11.4102, longitude: 76.6950, rent: 30000, deposit: 90000, maintenanceCharges: 500,
    bedrooms: 2, bathrooms: 2, area: 2000, floor: 0, totalFloors: 2,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Fireplace', 'Garden', 'Mountain View', 'Parking', 'Veranda']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800']),
    preferredTenants: JSON.stringify(['Family', 'Bachelors']), petsAllowed: true, status: 'AVAILABLE',
  },
  // === More variety across cities ===
  {
    ownerIdx: 0, title: 'Furnished Studio in Jubilee Hills', type: 'APARTMENT',
    description: 'Sleek studio apartment in upscale Jubilee Hills. Smart home features, walk-in closet, and a private balcony with city views. Walking distance to Film Nagar and Banjara Hills.',
    addressLine1: 'Road No. 36', addressLine2: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033',
    latitude: 17.4326, longitude: 78.4073, rent: 15000, deposit: 45000, maintenanceCharges: 1000,
    bedrooms: 1, bathrooms: 1, area: 550, floor: 6, totalFloors: 10,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Wi-Fi', 'Lift', 'Security', 'Balcony']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 1, title: 'Family 3BHK in HSR Layout', type: 'APARTMENT',
    description: 'Spacious 3BHK in a family-friendly neighborhood. Nearby parks, schools, and shopping complexes. Well-maintained society with children\'s play area.',
    addressLine1: '27th Main', addressLine2: 'HSR Layout Sector 2', city: 'Bangalore', state: 'Karnataka', pincode: '560102',
    latitude: 12.9116, longitude: 77.6389, rent: 25000, deposit: 75000, maintenanceCharges: 1500,
    bedrooms: 3, bathrooms: 2, area: 1400, floor: 4, totalFloors: 8,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Power Backup', 'Lift', 'Security', 'Parking', 'Children Play Area']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 2, title: 'Compact 1BHK in Vashi, Navi Mumbai', type: 'APARTMENT',
    description: 'Affordable 1BHK in Vashi node with good connectivity to Mumbai via local train. Perfect for fresh graduates and young professionals.',
    addressLine1: 'Sector 17', addressLine2: 'Vashi', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703',
    latitude: 19.0750, longitude: 73.0000, rent: 14000, deposit: 42000, maintenanceCharges: 800,
    bedrooms: 1, bathrooms: 1, area: 500, floor: 3, totalFloors: 7,
    furnishing: 'UNFURNISHED', amenities: JSON.stringify(['Lift', 'Security']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 3, title: 'Independent 2BHK in Kothrud, Pune', type: 'INDEPENDENT_HOUSE',
    description: 'Quiet independent house in the residential area of Kothrud. Walking distance to MIT College and Nal Stop. Good natural light and ventilation.',
    addressLine1: 'Karve Road', addressLine2: 'Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038',
    latitude: 18.5074, longitude: 73.8077, rent: 20000, deposit: 60000, maintenanceCharges: 0,
    bedrooms: 2, bathrooms: 2, area: 1200, floor: 1, totalFloors: 2,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Garden', 'Parking', 'Water Tank']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: true, status: 'AVAILABLE',
  },
  {
    ownerIdx: 4, title: 'Row House in Adyar, Chennai', type: 'INDEPENDENT_HOUSE',
    description: 'Charming row house in the leafy neighborhood of Adyar. Close to IIT Madras, Theosophical Society, and Besant Nagar beach. Excellent schools nearby.',
    addressLine1: '2nd Main Road', addressLine2: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020',
    latitude: 13.0063, longitude: 80.2574, rent: 32000, deposit: 96000, maintenanceCharges: 0,
    bedrooms: 3, bathrooms: 2, area: 1600, floor: 0, totalFloors: 2,
    furnishing: 'UNFURNISHED', amenities: JSON.stringify(['Parking', 'Garden', 'Terrace']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 5, title: 'Luxury 2BHK in Salt Lake, Kolkata', type: 'APARTMENT',
    description: 'Modern 2BHK in the planned township of Salt Lake. Close to City Centre mall and Sector V IT hub. Spacious rooms with excellent cross-ventilation.',
    addressLine1: 'BA Block', addressLine2: 'Salt Lake Sector 1', city: 'Kolkata', state: 'West Bengal', pincode: '700064',
    latitude: 22.5804, longitude: 88.4168, rent: 18000, deposit: 54000, maintenanceCharges: 1000,
    bedrooms: 2, bathrooms: 2, area: 1050, floor: 7, totalFloors: 12,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Lift', 'Security', 'Parking', 'Power Backup']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']),
    preferredTenants: JSON.stringify(['Family']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 0, title: 'Affordable 2BHK in Dilsukhnagar', type: 'APARTMENT',
    description: 'Budget-friendly 2BHK near Dilsukhnagar bus stop. Close to schools, colleges, and shopping areas. Well-connected to all parts of the city.',
    addressLine1: 'Chaitanyapuri', addressLine2: 'Dilsukhnagar', city: 'Hyderabad', state: 'Telangana', pincode: '500060',
    latitude: 17.3714, longitude: 78.5269, rent: 12000, deposit: 36000, maintenanceCharges: 500,
    bedrooms: 2, bathrooms: 1, area: 800, floor: 2, totalFloors: 5,
    furnishing: 'UNFURNISHED', amenities: JSON.stringify(['Water Tank', 'Parking']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800']),
    preferredTenants: JSON.stringify(['Family', 'Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 3, title: 'Premium 3BHK in MG Road, Bangalore', type: 'APARTMENT',
    description: 'Premium apartment on MG Road with stunning city skyline views. Walking distance to Cubbon Park, UB City Mall, and fine dining restaurants. Unmatched connectivity.',
    addressLine1: '14 MG Road', addressLine2: 'Near Trinity Metro', city: 'Bangalore', state: 'Karnataka', pincode: '560001',
    latitude: 12.9758, longitude: 77.6068, rent: 45000, deposit: 135000, maintenanceCharges: 3000,
    bedrooms: 3, bathrooms: 3, area: 1900, floor: 15, totalFloors: 20,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['AC', 'Gym', 'Swimming Pool', 'Power Backup', 'Lift', 'Security', 'Parking', 'Wi-Fi', 'Concierge']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800']),
    preferredTenants: JSON.stringify(['Family', 'Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 2, title: 'Cozy 1BHK in Juhu, Mumbai', type: 'APARTMENT',
    description: 'Charming 1BHK in the upscale Juhu area. Minutes from Juhu Beach and celebrity-frequented cafes. A perfect home for those who love Mumbai\'s vibrant culture.',
    addressLine1: '14th Road', addressLine2: 'Juhu', city: 'Mumbai', state: 'Maharashtra', pincode: '400049',
    latitude: 19.1320, longitude: 72.8263, rent: 25000, deposit: 75000, maintenanceCharges: 1500,
    bedrooms: 1, bathrooms: 1, area: 600, floor: 3, totalFloors: 7,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Security', 'Lift', 'Power Backup']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  // === PRIVATE ROOMS ===
  {
    ownerIdx: 0, title: 'Furnished Room in Madhapur', type: 'ROOM',
    description: 'Spacious furnished room in a shared apartment near HITEC City. Includes bed, wardrobe, desk, and high-speed Wi-Fi. Common areas cleaned daily.',
    addressLine1: '32-45 Gachibowli', addressLine2: 'Near Metro Station', city: 'Hyderabad', state: 'Telangana', pincode: '500032',
    latitude: 17.4400, longitude: 78.3489, rent: 8000, deposit: 16000, maintenanceCharges: 500,
    bedrooms: 1, bathrooms: 1, area: 150, floor: 4, totalFloors: 8,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['Wi-Fi', 'AC', 'Laundry', 'Meals Available']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 1, title: 'Single Occupancy Room in Koramangala', type: 'ROOM',
    description: 'Private single room in a vibrant 3BHK flat. Walking distance to 80 Feet Road. Ideal for young professionals. Includes all utilities.',
    addressLine1: '5th Block', addressLine2: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034',
    latitude: 12.9352, longitude: 77.6245, rent: 10000, deposit: 20000, maintenanceCharges: 0,
    bedrooms: 1, bathrooms: 1, area: 120, floor: 2, totalFloors: 4,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['Wi-Fi', 'Power Backup', 'Kitchen Access']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55ez637a486?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 3, title: 'Well-Furnished Room in HSR Layout', type: 'ROOM',
    description: 'Comfortable room in a well-maintained society. Close to HSR Layout BDA Complex. Non-smoker preferred. Common kitchen and living room.',
    addressLine1: '27th Main', addressLine2: 'HSR Layout Sector 1', city: 'Bangalore', state: 'Karnataka', pincode: '560102',
    latitude: 12.9116, longitude: 77.6389, rent: 9000, deposit: 18000, maintenanceCharges: 0,
    bedrooms: 1, bathrooms: 1, area: 130, floor: 3, totalFloors: 5,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Wi-Fi', 'Parking', 'Water Tank']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 4, title: 'Private Room with Balcony in Andheri', type: 'ROOM',
    description: 'Cozy private room with a small balcony in a family-friendly building. Close to Andheri metro. Shared kitchen and washroom.',
    addressLine1: 'MIDC Road', addressLine2: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400093',
    latitude: 19.1197, longitude: 72.8605, rent: 12000, deposit: 24000, maintenanceCharges: 500,
    bedrooms: 1, bathrooms: 1, area: 140, floor: 5, totalFloors: 7,
    furnishing: 'SEMI_FURNISHED', amenities: JSON.stringify(['Balcony', 'Lift', 'Security']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
  {
    ownerIdx: 2, title: 'Shared Room near Vashi Station', type: 'ROOM',
    description: 'Affordable shared room for students and freshers. Walking distance to Vashi station. Includes basic furniture and Wi-Fi.',
    addressLine1: 'Sector 15', addressLine2: 'Near Vashi Station', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703',
    latitude: 19.0750, longitude: 73.0000, rent: 6000, deposit: 12000, maintenanceCharges: 0,
    bedrooms: 1, bathrooms: 1, area: 100, floor: 2, totalFloors: 5,
    furnishing: 'FURNISHED', amenities: JSON.stringify(['Wi-Fi', 'Power Backup']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800']),
    preferredTenants: JSON.stringify(['Bachelors']), petsAllowed: false, status: 'AVAILABLE',
  },
];

const serviceListings = [
  // === MAID SERVICES ===
  {
    providerIdx: 0, type: 'MAID', title: 'Professional House Cleaning',
    description: 'Thorough deep-cleaning service for 1BHK to 4BHK homes. Our trained professionals use eco-friendly products and modern equipment to leave your home spotless.',
    price: 600, pricingModel: 'PER_JOB', city: 'Hyderabad', state: 'Telangana',
    images: ['https://images.unsplash.com/photo-1563453392-de3fee36e75b?w=800'],
  },
  {
    providerIdx: 0, type: 'MAID', title: 'Weekly Home Maintenance',
    description: 'Regular weekly cleaning service that keeps your home consistently tidy. Includes dusting, mopping, kitchen cleaning, and bathroom sanitization.',
    price: 2400, pricingModel: 'PER_MONTH', city: 'Hyderabad', state: 'Telangana',
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb120b948?w=800'],
  },
  {
    providerIdx: 5, type: 'MAID', title: 'Deep Cleaning & Sanitization',
    description: 'Intensive deep-cleaning service that covers every nook and corner. Ideal for move-in/move-out cleaning, post-renovation cleanup, or festival preparation.',
    price: 1500, pricingModel: 'PER_JOB', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'],
  },
  {
    providerIdx: 5, type: 'MAID', title: 'Office & Commercial Cleaning',
    description: 'Professional cleaning solutions for offices, co-working spaces, and commercial establishments. Available for daily, weekly, or monthly contracts.',
    price: 5000, pricingModel: 'PER_MONTH', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800'],
  },
  // === COOK SERVICES ===
  {
    providerIdx: 1, type: 'COOK', title: 'Daily Home Cooking - North Indian',
    description: 'Authentic North Indian home-cooked meals prepared fresh daily. Menu includes roti, rice, dal, sabzi, and salad. Customizable for dietary needs.',
    price: 3500, pricingModel: 'PER_MONTH', city: 'Hyderabad', state: 'Telangana',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    providerIdx: 1, type: 'COOK', title: 'Tiffin Service - South Indian',
    description: 'Wholesome South Indian tiffin service with fresh idli, dosa, sambar, rasam, and rice meals. Perfect for bachelor professionals.',
    price: 3000, pricingModel: 'PER_MONTH', city: 'Hyderabad', state: 'Telangana',
    images: ['https://images.unsplash.com/photo-1567337710282-00832b415979?w=800'],
  },
  {
    providerIdx: 6, type: 'COOK', title: 'TiffinBox Weekly Meal Plan',
    description: 'Pre-portioned meal kits delivered weekly. Choose from vegetarian, non-veg, or mixed menus. Heat and eat convenience with home-style taste.',
    price: 2500, pricingModel: 'PER_MONTH', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1547592180-85f173990554?w=800'],
  },
  {
    providerIdx: 6, type: 'COOK', title: 'Party & Event Catering',
    description: 'Catering services for house parties, birthdays, and small gatherings. Menu customization available. Minimum 20 plates.',
    price: 500, pricingModel: 'PER_JOB', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800'],
  },
  // === LAUNDRY SERVICES ===
  {
    providerIdx: 2, type: 'LAUNDRY', title: 'Wash & Fold Laundry',
    description: 'Convenient wash and fold service with same-day pickup and next-day delivery. Professional detergents and hygienic handling guaranteed.',
    price: 150, pricingModel: 'PER_JOB', city: 'Mumbai', state: 'Maharashtra',
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800'],
  },
  {
    providerIdx: 2, type: 'LAUNDRY', title: 'Premium Dry Cleaning',
    description: 'Expert dry cleaning for suits, sarees, sherwanis, and delicate fabrics. Stain removal specialists with 48-hour turnaround.',
    price: 300, pricingModel: 'PER_JOB', city: 'Mumbai', state: 'Maharashtra',
    images: ['https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800'],
  },
  {
    providerIdx: 2, type: 'LAUNDRY', title: 'Monthly Subscription Plan',
    description: 'Unlimited laundry subscription for individuals and families. Up to 30 kg per month with free pickup and delivery.',
    price: 1500, pricingModel: 'PER_MONTH', city: 'Mumbai', state: 'Maharashtra',
    images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800'],
  },
  // === FURNITURE SERVICES ===
  {
    providerIdx: 3, type: 'FURNITURE', title: 'Full Home Furniture Package',
    description: 'Complete furniture package for 1BHK/2BHK homes. Includes bed, sofa, dining table, wardrobe, and study desk. Available for rent or purchase.',
    price: 8000, pricingModel: 'ONE_TIME', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
  },
  {
    providerIdx: 3, type: 'FURNITURE', title: 'Modular Kitchen Installation',
    description: 'Custom modular kitchen design and installation. Choose from contemporary, classic, or minimalist styles. Free consultation included.',
    price: 35000, pricingModel: 'ONE_TIME', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
  },
  {
    providerIdx: 3, type: 'FURNITURE', title: 'Furniture on Rent - Monthly',
    description: 'Rent premium furniture on a monthly basis. Perfect for temporary stays and expats. Free assembly and disassembly included.',
    price: 3000, pricingModel: 'PER_MONTH', city: 'Pune', state: 'Maharashtra',
    images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'],
  },
  // === APPLIANCE SERVICES ===
  {
    providerIdx: 4, type: 'APPLIANCE', title: 'AC Installation & Repair',
    description: 'Expert air conditioning services including installation, gas refilling, and repair. All major brands supported. Same-day service available.',
    price: 500, pricingModel: 'PER_JOB', city: 'Delhi', state: 'Delhi',
    images: ['https://images.unsplash.com/photo-1631545806615-785ee286f2be?w=800'],
  },
  {
    providerIdx: 4, type: 'APPLIANCE', title: 'Washing Machine Repair',
    description: 'Professional washing machine repair for all brands. Our technicians diagnose and fix issues quickly. 30-day service warranty.',
    price: 400, pricingModel: 'PER_JOB', city: 'Delhi', state: 'Delhi',
    images: ['https://images.unsplash.com/photo-1521656693884-5bc683102579?w=800'],
  },
  {
    providerIdx: 4, type: 'APPLIANCE', title: 'Home Appliance Annual Maintenance',
    description: 'Comprehensive annual maintenance contract for all home appliances. Includes quarterly servicing of AC, fridge, washing machine, and water purifier.',
    price: 4500, pricingModel: 'PER_MONTH', city: 'Delhi', state: 'Delhi',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
  },
  // === ELECTRICIAN SERVICES ===
  {
    providerIdx: 4, type: 'APPLIANCE', title: 'Electrician - Wiring & Repairs',
    description: 'Licensed electrician for all home wiring, fixture installation, switchboard repairs, and MCB/tripping issues. Same-day service in major cities.',
    price: 350, pricingModel: 'PER_JOB', city: 'Hyderabad', state: 'Telangana',
    images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'],
  },
  // === PLUMBER SERVICES ===
  {
    providerIdx: 4, type: 'APPLIANCE', title: 'Plumber - Pipe & Leak Fixes',
    description: 'Professional plumber for pipe leakage, tap installation, bathroom fitting, and water tank issues. Quick response and reliable service.',
    price: 400, pricingModel: 'PER_JOB', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'],
  },
  // === PACKERS & MOVERS ===
  {
    providerIdx: 3, type: 'FURNITURE', title: 'Local Shifting - Within City',
    description: 'Safe and efficient household shifting within the city. Includes packing, loading, transport, and unpacking. Insurance coverage available.',
    price: 3500, pricingModel: 'ONE_TIME', city: 'Hyderabad', state: 'Telangana',
    images: ['https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800'],
  },
  {
    providerIdx: 3, type: 'FURNITURE', title: 'Intercity Relocation - Premium',
    description: 'Door-to-door intercity relocation with premium packing materials. Real-time tracking, dedicated move coordinator, and full insurance.',
    price: 12000, pricingModel: 'ONE_TIME', city: 'Mumbai', state: 'Maharashtra',
    images: ['https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'],
  },
  // === INTERNET SETUP ===
  {
    providerIdx: 4, type: 'APPLIANCE', title: 'Broadband & Wi-Fi Setup',
    description: 'Complete internet setup including router installation, mesh Wi-Fi configuration, and speed optimization. Partners with major ISPs.',
    price: 800, pricingModel: 'ONE_TIME', city: 'Bangalore', state: 'Karnataka',
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'],
  },
  // === DEEP CLEANING ===
  {
    providerIdx: 5, type: 'MAID', title: 'Move-In / Move-Out Deep Clean',
    description: 'Specialized deep cleaning for vacating or moving into a new home. Covers kitchen degreasing, bathroom sanitization, and complete floor scrubbing.',
    price: 2000, pricingModel: 'PER_JOB', city: 'Mumbai', state: 'Maharashtra',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
  },
];

const flatmateProfiles = [
  { userIdx: 6, budget: 15000, lifestyle: ['non-smoker', 'non-vegetarian', 'night-owl'], lookingFor: ['non-smoker', 'working-professional'], occupation: 'Software Engineer', bio: 'Easy-going software engineer looking for a chill flatmate near HSR Layout.', city: 'Bangalore', state: 'Karnataka', preferredLocation: 'HSR Layout' },
  { userIdx: 7, budget: 12000, lifestyle: ['non-smoker', 'vegetarian', 'early-bird'], lookingFor: ['non-smoker', 'quiet'], occupation: 'Doctor', bio: 'Doctor at a nearby hospital. Quiet and respectful of personal space.', city: 'Bangalore', state: 'Karnataka', preferredLocation: 'Koramangala' },
  { userIdx: 8, budget: 18000, lifestyle: ['non-smoker', 'social', 'fitness-enthusiast'], lookingFor: ['non-smoker', 'gym-buddy'], occupation: 'Marketing Manager', bio: 'Social and active. Love hosting movie nights and weekend cookouts.', city: 'Mumbai', state: 'Maharashtra', preferredLocation: 'Andheri West' },
  { userIdx: 9, budget: 10000, lifestyle: ['non-smoker', 'vegetarian', 'studious'], lookingFor: ['quiet', 'non-smoker'], occupation: 'Data Analyst', bio: 'Data nerd who values a clean, quiet space. Will share my snacks!', city: 'Hyderabad', state: 'Telangana', preferredLocation: 'Madhapur' },
  { userIdx: 0, budget: 14000, lifestyle: ['non-smoker', 'creative', 'music-lover'], lookingFor: ['non-smoker', 'creative-type'], occupation: 'Software Engineer', bio: 'Creative soul looking for a like-minded flatmate. I have a guitar.', city: 'Pune', state: 'Maharashtra', preferredLocation: 'Kothrud' },
  { userIdx: 1, budget: 16000, lifestyle: ['non-smoker', 'bookworm', 'tea-addict'], lookingFor: ['non-smoker', 'well-organized'], occupation: 'Doctor', bio: 'Writer by day, binge-watcher by night. Always have chai ready.', city: 'Chennai', state: 'Tamil Nadu', preferredLocation: 'Adyar' },
  { userIdx: 2, budget: 20000, lifestyle: ['non-smoker', 'fitness-enthusiast', 'vegetarian'], lookingFor: ['non-smoker', 'health-conscious'], occupation: 'Marketing Manager', bio: 'Fitness-focused finance guy. Looking for a responsible flatmate.', city: 'Mumbai', state: 'Maharashtra', preferredLocation: 'Worli' },
  { userIdx: 3, budget: 11000, lifestyle: ['non-smoker', 'outgoing', 'animal-lover'], lookingFor: ['non-smoker', 'pet-friendly'], occupation: 'Data Analyst', bio: 'I have a golden retriever looking for a home with another pet lover.', city: 'Delhi', state: 'Delhi', preferredLocation: 'Saket' },
  { userIdx: 4, budget: 13000, lifestyle: ['non-smoker', 'minimalist', 'vegetarian'], lookingFor: ['non-smoker', 'tidy'], occupation: 'Graphic Designer', bio: 'Minimalist who believes less is more. Clean and organized.', city: 'Hyderabad', state: 'Telangana', preferredLocation: 'Banjara Hills' },
  { userIdx: 5, budget: 15000, lifestyle: ['non-smoker', 'social', 'non-vegetarian'], lookingFor: ['non-smoker', 'sociable'], occupation: 'Content Writer', bio: 'Lawyer who loves good food and conversation. Always up for a debate.', city: 'Kolkata', state: 'West Bengal', preferredLocation: 'Salt Lake' },
  { userIdx: 6, budget: 13000, lifestyle: ['non-smoker', 'early-bird', 'fitness-enthusiast'], lookingFor: ['non-smoker', 'gym-buddy'], occupation: 'Finance Analyst', bio: 'Early riser who hits the gym before work. Looking for an equally active flatmate.', city: 'Delhi', state: 'Delhi', preferredLocation: 'Saket' },
  { userIdx: 7, budget: 17000, lifestyle: ['non-smoker', 'bookworm', 'quiet'], lookingFor: ['quiet', 'non-smoker'], occupation: 'HR Manager', bio: 'Avid reader and tea lover. Prefer a calm and organized living space.', city: 'Chennai', state: 'Tamil Nadu', preferredLocation: 'Adyar' },
  { userIdx: 8, budget: 11000, lifestyle: ['non-smoker', 'vegetarian', 'social'], lookingFor: ['non-smoker', 'vegetarian'], occupation: 'Civil Engineer', bio: 'Foodie who loves exploring new cuisines. Happy to share groceries and cooking duties.', city: 'Pune', state: 'Maharashtra', preferredLocation: 'Kothrud' },
  { userIdx: 9, budget: 14000, lifestyle: ['non-smoker', 'music-lover', 'night-owl'], lookingFor: ['non-smoker', 'music-lover'], occupation: 'Lawyer', bio: 'Music enthusiast with a vinyl collection. Looking for someone who appreciates good tunes.', city: 'Hyderabad', state: 'Telangana', preferredLocation: 'Jubilee Hills' },
];

const reviews = [
  { authorIdx: 6, houseIdx: 0, rating: 5, comment: 'Absolutely loved the apartment! The views from the 5th floor are spectacular and the amenities are top-notch. Highly recommend for families.' },
  { authorIdx: 7, houseIdx: 2, rating: 4, comment: 'Great location in Koramangala, perfect for my commute. The furnishing is tasteful and modern. Only wish the parking was more spacious.' },
  { authorIdx: 8, houseIdx: 4, rating: 4, comment: 'Good value for money in Andheri. The metro station is within walking distance which is a huge plus.' },
  { authorIdx: 9, houseIdx: 1, rating: 5, comment: 'The HITEC City location is unbeatable for IT professionals. Well-maintained apartment with responsive maintenance team.' },
  { authorIdx: 0, houseIdx: 6, rating: 5, comment: 'The garden and privacy of this independent house is exactly what my family needed. Peaceful neighborhood.' },
  { authorIdx: 1, houseIdx: 3, rating: 5, comment: 'The penthouse is pure luxury. Smart home features, the jacuzzi, and the terrace garden make it worth every rupee.' },
  { authorIdx: 2, houseIdx: 5, rating: 5, comment: 'Sea view from the living room is breathtaking. The infinity pool and spa are world-class amenities.' },
  { authorIdx: 3, houseIdx: 8, rating: 4, comment: 'Beautiful villa in Electronic City. The pool and clubhouse are amazing. Perfect for a family with kids.' },
  { authorIdx: 4, houseIdx: 10, rating: 4, comment: 'Charming heritage house with so much character. The Nizami architecture is truly unique.' },
  { authorIdx: 5, houseIdx: 11, rating: 5, comment: 'The Goa villa is a dream! Beach proximity, private pool, and the rooftop with sea views is magical.' },
];

// ============================================
// SEED FUNCTION
// ============================================

const PRESERVE_EMAIL = 'kasaryash2005@gmail.com';

async function seed() {
  console.log('Starting comprehensive seed...\n');

  // Find and preserve the user's account
  const preservedUser = await prisma.user.findUnique({ where: { email: PRESERVE_EMAIL } });
  if (preservedUser) {
    console.log(`Preserving account: ${preservedUser.name} (${preservedUser.email})\n`);
  } else {
    console.log(`No account found with email ${PRESERVE_EMAIL}. All data will be wiped.\n`);
  }
  const preserveId = preservedUser?.id;

  // Clean existing data (order matters for foreign keys)
  // If preserving a user, delete their relations first, then delete all users except them
  console.log('Cleaning existing data...');
  if (preserveId) {
    await prisma.review.deleteMany({ where: { authorId: preserveId } });
    await prisma.serviceBooking.deleteMany({ where: { userId: preserveId } });
    await prisma.flatmateProfile.deleteMany({ where: { userId: preserveId } });
    await prisma.message.deleteMany({ where: { senderId: preserveId } });
    await prisma.payment.deleteMany({ where: { userId: preserveId } });
    await prisma.booking.deleteMany({ where: { userId: preserveId } });
    await prisma.auditLog.deleteMany({ where: { userId: preserveId } });
    await prisma.oTPCode.deleteMany({ where: { userId: preserveId } });
    await prisma.refreshToken.deleteMany({ where: { userId: preserveId } });
  }
  await prisma.review.deleteMany();
  await prisma.serviceBooking.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.house.deleteMany();
  await prisma.flatmateProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.oTPCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  if (preserveId) {
    await prisma.user.deleteMany({ where: { id: { not: preserveId } } });
  } else {
    await prisma.user.deleteMany();
  }
  console.log('Done cleaning.\n');

  // 1. Create owner users
  console.log('Creating owner users...');
  const owners = [];
  for (const u of ownerUsers) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: PASSWORD_HASH,
        status: 'VERIFIED',
        isOwner: true,
        gender: u.gender,
        occupation: u.occupation,
        avatar: u.avatar,
        trustScore: 4.0 + Math.random() * 0.9,
        aadhaarVerified: true,
        panVerified: true,
      },
    });
    owners.push(user);
    console.log(`  Created owner: ${user.name} (${user.email})`);
  }

  // 2. Create provider users
  console.log('\nCreating provider users...');
  const providers = [];
  for (const u of providerUsers) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: PASSWORD_HASH,
        status: 'VERIFIED',
        isProvider: true,
        gender: u.gender,
        occupation: u.occupation,
        avatar: u.avatar,
        trustScore: 4.2 + Math.random() * 0.7,
        aadhaarVerified: true,
        panVerified: true,
      },
    });
    providers.push(user);
    console.log(`  Created provider: ${user.name} (${user.email})`);
  }

  // 3. Create regular users
  console.log('\nCreating regular users...');
  const regulars = [];
  for (const u of regularUsers) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: PASSWORD_HASH,
        status: 'VERIFIED',
        gender: u.gender,
        occupation: u.occupation,
        trustScore: 3.5 + Math.random() * 1.5,
      },
    });
    regulars.push(user);
    console.log(`  Created user: ${user.name} (${user.email})`);
  }

  const allUsers = [...owners, ...providers, ...regulars];

  // 4. Create house listings
  console.log('\nCreating house listings...');
  const createdHouses = [];
  for (let i = 0; i < houseListings.length; i++) {
    const h = houseListings[i];
    const owner = owners[h.ownerIdx];
    const house = await prisma.house.create({
      data: {
        ownerId: owner.id,
        title: h.title,
        description: h.description,
        type: h.type,
        addressLine1: h.addressLine1,
        addressLine2: h.addressLine2,
        city: h.city,
        state: h.state,
        pincode: h.pincode,
        latitude: h.latitude,
        longitude: h.longitude,
        rent: h.rent,
        deposit: h.deposit,
        maintenanceCharges: h.maintenanceCharges || 0,
        bedrooms: h.bedrooms,
        bathrooms: h.bathrooms,
        area: h.area,
        floor: h.floor,
        totalFloors: h.totalFloors,
        furnishing: h.furnishing,
        amenities: h.amenities,
        images: h.images,
        preferredTenants: h.preferredTenants,
        petsAllowed: h.petsAllowed,
        status: h.status,
        viewCount: Math.floor(Math.random() * 200) + 10,
        inquiryCount: Math.floor(Math.random() * 20),
      },
    });
    createdHouses.push(house);
    console.log(`  [${i + 1}/${houseListings.length}] Created house: ${house.title} (${house.city})`);
  }

  // 5. Create service listings
  console.log('\nCreating service listings...');
  for (let i = 0; i < serviceListings.length; i++) {
    const s = serviceListings[i];
    const provider = providers[s.providerIdx];
    if (!provider) {
      console.log(`  [${i + 1}/${serviceListings.length}] SKIPPED (no provider at index ${s.providerIdx}): ${s.title}`);
      continue;
    }
    const service = await prisma.serviceProvider.create({
      data: {
        providerId: provider.id,
        type: s.type,
        title: s.title,
        description: s.description,
        price: s.price,
        pricingModel: s.pricingModel,
        images: JSON.stringify(s.images),
        city: s.city,
        state: s.state,
        status: 'APPROVED',
      },
    });
    console.log(`  [${i + 1}/${serviceListings.length}] Created service: ${service.title} (${service.type})`);
  }

  // 6. Create flatmate profiles
  console.log('\nCreating flatmate profiles...');
  for (let i = 0; i < flatmateProfiles.length; i++) {
    const f = flatmateProfiles[i];
    const user = regulars[f.userIdx];
    const profile = await prisma.flatmateProfile.upsert({
      where: { userId: user.id },
      update: {
        budget: f.budget,
        lifestyle: JSON.stringify(f.lifestyle),
        lookingFor: JSON.stringify(f.lookingFor),
        occupation: f.occupation,
        bio: f.bio,
        city: f.city,
        state: f.state,
        preferredLocation: f.preferredLocation,
        moveInDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // Staggered move-in dates
      },
      create: {
        userId: user.id,
        budget: f.budget,
        lifestyle: JSON.stringify(f.lifestyle),
        lookingFor: JSON.stringify(f.lookingFor),
        occupation: f.occupation,
        bio: f.bio,
        city: f.city,
        state: f.state,
        preferredLocation: f.preferredLocation,
        moveInDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000), // Staggered move-in dates
      },
    });
    console.log(`  [${i + 1}/${flatmateProfiles.length}] Created/Updated flatmate: ${user.name} (${f.city})`);
  }

  // 7. Create reviews
  console.log('\nCreating reviews...');
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    const author = regulars[r.authorIdx];
    const house = createdHouses[r.houseIdx];
    const review = await prisma.review.create({
      data: {
        authorId: author.id,
        houseId: house.id,
        rating: r.rating,
        comment: r.comment,
      },
    });
    console.log(`  [${i + 1}/${reviews.length}] Created review by ${author.name} for "${house.title}"`);
  }

  // Summary
  const counts = {
    owners: owners.length,
    providers: providers.length,
    regulars: regulars.length,
    houses: createdHouses.length,
    services: serviceListings.length,
    flatmates: flatmateProfiles.length,
    reviews: reviews.length,
  };

  console.log('\n========================================');
  console.log('SEED COMPLETE!');
  console.log('========================================');
  console.log(`  Owners:        ${counts.owners}`);
  console.log(`  Providers:     ${counts.providers}`);
  console.log(`  Regular Users: ${counts.regulars}`);
  console.log(`  Houses:        ${counts.houses}`);
  console.log(`  Services:      ${counts.services}`);
  console.log(`  Flatmates:     ${counts.flatmates}`);
  console.log(`  Reviews:       ${counts.reviews}`);
  console.log('========================================');
  console.log('\nAll accounts use password: Password123');
  console.log('\nSample owner emails:');
  for (const u of ownerUsers) console.log(`  - ${u.email}`);
  console.log('\nSample provider emails:');
  for (const u of providerUsers) console.log(`  - ${u.email}`);
  console.log('\nSample user emails:');
  for (const u of regularUsers) console.log(`  - ${u.email}`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
