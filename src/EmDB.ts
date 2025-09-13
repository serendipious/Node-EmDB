import * as fs from 'fs';
import { CompressedJSONAdapter } from './adapters/CompressedJSON-Adapter';
import { EmDBOptions } from './types';

// Import ProcessCleanupEmitter to register event listeners
import '../lib/ProcessCleanupEmitter';

const DEFAULT_DB_OPTS: EmDBOptions = {
  append_if_exists: true,
  adapter: CompressedJSONAdapter
};

export class EmDB {
  private dbPath: string;
  private dbOpts: EmDBOptions;
  private adapter: any;
  private syncIntervalId?: NodeJS.Timeout;

  constructor(dbPath: string, dbOpts: EmDBOptions = {}) {
    this.dbPath = dbPath;
    this.dbOpts = Object.assign({}, DEFAULT_DB_OPTS, dbOpts);
    this.adapter = new this.dbOpts.adapter!(this.dbPath, this.dbOpts);
    
    this.sync();
    process.on('cleanup', this.sync.bind(this));
  }
  
  private log(...args: any[]): void {
    if (!!this.dbOpts.verbose || process.env['NODE_ENV'] === 'debug') {
      args[0] = `[EmDB::${Date.now()}] ${args[0]}`;
      console.log.apply(console, args);
    }
  }

  public open(): void {
    this.log('#open');
    this.syncIntervalId = setInterval(this.sync.bind(this), 1000);
  }

  public put(key: string, val: string | Buffer): void {
    this.log(`#put::${key}`);
    this.adapter.put(key, val);
  }

  public get(key: string): string | Buffer | undefined {
    this.log(`#get::${key}`);
    return this.adapter.get(key);
  }

  public sync(): void {
    this.log('#sync');
    if (this.size() === 0 && fs.existsSync(this.dbPath) && !!this.dbOpts.appendMode) {
      this.adapter.deserializeStore();
    } else {
      this.adapter.serializeStore();
    }
  }

  public size(): number {
    return this.adapter.getSize();
  }

  public keys(): string[] {
    return this.adapter.getKeys();
  }

  public close(): void {
    this.log('#close');
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    this.sync();
  }
}

export default EmDB;
