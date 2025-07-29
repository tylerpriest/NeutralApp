#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Get the deployment URL from command line or use a default
const deploymentUrl = process.argv[2] || 'https://neutral-app-tyler.vercel.app';

console.log(`Testing Vercel API endpoints at: ${deploymentUrl}`);
console.log('=' .repeat(50));

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-API-Test/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            isJson: true
          });
        } catch (error) {
          // Not JSON, return as text
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            isJson: false
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(path, method = 'GET', data = null) {
  const url = `${deploymentUrl}${path}`;
  console.log(`\nTesting: ${method} ${path}`);
  console.log(`URL: ${url}`);
  
  try {
    const result = await makeRequest(url, method, data);
    
    console.log(`Status: ${result.status}`);
    console.log(`Content-Type: ${result.headers['content-type'] || 'Not set'}`);
    
    if (result.isJson) {
      console.log('✅ Response is valid JSON');
      console.log('Data:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Response is NOT JSON');
      console.log('Response preview:', result.data.substring(0, 200) + (result.data.length > 200 ? '...' : ''));
      
      if (result.data.includes('<html') || result.data.includes('<!DOCTYPE')) {
        console.log('⚠️  Response appears to be HTML - this is likely a 404 page');
      }
    }
    
    return result;
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test health endpoint
  await testEndpoint('/health');
  
  // Test API status
  await testEndpoint('/api/status');
  
  // Test dashboard widgets
  await testEndpoint('/api/dashboard/widgets');
  
  // Test auth endpoints
  await testEndpoint('/api/auth/session');
  
  // Test plugin endpoints
  await testEndpoint('/api/plugins');
  
  // Test admin endpoints
  await testEndpoint('/api/admin/health');
  
  // Test a non-existent endpoint to see what happens
  await testEndpoint('/api/nonexistent');
  
  console.log('\n' + '=' .repeat(50));
  console.log('API testing completed!');
}

runTests().catch(console.error); 