// Jest setup file
import 'jest';

// Polyfill TextEncoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill setImmediate for Node.js environment
if (typeof global.setImmediate === 'undefined') {
  (global as any).setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(() => callback(...args), 0);
  };
}

// Global test utilities and mocks can be added here 