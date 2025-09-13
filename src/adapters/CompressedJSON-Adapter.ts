import * as fs from 'fs';
import * as zlib from 'zlib';
import { Adapter } from './Adapter';

export class CompressedJSONAdapter extends Adapter {
  private db: Record<string, { data: Buffer; isBuffer: boolean }> = {};

  constructor(dbPath: string, dbOpts: any) {
    super(dbPath, dbOpts);
  }

  put(key: string, val: string | Buffer): void {
    this.db[key] = {
      data: zlib.deflateSync(val),
      isBuffer: Buffer.isBuffer(val)
    };
  }

  get(key: string): string | Buffer | undefined {
    const val = this.db[key];
    if (val) {
      const inflated = zlib.inflateSync(val.data);
      return val.isBuffer ? Buffer.from(inflated) : inflated.toString();
    }
    return undefined;
  }

  serializeStore(): void {
    const dbStore = zlib.deflateSync(JSON.stringify(this.db));
    fs.writeFileSync(this.dbPath, dbStore);
  }

  deserializeStore(): void {
    const dbStoreBuf = fs.readFileSync(this.dbPath);
    const inflated = zlib.inflateSync(dbStoreBuf).toString();
    const parsed = JSON.parse(inflated);
    
    // Handle both old format (direct Buffer values) and new format (object with data and isBuffer)
    this.db = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value && typeof value === 'object' && 'data' in value && 'isBuffer' in value) {
        // New format - need to convert the data back to Buffer
        const val = value as any;
        this.db[key] = {
          data: Buffer.from(val.data),
          isBuffer: val.isBuffer
        };
      } else if (Buffer.isBuffer(value)) {
        // Old format - convert to new format
        this.db[key] = {
          data: value,
          isBuffer: true
        };
      } else {
        // String value in old format
        this.db[key] = {
          data: zlib.deflateSync(value as string),
          isBuffer: false
        };
      }
    }
  }

  getKeys(): string[] {
    return Object.keys(this.db);
  }

  getSize(): number {
    return this.getKeys().length;
  }
}
