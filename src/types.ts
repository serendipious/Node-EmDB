import { Adapter } from './adapters/Adapter';

export interface EmDBOptions {
  append_if_exists?: boolean;
  verbose?: boolean;
  adapter?: new (dbPath: string, dbOpts: EmDBOptions) => Adapter;
  appendMode?: boolean;
}

export interface AdapterInterface {
  put(key: string, val: string | Buffer): void;
  get(key: string): string | Buffer | undefined;
  serializeStore(): void;
  deserializeStore(): void;
  getKeys(): string[];
  getSize(): number;
}

export interface TimerInterface {
  label(): string;
  start(): void;
  end(): number;
  avg(): string;
  measureFn<T>(fn: () => T): T;
  measureFn<T>(fn: () => Promise<T>): Promise<T>;
}
