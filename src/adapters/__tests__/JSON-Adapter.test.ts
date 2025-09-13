import * as fs from 'fs-extra';
import * as path from 'path';
import { JSONAdapter } from '../JSON-Adapter';

describe('JSONAdapter', () => {
  let adapter: JSONAdapter;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, 'test.json');
    adapter = new JSONAdapter(testDbPath, {});
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.removeSync(testDbPath);
    }
  });

  describe('Constructor', () => {
    it('should create JSONAdapter instance', () => {
      expect(adapter).toBeInstanceOf(JSONAdapter);
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
  });

  describe('Serialization', () => {
    it('should serialize store to file', () => {
      adapter.put('key1', 'value1');
      adapter.put('key2', 'value2');
      adapter.serializeStore();
      
      expect(fs.existsSync(testDbPath)).toBe(true);
      const content = fs.readFileSync(testDbPath, 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed.key1).toBe('value1');
      expect(parsed.key2).toBe('value2');
    });

    it('should deserialize store from file', () => {
      // Create a file with data
      const data = { key1: 'value1', key2: 'value2' };
      fs.writeFileSync(testDbPath, JSON.stringify(data));
      
      adapter.deserializeStore();
      expect(adapter.get('key1')).toBe('value1');
      expect(adapter.get('key2')).toBe('value2');
    });

    it('should handle empty store serialization', () => {
      adapter.serializeStore();
      expect(fs.existsSync(testDbPath)).toBe(true);
      const content = fs.readFileSync(testDbPath, 'utf8');
      expect(JSON.parse(content)).toEqual({});
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
});
