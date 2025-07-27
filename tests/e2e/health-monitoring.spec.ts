import { test, expect } from '@playwright/test';

test.describe('Health Checks and Monitoring', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  test.describe('Health Check Endpoints', () => {
    test('should return healthy status from /health endpoint', async ({ request }) => {
      const response = await request.get(`${baseUrl}/health`);
      
      expect(response.status()).toBe(200);
      
      const healthData = await response.json();
      expect(healthData).toHaveProperty('status', 'healthy');
      expect(healthData).toHaveProperty('timestamp');
      expect(healthData).toHaveProperty('uptime');
      expect(healthData).toHaveProperty('version');
      expect(healthData).toHaveProperty('architecture');
      expect(healthData).toHaveProperty('environment');
      expect(healthData).toHaveProperty('memory');
      expect(healthData).toHaveProperty('cpu');
      expect(healthData).toHaveProperty('features');
    });

    test('should return healthy status from /api/health endpoint', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/health`);
      
      expect(response.status()).toBe(200);
      
      const apiHealthData = await response.json();
      expect(apiHealthData).toHaveProperty('status', 'healthy');
      expect(apiHealthData).toHaveProperty('timestamp');
      expect(apiHealthData).toHaveProperty('endpoints');
      expect(apiHealthData).toHaveProperty('version');
      expect(apiHealthData).toHaveProperty('uptime');
    });

    test('should return API status from /api/status endpoint', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/status`);
      
      expect(response.status()).toBe(200);
      
      const statusData = await response.json();
      expect(statusData).toHaveProperty('message');
      expect(statusData).toHaveProperty('version');
      expect(statusData).toHaveProperty('timestamp');
      expect(statusData).toHaveProperty('features');
    });
  });

  test.describe('Health Check Response Validation', () => {
    test('should include valid memory usage data', async ({ request }) => {
      const response = await request.get(`${baseUrl}/health`);
      const healthData = await response.json();
      
      expect(healthData.memory).toHaveProperty('used');
      expect(healthData.memory).toHaveProperty('total');
      expect(healthData.memory).toHaveProperty('external');
      
      expect(typeof healthData.memory.used).toBe('number');
      expect(typeof healthData.memory.total).toBe('number');
      expect(typeof healthData.memory.external).toBe('number');
      
      expect(healthData.memory.used).toBeGreaterThan(0);
      expect(healthData.memory.total).toBeGreaterThan(0);
    });

    test('should include valid CPU usage data', async ({ request }) => {
      const response = await request.get(`${baseUrl}/health`);
      const healthData = await response.json();
      
      expect(healthData.cpu).toHaveProperty('usage');
      expect(healthData.cpu).toHaveProperty('uptime');
      
      expect(typeof healthData.cpu.uptime).toBe('number');
      expect(healthData.cpu.uptime).toBeGreaterThan(0);
    });

    test('should include all required features', async ({ request }) => {
      const response = await request.get(`${baseUrl}/health`);
      const healthData = await response.json();
      
      const requiredFeatures = ['auth', 'plugins', 'settings', 'admin', 'logging'];
      
      for (const feature of requiredFeatures) {
        expect(healthData.features).toHaveProperty(feature);
        expect(healthData.features[feature]).toBe('available');
      }
    });

    test('should include valid API endpoints', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/health`);
      const apiHealthData = await response.json();
      
      const requiredEndpoints = ['auth', 'plugins', 'settings', 'admin', 'health'];
      
      for (const endpoint of requiredEndpoints) {
        expect(apiHealthData.endpoints).toHaveProperty(endpoint);
        expect(apiHealthData.endpoints[endpoint]).toMatch(/^\/api\/.*$|^\/health$/);
      }
    });
  });

  test.describe('Health Check Performance', () => {
    test('should respond within acceptable time limit', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${baseUrl}/health`);
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should handle concurrent health check requests', async ({ request }) => {
      const concurrentRequests = 5;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(request.get(`${baseUrl}/health`));
      }
      
      const responses = await Promise.all(promises);
      
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid health check requests gracefully', async ({ request }) => {
      // Test with invalid method
      const response = await request.post(`${baseUrl}/health`);
      expect(response.status()).toBe(404);
    });

    test('should handle malformed requests gracefully', async ({ request }) => {
      // Test with invalid content type
      const response = await request.get(`${baseUrl}/health`, {
        headers: {
          'Content-Type': 'application/xml'
        }
      });
      
      // Should still return JSON response
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });
  });

  test.describe('Monitoring Integration', () => {
    test('should include monitoring-related headers', async ({ request }) => {
      const response = await request.get(`${baseUrl}/health`);
      
      // Check for security headers
      expect(response.headers()).toHaveProperty('x-frame-options');
      expect(response.headers()).toHaveProperty('x-content-type-options');
      
      // Check for caching headers
      expect(response.headers()).toHaveProperty('cache-control');
    });

    test('should provide consistent response format', async ({ request }) => {
      const response1 = await request.get(`${baseUrl}/health`);
      const response2 = await request.get(`${baseUrl}/health`);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Check that required fields are always present
      const requiredFields = ['status', 'timestamp', 'uptime', 'version', 'architecture'];
      
      for (const field of requiredFields) {
        expect(data1).toHaveProperty(field);
        expect(data2).toHaveProperty(field);
      }
      
      // Check that status is always 'healthy'
      expect(data1.status).toBe('healthy');
      expect(data2.status).toBe('healthy');
    });
  });

  test.describe('Health Check Reliability', () => {
    test('should maintain health status under normal load', async ({ request }) => {
      const requests = 10;
      const promises = [];
      
      for (let i = 0; i < requests; i++) {
        promises.push(request.get(`${baseUrl}/health`));
      }
      
      const responses = await Promise.all(promises);
      
      let healthyCount = 0;
      for (const response of responses) {
        if (response.status() === 200) {
          const data = await response.json();
          if (data.status === 'healthy') {
            healthyCount++;
          }
        }
      }
      
      // At least 90% of requests should return healthy status
      const healthRate = healthyCount / requests;
      expect(healthRate).toBeGreaterThan(0.9);
    });

    test('should provide accurate uptime information', async ({ request }) => {
      const response1 = await request.get(`${baseUrl}/health`);
      const data1 = await response1.json();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response2 = await request.get(`${baseUrl}/health`);
      const data2 = await response2.json();
      
      // Uptime should increase
      expect(data2.uptime).toBeGreaterThan(data1.uptime);
      
      // Uptime should be reasonable (not negative, not extremely large)
      expect(data2.uptime).toBeGreaterThan(0);
      expect(data2.uptime).toBeLessThan(86400 * 365); // Less than 1 year
    });
  });
}); 