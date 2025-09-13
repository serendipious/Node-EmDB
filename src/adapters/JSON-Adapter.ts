import * as fs from 'fs';
import { Adapter } from './Adapter';

export class JSONAdapter extends Adapter {
  private db: Record<string, any> = {};

  constructor(dbPath: string, dbOpts: any) {
    super(dbPath, dbOpts);
  }

  put(key: string, val: string | Buffer): void {
    this.db[key] = val;
  }

  get(key: string): string | Buffer | undefined {
    return this.db[key];
  }

  serializeStore(): void {
    const dbStore = JSON.stringify(this.db);
    fs.writeFileSync(this.dbPath, dbStore);
  }

  deserializeStore(): void {
    this.db = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
  }

  getKeys(): string[] {
    return Object.keys(this.db);
  }

  getSize(): number {
    return this.getKeys().length;
  }
}
