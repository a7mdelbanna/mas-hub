// Simple script to test if login page loads
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (data.includes('root')) {
      console.log('✅ Root element found');
    }
    if (data.includes('main.tsx')) {
      console.log('✅ React app script found');
    }
    if (res.statusCode === 200) {
      console.log('✅ App is loading successfully');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error accessing app:', error.message);
});

req.end();