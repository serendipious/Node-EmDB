import * as fs from 'fs';
import { Adapter } from './Adapter';

export class FileAdapter extends Adapter {
  private originalTypes: Record<string, 'string' | 'buffer'> = {};

  constructor(dbPath: string, dbOpts: any) {
    super(dbPath, dbOpts);

    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    } else {
      const dbPathStats = fs.lstatSync(dbPath);
      if (dbPathStats.isFile()) {
        fs.unlinkSync(dbPath);
        fs.mkdirSync(dbPath, { recursive: true });
      }
    }
  }

  put(key: string, val: string | Buffer): void {
    this.originalTypes[key] = Buffer.isBuffer(val) ? 'buffer' : 'string';
    fs.writeFileSync(`${this.dbPath}/${key}`, val);
  }

  get(key: string): string | Buffer | undefined {
    try {
      const data = fs.readFileSync(`${this.dbPath}/${key}`);
      return this.originalTypes[key] === 'buffer' ? data : data.toString();
    } catch (error) {
      return undefined;
    }
  }

  serializeStore(): void {
    // File adapter doesn't need serialization as files are already persisted
  }

  deserializeStore(): void {
    // File adapter doesn't need deserialization as files are already persisted
  }

  getKeys(): string[] {
    if (!fs.existsSync(this.dbPath)) {
      return [];
    }
    return fs.readdirSync(this.dbPath).filter(item => {
      const itemPath = `${this.dbPath}/${item}`;
      return fs.lstatSync(itemPath).isFile();
    });
  }

  getSize(): number {
    return this.getKeys().length;
  }
}
