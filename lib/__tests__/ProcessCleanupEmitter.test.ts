import { ProcessCleanupEmitter } from '../ProcessCleanupEmitter';

describe('ProcessCleanupEmitter', () => {
  let originalExit: NodeJS.Process['exit'];
  let originalSIGINT: NodeJS.Process['on'];
  let originalUncaughtException: NodeJS.Process['on'];
  let originalEmit: NodeJS.Process['emit'];
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Store original methods
    originalExit = process.exit;
    originalSIGINT = process.on;
    originalUncaughtException = process.on;
    originalEmit = process.emit;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;

    // Mock console methods
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore original methods
    process.exit = originalExit;
    process.on = originalSIGINT;
    process.on = originalUncaughtException;
    process.emit = originalEmit;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('Module Import', () => {
    it('should export ProcessCleanupEmitter', () => {
      expect(ProcessCleanupEmitter).toBeDefined();
    });
  });

  describe('Process Event Listeners', () => {
    it('should have exit event listener registered', () => {
      // Check if exit event listeners exist
      const exitListeners = process.listeners('exit');
      expect(exitListeners.length).toBeGreaterThan(0);
    });

    it('should have SIGINT event listener registered', () => {
      // Check if SIGINT event listeners exist
      const sigintListeners = process.listeners('SIGINT');
      expect(sigintListeners.length).toBeGreaterThan(0);
    });

    it('should have uncaughtException event listener registered', () => {
      // Check if uncaughtException event listeners exist
      const uncaughtListeners = process.listeners('uncaughtException');
      expect(uncaughtListeners.length).toBeGreaterThan(0);
    });
  });

  describe('Exit Event Handler', () => {
    it('should emit cleanup event on exit', () => {
      const emitSpy = jest.spyOn(process, 'emit').mockImplementation(() => true as any);
      
      // Re-import the module to trigger event listener registration
      if (typeof jest !== 'undefined' && jest.resetModules) {
        jest.resetModules();
      }
      require('../ProcessCleanupEmitter');
      
      // Simulate exit event
      const exitHandlers = process.listeners('exit');
      const exitHandler = exitHandlers[exitHandlers.length - 1] as (code: number) => void;
      exitHandler(0);
      
      expect(emitSpy).toHaveBeenCalledWith('cleanup');
      emitSpy.mockRestore();
    });
  });

  describe('SIGINT Event Handler', () => {
    it('should warn and exit on SIGINT', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      // Re-import the module to trigger event listener registration
      if (typeof jest !== 'undefined' && jest.resetModules) {
        jest.resetModules();
      }
      require('../ProcessCleanupEmitter');
      
      // Simulate SIGINT event
      const sigintHandlers = process.listeners('SIGINT');
      const sigintHandler = sigintHandlers[sigintHandlers.length - 1] as (signal: string) => void;
      
      expect(() => sigintHandler('SIGINT')).toThrow('process.exit called');
      expect(console.warn).toHaveBeenCalledWith('SIGINT');
      expect(exitSpy).toHaveBeenCalledWith(2);
      
      exitSpy.mockRestore();
    });
  });

  describe('Uncaught Exception Handler', () => {
    it('should log error and exit on uncaught exception', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      const testError = new Error('Test uncaught exception');
      
      // Re-import the module to trigger event listener registration
      if (typeof jest !== 'undefined' && jest.resetModules) {
        jest.resetModules();
      }
      require('../ProcessCleanupEmitter');
      
      // Simulate uncaught exception event
      const uncaughtHandlers = process.listeners('uncaughtException');
      const uncaughtHandler = uncaughtHandlers[uncaughtHandlers.length - 1] as (error: Error, origin: string) => void;
      
      expect(() => uncaughtHandler(testError, 'uncaughtException')).toThrow('process.exit called');
      expect(console.error).toHaveBeenCalledWith('Uncaught Exception', testError);
      expect(exitSpy).toHaveBeenCalledWith(99);
      
      exitSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should handle multiple event registrations', () => {
      // Test that the module can be imported multiple times without issues
      expect(() => {
        require('../ProcessCleanupEmitter');
        require('../ProcessCleanupEmitter');
        require('../ProcessCleanupEmitter');
      }).not.toThrow();
    });
  });
});
