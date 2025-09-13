import { AdapterInterface } from '../types';

export abstract class Adapter implements AdapterInterface {
  protected dbPath: string;
  protected dbOpts: any;

  constructor(dbPath: string, dbOpts: any) {
    this.dbPath = dbPath;
    this.dbOpts = dbOpts;
  }

  abstract put(key: string, val: string | Buffer): void;
  abstract get(key: string): string | Buffer | undefined;
  abstract serializeStore(): void;
  abstract deserializeStore(): void;
  abstract getKeys(): string[];
  abstract getSize(): number;
}
