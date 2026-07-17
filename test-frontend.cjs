require('dotenv').config({ path: '.env' });
const axios = require('axios');

async function test() {
  const token = 'MOCK_TOKEN'; // We don't have the real token, but we can see if it reaches the backend and gets a 401 instead of a network error.
  try {
    const baseURL = process.env.VITE_API_URL || 'http://localhost:3001';
    console.log("Base URL:", baseURL);
    
    const yfSymbol = "NQ=F";
    const startTime = new Date("2024-06-15").getTime();
    const endTime = startTime + (30 * 24 * 60 * 60 * 1000);
    
    const url = `${baseURL}/api/simulator/market/history?symbol=${encodeURIComponent(yfSymbol)}&start=${new Date(startTime).toISOString()}&end=${new Date(endTime).toISOString()}`;
    console.log("Hitting URL:", url);
    
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error status:", err.response ? err.response.status : 'NO RESPONSE');
    console.log("Error data:", err.response ? err.response.data : err.message);
  }
}

test();
