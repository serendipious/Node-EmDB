import * as fs from 'fs-extra';
import * as path from 'path';
import { FileAdapter } from '../File-Adapter';

describe('FileAdapter', () => {
  let adapter: FileAdapter;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `test_file_db_${Date.now()}`);
    adapter = new FileAdapter(testDbPath, {});
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.removeSync(testDbPath);
    }
  });

  describe('Constructor', () => {
    it('should create FileAdapter instance', () => {
      expect(adapter).toBeInstanceOf(FileAdapter);
    });

    it('should create directory if it does not exist', () => {
      expect(fs.existsSync(testDbPath)).toBe(true);
      expect(fs.lstatSync(testDbPath).isDirectory()).toBe(true);
    });

    it('should convert file to directory if path exists as file', () => {
      // Clean up existing directory first
      if (fs.existsSync(testDbPath)) {
        fs.removeSync(testDbPath);
      }
      
      // Create a file at the path
      fs.writeFileSync(testDbPath, 'test content');
      expect(fs.lstatSync(testDbPath).isFile()).toBe(true);
      
      // Create adapter - should convert file to directory
      new FileAdapter(testDbPath, {});
      expect(fs.lstatSync(testDbPath).isDirectory()).toBe(true);
    });
  });

  describe('Basic Operations', () => {
    it('should put and get string values', () => {
      adapter.put('key1', 'value1');
      const result = adapter.get('key1');
      expect(result).toBe('value1');
    });

    it('should put and get Buffer values', () => {
      const buffer = Buffer.from('test buffer');
      adapter.put('key2', buffer);
      const result = adapter.get('key2');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(buffer);
    });

    it('should return undefined for non-existent key', () => {
      expect(adapter.get('non-existent')).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      adapter.put('key', 'value1');
      adapter.put('key', 'value2');
      expect(adapter.get('key')).toBe('value2');
    });

    it('should handle empty values', () => {
      adapter.put('empty', '');
      expect(adapter.get('empty')).toBe('');
    });
  });

  describe('File System Operations', () => {
    it('should create individual files for each key', () => {
      adapter.put('key1', 'value1');
      adapter.put('key2', 'value2');
      
      expect(fs.existsSync(path.join(testDbPath, 'key1'))).toBe(true);
      expect(fs.existsSync(path.join(testDbPath, 'key2'))).toBe(true);
    });

    it('should read correct content from files', () => {
      adapter.put('test-key', 'test-value');
      
      const filePath = path.join(testDbPath, 'test-key');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toBe('test-value');
    });
  });

  describe('Serialization', () => {
    it('should handle serializeStore (no-op)', () => {
      adapter.put('key1', 'value1');
      adapter.serializeStore();
      // Should not throw error
      expect(adapter.get('key1')).toBe('value1');
    });

    it('should handle deserializeStore (no-op)', () => {
      adapter.put('key1', 'value1');
      adapter.deserializeStore();
      // Should not throw error
      expect(adapter.get('key1')).toBe('value1');
    });
  });

  describe('Keys and Size', () => {
    it('should return empty keys array initially', () => {
      expect(adapter.getKeys()).toEqual([]);
    });

    it('should return correct keys after adding data', () => {
      adapter.put('key1', 'value1');
      adapter.put('key2', 'value2');
      adapter.put('key3', 'value3');
      
      const keys = adapter.getKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return correct size', () => {
      expect(adapter.getSize()).toBe(0);
      
      adapter.put('key1', 'value1');
      expect(adapter.getSize()).toBe(1);
      
      adapter.put('key2', 'value2');
      expect(adapter.getSize()).toBe(2);
    });

    it('should ignore non-file entries in directory', () => {
      // Create a subdirectory
      fs.mkdirSync(path.join(testDbPath, 'subdir'));
      
      adapter.put('key1', 'value1');
      
      const keys = adapter.getKeys();
      expect(keys).toHaveLength(1);
      expect(keys).toContain('key1');
      expect(keys).not.toContain('subdir');
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', () => {
      // Create a directory instead of a file
      fs.mkdirSync(path.join(testDbPath, 'invalid-key'));
      
      const result = adapter.get('invalid-key');
      expect(result).toBeUndefined();
    });
  });
});
