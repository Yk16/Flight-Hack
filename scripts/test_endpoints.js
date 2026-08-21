require('dotenv').config();
const jwt = require('jsonwebtoken');

const BASE = process.env.BASE_URL || 'http://localhost:3001/api/v1';
const secret = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production';

async function run() {
  const payload = { userId: 1, isAdmin: true, isOwner: true, isProvider: true, status: 'VERIFIED' };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  try {
    console.log('Updating flatmate profile...');
    let res = await fetch(`${BASE}/flatmates/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ budget: 20000, lifestyle: ['non-veg'], lookingFor: ['non-smoker'], occupation: 'Engineer', bio: 'Test profile', moveInDate: new Date().toISOString() })
    });
    console.log('Flatmate status:', res.status);
    console.log(await res.json());

    console.log('Creating house listing...');
    res = await fetch(`${BASE}/houses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Test House',
        description: 'Nice place',
        type: 'APARTMENT',
        addressLine1: '123 Test St',
        city: 'TestCity',
        state: 'TestState',
        pincode: '560001',
        rent: 15000,
        deposit: 30000,
        bedrooms: 2,
        bathrooms: 1,
        images: [],
        amenities: ['Water', 'Electricity']
      })
    });
    console.log('House status:', res.status);
    console.log(await res.json());

    console.log('Creating service listing...');
    res = await fetch(`${BASE}/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type: 'MAID', title: 'Test Maid', price: 5000, pricingModel: 'PER_MONTH', images: [] })
    });
    console.log('Service status:', res.status);
    console.log(await res.json());

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
