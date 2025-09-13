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
      const exitSpy = jest.spyOn(process, 'on');
      
      // Re-import the module to trigger event listener registration
      jest.resetModules();
      require('../ProcessCleanupEmitter');
      
      expect(exitSpy).toHaveBeenCalledWith('exit', expect.any(Function));
      exitSpy.mockRestore();
    });

    it('should have SIGINT event listener registered', () => {
      const sigintSpy = jest.spyOn(process, 'on');
      
      // Re-import the module to trigger event listener registration
      jest.resetModules();
      require('../ProcessCleanupEmitter');
      
      expect(sigintSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      sigintSpy.mockRestore();
    });

    it('should have uncaughtException event listener registered', () => {
      const uncaughtSpy = jest.spyOn(process, 'on');
      
      // Re-import the module to trigger event listener registration
      jest.resetModules();
      require('../ProcessCleanupEmitter');
      
      expect(uncaughtSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      uncaughtSpy.mockRestore();
    });
  });

  describe('Exit Event Handler', () => {
    it('should emit cleanup event on exit', () => {
      const emitSpy = jest.spyOn(process, 'emit').mockImplementation(() => true as any);
      
      // Re-import the module to trigger event listener registration
      jest.resetModules();
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
      jest.resetModules();
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
      jest.resetModules();
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
      const onSpy = jest.spyOn(process, 'on');
      
      // Re-import the module multiple times
      jest.resetModules();
      require('../ProcessCleanupEmitter');
      require('../ProcessCleanupEmitter');
      require('../ProcessCleanupEmitter');
      
      // Should register event listeners each time
      expect(onSpy).toHaveBeenCalledWith('exit', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      
      onSpy.mockRestore();
    });
  });
});
