// Quick API Test Script
// Run with: node test-api.js (while server is running)

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Southeast Asia Travels API\n');

  // Test 1: Get all destinations
  console.log('1️⃣  Testing GET /destination-list');
  try {
    const response = await fetch(`${BASE_URL}/destination-list`);
    const data = await response.json();
    console.log(`   ✅ Success: ${data.count} destinations retrieved\n`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }

  // Test 2: Get valid destination detail
  console.log('2️⃣  Testing GET /destination-detail/dest-001');
  try {
    const response = await fetch(`${BASE_URL}/destination-detail/dest-001`);
    const data = await response.json();
    console.log(`   ✅ Success: ${data.data.name}\n`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }

  // Test 3: Invalid ID format
  console.log('3️⃣  Testing invalid ID format (400 error)');
  try {
    const response = await fetch(`${BASE_URL}/destination-detail/invalid-id`);
    const data = await response.json();
    console.log(`   ✅ Correctly returned error: ${data.error.code} (${response.status})\n`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }

  // Test 4: Destination not found
  console.log('4️⃣  Testing destination not found (404 error)');
  try {
    const response = await fetch(`${BASE_URL}/destination-detail/dest-999`);
    const data = await response.json();
    console.log(`   ✅ Correctly returned error: ${data.error.code} (${response.status})\n`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }

  console.log('✨ All tests completed!\n');
}

testAPI();
