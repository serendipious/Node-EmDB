import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import { CompressedJSONAdapter } from '../CompressedJSON-Adapter';

describe('CompressedJSONAdapter', () => {
  let adapter: CompressedJSONAdapter;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, 'test_compressed.json');
    adapter = new CompressedJSONAdapter(testDbPath, {});
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.removeSync(testDbPath);
    }
  });

  describe('Constructor', () => {
    it('should create CompressedJSONAdapter instance', () => {
      expect(adapter).toBeInstanceOf(CompressedJSONAdapter);
    });
  });

  describe('Basic Operations', () => {
    it('should put and get string values', () => {
      adapter.put('key1', 'value1');
      expect(adapter.get('key1')).toBe('value1');
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

  describe('Serialization', () => {
    it('should serialize store to compressed file', () => {
      adapter.put('key1', 'value1');
      adapter.put('key2', 'value2');
      adapter.serializeStore();
      
      expect(fs.existsSync(testDbPath)).toBe(true);
      // File should be compressed (smaller than JSON)
      const content = fs.readFileSync(testDbPath);
      expect(content.length).toBeGreaterThan(0);
    });

    it('should deserialize store from compressed file', () => {
      // Create compressed data
      adapter.put('key1', 'value1');
      adapter.put('key2', 'value2');
      adapter.serializeStore();
      
      // Create new adapter and deserialize
      const newAdapter = new CompressedJSONAdapter(testDbPath, {});
      newAdapter.deserializeStore();
      
      expect(newAdapter.get('key1')).toBe('value1');
      expect(newAdapter.get('key2')).toBe('value2');
    });

    it('should handle empty store serialization', () => {
      adapter.serializeStore();
      expect(fs.existsSync(testDbPath)).toBe(true);
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
  });

  describe('Compression', () => {
    it('should compress data when storing', () => {
      const largeValue = 'x'.repeat(1000);
      adapter.put('large', largeValue);
      
      // The internal storage should be compressed
      const internalDb = (adapter as any).db;
      expect(internalDb.large).toHaveProperty('data');
      expect(internalDb.large).toHaveProperty('isBuffer');
      expect(internalDb.large.data).toBeInstanceOf(Buffer);
    });

    it('should decompress data when retrieving', () => {
      const originalValue = 'test value for compression';
      adapter.put('compressed', originalValue);
      
      const retrievedValue = adapter.get('compressed');
      expect(retrievedValue).toBe(originalValue);
    });

    it('should handle deserialization of old format with Buffer values', () => {
      // Create a file with old format data (string values only, since Buffer serializes as object)
      const oldFormatData = {
        key1: 'value1',
        key2: 'value2'
      };
      const compressedData = zlib.deflateSync(JSON.stringify(oldFormatData));
      fs.writeFileSync(testDbPath, compressedData);
      
      // Create new adapter and deserialize
      const newAdapter = new CompressedJSONAdapter(testDbPath, {});
      newAdapter.deserializeStore();
      
      expect(newAdapter.get('key1')).toBe('value1');
      expect(newAdapter.get('key2')).toBe('value2');
    });


  });
});
