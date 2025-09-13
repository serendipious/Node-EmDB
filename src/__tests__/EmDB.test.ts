import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import { EmDB } from '../EmDB';
import { JSONAdapter } from '../adapters/JSON-Adapter';
import { CompressedJSONAdapter } from '../adapters/CompressedJSON-Adapter';
import { FileAdapter } from '../adapters/File-Adapter';
import { CompressedFileAdapter } from '../adapters/CompressedFile-Adapter';

describe('EmDB', () => {
  let testDbPath: string;
  let emdb: EmDB;

  beforeEach(() => {
    testDbPath = path.join(__dirname, 'test.db');
    // Clean up any existing test files
    if (fs.existsSync(testDbPath)) {
      fs.removeSync(testDbPath);
    }
  });

  afterEach(() => {
    if (emdb) {
      emdb.close();
    }
    // Clean up test files
    if (fs.existsSync(testDbPath)) {
      fs.removeSync(testDbPath);
    }
    // Clean up any test directories
    const testDirs = fs.readdirSync(__dirname).filter(dir => 
      fs.lstatSync(path.join(__dirname, dir)).isDirectory() && dir.startsWith('test_')
    );
    testDirs.forEach(dir => fs.removeSync(path.join(__dirname, dir)));
  });

  describe('Constructor', () => {
    it('should create EmDB instance with default options', () => {
      emdb = new EmDB(testDbPath);
      expect(emdb).toBeInstanceOf(EmDB);
      expect(emdb.size()).toBe(0);
    });

    it('should create EmDB instance with custom options', () => {
      emdb = new EmDB(testDbPath, {
        verbose: true,
        adapter: JSONAdapter
      });
      expect(emdb).toBeInstanceOf(EmDB);
    });

    it('should create EmDB instance with append_if_exists false', () => {
      emdb = new EmDB(testDbPath, {
        append_if_exists: false
      });
      expect(emdb).toBeInstanceOf(EmDB);
    });
  });

  describe('Basic Operations', () => {
    beforeEach(() => {
      emdb = new EmDB(testDbPath);
    });

    it('should put and get string values', () => {
      const key = 'test-key';
      const value = 'test-value';
      
      emdb.put(key, value);
      expect(emdb.get(key)).toBe(value);
    });

    it('should put and get Buffer values', () => {
      const key = 'test-buffer';
      const value = Buffer.from('test-buffer-value');
      
      emdb.put(key, value);
      const result = emdb.get(key);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(value);
    });

    it('should return undefined for non-existent key', () => {
      expect(emdb.get('non-existent')).toBeUndefined();
    });

    it('should track size correctly', () => {
      expect(emdb.size()).toBe(0);
      
      emdb.put('key1', 'value1');
      expect(emdb.size()).toBe(1);
      
      emdb.put('key2', 'value2');
      expect(emdb.size()).toBe(2);
    });

    it('should return all keys', () => {
      emdb.put('key1', 'value1');
      emdb.put('key2', 'value2');
      emdb.put('key3', 'value3');
      
      const keys = emdb.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });

  describe('Sync Operations', () => {
    beforeEach(() => {
      emdb = new EmDB(testDbPath);
    });

    it('should sync data to disk', () => {
      emdb.put('key1', 'value1');
      emdb.put('key2', 'value2');
      emdb.sync();
      
      // Verify file exists
      expect(fs.existsSync(testDbPath)).toBe(true);
    });

    it('should handle sync when size is 0 and file exists with appendMode', () => {
      // Create a compressed file first (since we're using CompressedJSONAdapter by default)
      const compressedData = zlib.deflateSync('{"existing": "data"}');
      fs.writeFileSync(testDbPath, compressedData);
      
      emdb = new EmDB(testDbPath, { appendMode: true });
      emdb.sync();
      
      // Should not throw error and should load existing data
      expect(emdb.size()).toBe(1);
      expect(emdb.get('existing')).toBe('data');
    });
  });

  describe('Open/Close Operations', () => {
    beforeEach(() => {
      emdb = new EmDB(testDbPath);
    });

    it('should open database and start sync interval', () => {
      emdb.open();
      // Should not throw error
      expect(emdb).toBeDefined();
    });

    it('should close database and stop sync interval', () => {
      emdb.open();
      emdb.close();
      // Should not throw error
      expect(emdb).toBeDefined();
    });

    it('should handle close without opening', () => {
      emdb.close();
      // Should not throw error
      expect(emdb).toBeDefined();
    });
  });

  describe('Logging', () => {
    it('should log when verbose is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      emdb = new EmDB(testDbPath, { verbose: true });
      
      emdb.put('test', 'value');
      emdb.get('test');
      emdb.sync();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log when NODE_ENV is debug', () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'debug';
      
      const consoleSpy = jest.spyOn(console, 'log');
      emdb = new EmDB(testDbPath);
      
      emdb.put('test', 'value');
      
      expect(consoleSpy).toHaveBeenCalled();
      
      process.env['NODE_ENV'] = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should not log when verbose is disabled and NODE_ENV is not debug', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      emdb = new EmDB(testDbPath, { verbose: false });
      
      emdb.put('test', 'value');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Different Adapters', () => {
    it('should work with JSONAdapter', () => {
      emdb = new EmDB(testDbPath, { adapter: JSONAdapter });
      emdb.put('key', 'value');
      expect(emdb.get('key')).toBe('value');
    });

    it('should work with CompressedJSONAdapter', () => {
      emdb = new EmDB(testDbPath, { adapter: CompressedJSONAdapter });
      emdb.put('key', 'value');
      expect(emdb.get('key')).toBe('value');
    });

    it('should work with FileAdapter', () => {
      const testDir = path.join(__dirname, 'test_file_adapter');
      emdb = new EmDB(testDir, { adapter: FileAdapter });
      emdb.put('key', 'value');
      expect(emdb.get('key')).toBe('value');
      
      // Clean up
      fs.removeSync(testDir);
    });

    it('should work with CompressedFileAdapter', () => {
      const testDir = path.join(__dirname, 'test_compressed_file_adapter');
      emdb = new EmDB(testDir, { adapter: CompressedFileAdapter });
      emdb.put('key', 'value');
      expect(emdb.get('key')).toBe('value');
      
      // Clean up
      fs.removeSync(testDir);
    });
  });
});
