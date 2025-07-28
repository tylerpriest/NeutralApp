import request from 'supertest';
import express from 'express';

// Supabase removed - using JWT authentication

// NextAuth removed - using JWT authentication

import { SimpleWebServer } from '../SimpleWebServer';
import { SimpleAPIRouter } from '../SimpleAPIRouter';

// Helper function to safely set environment variables
const setEnvVar = (key: string, value: string) => {
  Object.defineProperty(process.env, key, {
    value,
    writable: true,
    configurable: true
  });
};

describe('API Integration Tests', () => {
  let server: SimpleWebServer;
  let app: any;

  beforeEach(() => {
    setEnvVar('NODE_ENV', 'test');
    setEnvVar('JWT_SECRET', 'test-secret-key-for-jwt-authentication');
    server = new SimpleWebServer();
    app = server.getApp();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/signin', () => {
      it('should login user successfully', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email');
      });

      it('should return 401 for invalid credentials', async () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/signin')
          .send(invalidData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/auth/session', () => {
      it('should return current user session with valid token', async () => {
        // First login to get a token
        const loginResponse = await request(app)
          .post('/api/auth/signin')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });

        const token = loginResponse.body.token;

        const response = await request(app)
          .get('/api/auth/session')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email');
      });

      it('should return 401 without authorization header', async () => {
        const response = await request(app)
          .get('/api/auth/session')
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /api/auth/signout', () => {
      it('should logout user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/signout')
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Successfully signed out');
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should refresh token successfully', async () => {
        // First login to get a token
        const loginResponse = await request(app)
          .post('/api/auth/signin')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });

        const token = loginResponse.body.token;

        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBeTruthy(); // Should return a valid token
      });

      it('should return 401 with invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Plugin Management Endpoints', () => {
    describe('GET /api/plugins', () => {
      it('should return available plugins', async () => {
        const response = await request(app)
          .get('/api/plugins')
          .expect(200);

        expect(response.body).toHaveProperty('available');
        expect(response.body).toHaveProperty('installed');
        expect(Array.isArray(response.body.available)).toBe(true);
        expect(Array.isArray(response.body.installed)).toBe(true);
      });
    });

    describe('POST /api/plugins/install', () => {
      it('should install a plugin successfully', async () => {
        const pluginData = {
          pluginId: 'test-plugin-install',
          version: '1.0.0'
        };

        const response = await request(app)
          .post('/api/plugins/install')
          .send(pluginData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Plugin installed successfully');
        expect(response.body).toHaveProperty('plugin');
        expect(response.body.plugin).toHaveProperty('id', pluginData.pluginId);
        expect(response.body.plugin).toHaveProperty('version', pluginData.version);
      });

      it('should return 400 for invalid plugin data', async () => {
        const invalidData = {
          pluginId: ''
        };

        const response = await request(app)
          .post('/api/plugins/install')
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('DELETE /api/plugins/:pluginId', () => {
      it('should uninstall a plugin successfully', async () => {
        const pluginId = 'test-plugin-uninstall';
        
        // First install the plugin
        await request(app)
          .post('/api/plugins/install')
          .send({ pluginId, version: '1.0.0' })
          .expect(201);

        // Then uninstall it
        const response = await request(app)
          .delete(`/api/plugins/${pluginId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Plugin uninstalled successfully');
        expect(response.body).toHaveProperty('plugin');
        expect(response.body.plugin).toHaveProperty('id', pluginId);
      });

      it('should return 404 for non-existent plugin', async () => {
        const pluginId = 'non-existent-plugin';

        const response = await request(app)
          .delete(`/api/plugins/${pluginId}`)
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('PUT /api/plugins/:pluginId', () => {
      it('should enable/disable a plugin successfully', async () => {
        const pluginId = 'test-plugin';
        
        // First install the plugin
        await request(app)
          .post('/api/plugins/install')
          .send({ pluginId, version: '1.0.0' })
          .expect(201);

        // Then enable it
        const action = { enabled: true };
        const response = await request(app)
          .put(`/api/plugins/${pluginId}`)
          .send(action)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('plugin');
        expect(response.body.plugin).toHaveProperty('id', pluginId);
        expect(response.body.plugin).toHaveProperty('enabled', true);
      });
      
      it('should return 404 for non-existent plugin', async () => {
        const pluginId = 'non-existent-plugin';
        const action = { enabled: true };

        const response = await request(app)
          .put(`/api/plugins/${pluginId}`)
          .send(action)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Plugin not found');
      });
    });
  });

  describe('Settings Management Endpoints', () => {
    describe('GET /api/settings', () => {
      it('should return all settings', async () => {
        const response = await request(app)
          .get('/api/settings')
          .expect(200);

        expect(response.body).toHaveProperty('settings');
        expect(typeof response.body.settings).toBe('object');
      });
    });

    describe('GET /api/settings/:key', () => {
      it('should return specific setting', async () => {
        const key = 'theme';

        const response = await request(app)
          .get(`/api/settings/${key}`)
          .expect(200);

        expect(response.body).toHaveProperty('key', key);
        expect(response.body).toHaveProperty('value');
      });

      it('should return 404 for non-existent setting', async () => {
        const key = 'non-existent-setting';

        const response = await request(app)
          .get(`/api/settings/${key}`)
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('PUT /api/settings/:key', () => {
      it('should update setting successfully', async () => {
        const key = 'theme';
        const value = { mode: 'dark' };

        const response = await request(app)
          .put(`/api/settings/${key}`)
          .send({ value })
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Setting updated successfully');
        expect(response.body).toHaveProperty('setting');
        expect(response.body.setting).toHaveProperty('key', key);
        expect(response.body.setting).toHaveProperty('value', value);
      });

      it('should return 400 for invalid setting value', async () => {
        const key = 'theme';
        const invalidValue = null;

        const response = await request(app)
          .put(`/api/settings/${key}`)
          .send({ value: invalidValue })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('DELETE /api/settings/:key', () => {
      it('should delete setting successfully', async () => {
        const key = 'temp-setting';

        const response = await request(app)
          .delete(`/api/settings/${key}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Setting deleted successfully');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS and Security', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/plugins')
        .set('Origin', 'http://localhost:3001')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/plugins')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });
}); 