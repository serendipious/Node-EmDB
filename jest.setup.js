// Jest setup file
// This file runs before each test file

// Increase timeout for file operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};
