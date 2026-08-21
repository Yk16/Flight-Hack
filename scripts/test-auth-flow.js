const axios = require('axios');

// Test authentication flow
async function testAuthFlow() {
  const baseURL = 'http://localhost:3000/api'; // Adjust if your backend runs on different port

  try {
    console.log('Testing authentication flow...');

    // Test 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com', // Use a test user email
      password: 'password123' // Use a test password
    });

    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Test 2: Access protected endpoint with valid token
    console.log('\n2. Testing protected endpoint with valid token...');
    const profileResponse = await axios.get(`${baseURL}/flatmate/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile access successful');

    // Test 3: Access protected endpoint with invalid token
    console.log('\n3. Testing protected endpoint with invalid token...');
    try {
      await axios.get(`${baseURL}/flatmate/profile`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('401 error correctly returned for invalid token');
      } else {
        throw error;
      }
    }

    // Test 4: Access protected endpoint without token
    console.log('\n4. Testing protected endpoint without token...');
    try {
      await axios.get(`${baseURL}/flatmate/profile`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('401 error correctly returned for missing token');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All authentication tests passed!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
  }
}

// Test flatmate matching
async function testFlatmateMatching() {
  const baseURL = 'http://localhost:3000/api';

  try {
    console.log('\nTesting flatmate matching...');

    // Login first
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;

    // Test profile creation/update and matching
    console.log('\n1. Testing profile update and matching...');
    const profileData = {
      budget: 1200,
      location: 'New York',
      lifestyle: 'Clean and quiet',
      occupation: 'Software Engineer',
      city: 'New York',
      state: 'NY'
    };

    const updateResponse = await axios.put(`${baseURL}/flatmate/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Profile updated, matches found:', updateResponse.data.matches?.length || 0);

    // Test getting matches
    console.log('\n2. Testing get matches...');
    const matchesResponse = await axios.get(`${baseURL}/flatmate/matches`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Matches retrieved:', matchesResponse.data.length);

    console.log('\n✅ Flatmate matching tests passed!');

  } catch (error) {
    console.error('❌ Flatmate matching test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');

  await testAuthFlow();
  await testFlatmateMatching();

  console.log('\n🏁 All tests completed!');
}

runTests();