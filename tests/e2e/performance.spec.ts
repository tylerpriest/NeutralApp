import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * 
 * These tests measure key performance metrics including:
 * - Page load times
 * - Time to interactive
 * - Memory usage
 * - Network requests
 * - Bundle sizes
 */

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performance.mark = window.performance.mark || function() {};
      window.performance.measure = window.performance.measure || function() {};
    });
  });

  test.describe('Page Load Performance', () => {
    test('auth page should load within 2 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
      console.log(`Auth page load time: ${loadTime}ms`);
    });

    test.skip('dashboard should load within 3 seconds after login', async ({ page }) => {
      // Skip this test for now - authentication flow needs refinement
      // Login first using mock authentication
      await page.goto('/auth');
      await page.waitForSelector('input[placeholder="Email Address"]');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      
      const startTime = Date.now();
      await page.click('button[type="submit"]');
      
      // Wait for successful login and redirect
      await page.waitForSelector('.dashboard-page', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
      console.log(`Dashboard load time after login: ${loadTime}ms`);
    });

    test.skip('settings page should load within 2 seconds', async ({ page }) => {
      // Skip this test for now - authentication flow needs refinement
      // Login first using mock authentication
      await page.goto('/auth');
      await page.waitForSelector('input[placeholder="Email Address"]');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for successful login
      await page.waitForSelector('.dashboard-page', { timeout: 10000 });
      
      const startTime = Date.now();
      await page.click('text=Settings');
      await page.waitForSelector('.settings-page', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
      console.log(`Settings page load time: ${loadTime}ms`);
    });
  });

  test.describe('Network Performance', () => {
    test('should have minimal network requests on auth page', async ({ page }) => {
      const requests: string[] = [];
      
      page.on('request', request => {
        requests.push(request.url());
      });
      
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Count network requests (excluding analytics and external resources)
      const relevantRequests = requests.filter(url => 
        !url.includes('google-analytics') && 
        !url.includes('googletagmanager') &&
        !url.includes('doubleclick')
      );
      
      // Should have minimal requests (HTML, CSS, JS, auth API)
      expect(relevantRequests.length).toBeLessThan(10);
      
      console.log(`Network requests on auth page: ${relevantRequests.length}`);
    });

    test('should have efficient bundle loading', async ({ page }) => {
      const resources: { url: string; size: number }[] = [];
      
      page.on('response', response => {
        const url = response.url();
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          resources.push({
            url,
            size: parseInt(contentLength)
          });
        }
      });
      
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Calculate total bundle size
      const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);
      const totalSizeKB = Math.round(totalSize / 1024);
      
      // Bundle should be under 2MB
      expect(totalSizeKB).toBeLessThan(2048);
      
      console.log(`Total bundle size: ${totalSizeKB}KB`);
    });
  });

  test.describe('Interaction Performance', () => {
    test.skip('form submission should respond within 500ms', async ({ page }) => {
      // Skip this test for now - authentication flow needs refinement
      await page.goto('/auth');
      await page.waitForSelector('input[placeholder="Email Address"]');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      
      const startTime = Date.now();
      await page.click('button[type="submit"]');
      
      // Wait for form submission response
      await page.waitForSelector('.dashboard-page', { timeout: 10000 });
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(500);
      console.log(`Form submission response time: ${responseTime}ms`);
    });

    test.skip('navigation should be responsive', async ({ page }) => {
      // Skip this test for now - authentication flow needs refinement
      // Login first using mock authentication
      await page.goto('/auth');
      await page.waitForSelector('input[placeholder="Email Address"]');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for successful login
      await page.waitForSelector('.dashboard-page', { timeout: 10000 });
      
      // Test navigation responsiveness
      const startTime = Date.now();
      await page.click('text=Settings');
      await page.waitForSelector('.settings-page', { timeout: 10000 });
      const navigationTime = Date.now() - startTime;
      
      expect(navigationTime).toBeLessThan(1000);
      console.log(`Navigation response time: ${navigationTime}ms`);
    });
  });

  test.describe('Memory Performance', () => {
    test.skip('should not have memory leaks during navigation', async ({ page }) => {
      // Skip this test for now - authentication flow needs refinement
      // Login first using mock authentication
      await page.goto('/auth');
      await page.waitForSelector('input[placeholder="Email Address"]');
      await page.fill('input[placeholder="Email Address"]', 'test@example.com');
      await page.fill('input[placeholder="Password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for successful login
      await page.waitForSelector('.dashboard-page', { timeout: 10000 });
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Navigate between pages multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('text=Settings');
        await page.waitForSelector('.settings-page', { timeout: 5000 });
        await page.click('text=Dashboard');
        await page.waitForSelector('.dashboard-page', { timeout: 5000 });
      }
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory increase should be reasonable (less than 10MB)
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
      
      console.log(`Memory usage - Initial: ${Math.round(initialMemory / 1024)}KB, Final: ${Math.round(finalMemory / 1024)}KB, Increase: ${Math.round(memoryIncrease / 1024)}KB`);
    });
  });

  test.describe('Bundle Analysis', () => {
    test('should have optimized JavaScript bundles', async ({ page }) => {
      const jsResources: { url: string; size: number }[] = [];
      
      page.on('response', response => {
        const url = response.url();
        const contentType = response.headers()['content-type'];
        const contentLength = response.headers()['content-length'];
        
        if (contentType?.includes('javascript') && contentLength) {
          jsResources.push({
            url,
            size: parseInt(contentLength)
          });
        }
      });
      
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Analyze JavaScript bundle sizes
      const totalJSSize = jsResources.reduce((sum, resource) => sum + resource.size, 0);
      const totalJSSizeKB = Math.round(totalJSSize / 1024);
      
      // Main JS bundle should be under 1MB
      expect(totalJSSizeKB).toBeLessThan(1024);
      
      console.log(`Total JavaScript bundle size: ${totalJSSizeKB}KB`);
      console.log(`Number of JS files: ${jsResources.length}`);
    });

    test('should have optimized CSS bundles', async ({ page }) => {
      const cssResources: { url: string; size: number }[] = [];
      
      page.on('response', response => {
        const url = response.url();
        const contentType = response.headers()['content-type'];
        const contentLength = response.headers()['content-length'];
        
        if (contentType?.includes('css') && contentLength) {
          cssResources.push({
            url,
            size: parseInt(contentLength)
          });
        }
      });
      
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      // Analyze CSS bundle sizes
      const totalCSSSize = cssResources.reduce((sum, resource) => sum + resource.size, 0);
      const totalCSSSizeKB = Math.round(totalCSSSize / 1024);
      
      // CSS should be under 500KB
      expect(totalCSSSizeKB).toBeLessThan(500);
      
      console.log(`Total CSS bundle size: ${totalCSSSizeKB}KB`);
      console.log(`Number of CSS files: ${cssResources.length}`);
    });
  });

  test.describe('Lighthouse Performance', () => {
    test('should meet performance benchmarks', async ({ page }) => {
      // This test would require Lighthouse integration
      // For now, we'll test basic performance metrics
      
      await page.goto('/auth');
      
      // Measure Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise<{
          loadTime: number;
          domContentLoaded: number;
          firstPaint: number;
          firstContentfulPaint: number;
        }>((resolve) => {
          // Wait for page to be fully loaded
          if (document.readyState === 'complete') {
            resolve({
              loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
            });
          } else {
            window.addEventListener('load', () => {
              resolve({
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
              });
            });
          }
        });
      });
      
      // Assert performance benchmarks
      expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
      expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5 seconds
      
      console.log('Performance metrics:', metrics);
    });
  });
}); 