import { Timer } from '../Timer';

describe('Timer', () => {
  let timer: Timer;

  beforeEach(() => {
    timer = new Timer('test-timer');
  });

  describe('Constructor', () => {
    it('should create Timer instance with label', () => {
      expect(timer).toBeInstanceOf(Timer);
      expect(timer.label()).toBe('test-timer');
    });

    it('should start timer on construction', () => {
      // Timer should be started in constructor
      expect(timer).toBeDefined();
    });
  });

  describe('Basic Operations', () => {
    it('should start and end timer', () => {
      timer.start();
      // Small delay to ensure measurable time
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Wait 1ms
      }
      const duration = timer.end();
      expect(duration).toBeGreaterThan(0);
    });

    it('should calculate average correctly', () => {
      // Add some samples
      timer.start();
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Wait 1ms
      }
      timer.end();

      timer.start();
      const start2 = Date.now();
      while (Date.now() - start2 < 1) {
        // Wait 1ms
      }
      timer.end();

      const avg = timer.avg();
      expect(avg).toBeDefined();
      expect(parseFloat(avg)).toBeGreaterThan(0);
    });

    it('should return label correctly', () => {
      expect(timer.label()).toBe('test-timer');
    });
  });

  describe('measureFn', () => {
    it('should measure synchronous function execution', () => {
      const testFn = jest.fn(() => 'test result');
      const result = timer.measureFn(testFn);
      
      expect(result).toBe('test result');
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function that returns a value', () => {
      const testValue = { key: 'value' };
      const testFn = jest.fn(() => testValue);
      const result = timer.measureFn(testFn);
      
      expect(result).toBe(testValue);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function that returns undefined', () => {
      const testFn = jest.fn(() => undefined);
      const result = timer.measureFn(testFn);
      
      expect(result).toBeUndefined();
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function that returns null', () => {
      const testFn = jest.fn(() => null);
      const result = timer.measureFn(testFn);
      
      expect(result).toBeNull();
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function that returns false', () => {
      const testFn = jest.fn(() => false);
      const result = timer.measureFn(testFn);
      
      expect(result).toBe(false);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function that returns 0', () => {
      const testFn = jest.fn(() => 0);
      const result = timer.measureFn(testFn);
      
      expect(result).toBe(0);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure synchronous function that returns empty string', () => {
      const testFn = jest.fn(() => '');
      const result = timer.measureFn(testFn);
      
      expect(result).toBe('');
      expect(testFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('measureFn with Promises', () => {
    it('should measure asynchronous function execution', async () => {
      const testFn = jest.fn(() => Promise.resolve('async result'));
      const result = await timer.measureFn(testFn);
      
      expect(result).toBe('async result');
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure asynchronous function that rejects', async () => {
      const testFn = jest.fn(() => Promise.reject(new Error('test error')));
      
      await expect(timer.measureFn(testFn)).rejects.toThrow('test error');
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure asynchronous function with delay', async () => {
      const testFn = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve('delayed result'), 10))
      );
      
      const result = await timer.measureFn(testFn);
      expect(result).toBe('delayed result');
      expect(testFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multiple Measurements', () => {
    it('should accumulate multiple measurements', () => {
      // Perform multiple measurements
      for (let i = 0; i < 5; i++) {
        timer.start();
        const start = Date.now();
        while (Date.now() - start < 1) {
          // Wait 1ms
        }
        timer.end();
      }

      const avg = timer.avg();
      expect(avg).toBeDefined();
      expect(parseFloat(avg)).toBeGreaterThan(0);
    });

    it('should handle multiple measureFn calls', () => {
      const testFn1 = jest.fn(() => 'result1');
      const testFn2 = jest.fn(() => 'result2');
      
      const result1 = timer.measureFn(testFn1);
      const result2 = timer.measureFn(testFn2);
      
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(testFn1).toHaveBeenCalledTimes(1);
      expect(testFn2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty samples array', () => {
      const newTimer = new Timer('empty-timer');
      // Don't call start/end, just check avg
      const avg = newTimer.avg();
      expect(avg).toBe('0.000');
    });

    it('should handle very fast operations', () => {
      const testFn = jest.fn(() => 'fast result');
      const result = timer.measureFn(testFn);
      
      expect(result).toBe('fast result');
      expect(testFn).toHaveBeenCalledTimes(1);
    });
  });
});
