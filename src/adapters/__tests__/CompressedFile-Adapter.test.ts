import * as fs from 'fs-extra';
import * as path from 'path';
import { CompressedFileAdapter } from '../CompressedFile-Adapter';

describe('CompressedFileAdapter', () => {
  let adapter: CompressedFileAdapter;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `test_compressed_file_db_${Date.now()}`);
    adapter = new CompressedFileAdapter(testDbPath, {});
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.removeSync(testDbPath);
    }
  });

  describe('Constructor', () => {
    it('should create CompressedFileAdapter instance', () => {
      expect(adapter).toBeInstanceOf(CompressedFileAdapter);
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
      new CompressedFileAdapter(testDbPath, {});
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
    it('should create individual compressed files for each key', () => {
      adapter.put('key1', 'value1');
      adapter.put('key2', 'value2');
      
      expect(fs.existsSync(path.join(testDbPath, 'key1'))).toBe(true);
      expect(fs.existsSync(path.join(testDbPath, 'key2'))).toBe(true);
    });

    it('should store compressed content in files', () => {
      adapter.put('test-key', 'test-value');
      
      const filePath = path.join(testDbPath, 'test-key');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath);
      // Content should be compressed (not plain text)
      expect(content.toString()).not.toBe('test-value');
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

  describe('Compression', () => {
    it('should compress data when storing', () => {
      const largeValue = 'x'.repeat(1000);
      adapter.put('large', largeValue);
      
      const filePath = path.join(testDbPath, 'large');
      const compressedContent = fs.readFileSync(filePath);
      // Compressed content should be smaller than original
      expect(compressedContent.length).toBeLessThan(largeValue.length);
    });

    it('should decompress data when retrieving', () => {
      const originalValue = 'test value for compression';
      adapter.put('compressed', originalValue);
      
      const retrievedValue = adapter.get('compressed');
      expect(retrievedValue).toBe(originalValue);
    });

    it('should handle large data compression', () => {
      const largeData = 'A'.repeat(10000);
      adapter.put('large-data', largeData);
      
      const retrieved = adapter.get('large-data');
      expect(retrieved).toBe(largeData);
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', () => {
      // Create a directory instead of a file
      fs.mkdirSync(path.join(testDbPath, 'invalid-key'));
      
      const result = adapter.get('invalid-key');
      expect(result).toBeUndefined();
    });

    it('should handle corrupted compressed files gracefully', () => {
      // Create a file with invalid compressed data
      fs.writeFileSync(path.join(testDbPath, 'corrupted'), 'invalid compressed data');
      
      const result = adapter.get('corrupted');
      expect(result).toBeUndefined();
    });
  });
});
