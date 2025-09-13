# Node-EmDB

[![npm version](https://badge.fury.io/js/emdb.svg)](https://badge.fury.io/js/emdb)
[![Build Status](https://github.com/serendipious/Node-EmDB/workflows/CI/badge.svg)](https://github.com/serendipious/Node-EmDB/actions)
[![Coverage Status](https://coveralls.io/repos/github/serendipious/Node-EmDB/badge.svg?branch=master)](https://coveralls.io/github/serendipious/Node-EmDB?branch=master)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A high-performance, TypeScript-first embedded key-value store for Node.js with multiple storage adapters and 100% test coverage.

## Features

- ✅ **TypeScript Support**: Full TypeScript definitions and type safety
- ✅ **100% Test Coverage**: Comprehensive test suite with 100% code coverage
- ✅ **Multiple Adapters**: JSON, CompressedJSON, File, and CompressedFile storage
- ✅ **High Performance**: Optimized for speed and memory usage
- ✅ **Zero Dependencies**: No external runtime dependencies
- ✅ **Auto-sync**: Automatic data persistence with configurable intervals
- ✅ **Process Cleanup**: Automatic data sync on process exit
- ✅ **Flexible Storage**: Support for both string and Buffer values
- ✅ **Pre-commit Hooks**: Automated testing and linting

## Installation

```bash
npm install emdb
```

## Quick Start

### TypeScript/ES Modules

```typescript
import { EmDB } from 'emdb';
import { JSONAdapter } from 'emdb/adapters/JSON-Adapter';

// Create database with default settings
const db = new EmDB('./data.db');

// Basic operations
db.put('user:1', 'John Doe');
db.put('user:2', Buffer.from('Jane Smith'));

const user1 = db.get('user:1'); // 'John Doe'
const user2 = db.get('user:2'); // Buffer

// Get all keys and size
const keys = db.keys(); // ['user:1', 'user:2']
const size = db.size(); // 2

// Auto-sync (data is automatically persisted)
db.open(); // Start auto-sync every 1 second
db.close(); // Stop auto-sync and final sync
```

### CommonJS

```javascript
const { EmDB } = require('emdb');
const { CompressedJSONAdapter } = require('emdb/adapters/CompressedJSON-Adapter');

const db = new EmDB('./data.db', {
  adapter: CompressedJSONAdapter,
  verbose: true
});

db.put('key', 'value');
const value = db.get('key');
```

## Storage Adapters

Node-EmDB supports multiple storage adapters for different use cases:

### JSONAdapter
- **Use case**: Simple key-value storage
- **Storage**: Single JSON file
- **Pros**: Human-readable, simple
- **Cons**: No compression, slower for large datasets

```typescript
import { JSONAdapter } from 'emdb/adapters/JSON-Adapter';

const db = new EmDB('./data.json', { adapter: JSONAdapter });
```

### CompressedJSONAdapter (Default)
- **Use case**: General-purpose storage with compression
- **Storage**: Single compressed JSON file
- **Pros**: Space-efficient, good performance
- **Cons**: Not human-readable

```typescript
import { CompressedJSONAdapter } from 'emdb/adapters/CompressedJSON-Adapter';

const db = new EmDB('./data.db', { adapter: CompressedJSONAdapter });
```

### FileAdapter
- **Use case**: File-based storage, one file per key
- **Storage**: Directory with individual files
- **Pros**: Easy to browse, good for large values
- **Cons**: Many small files, slower for many keys

```typescript
import { FileAdapter } from 'emdb/adapters/File-Adapter';

const db = new EmDB('./data-dir', { adapter: FileAdapter });
```

### CompressedFileAdapter
- **Use case**: File-based storage with compression
- **Storage**: Directory with compressed files
- **Pros**: Space-efficient, good for large values
- **Cons**: Many files, not human-readable

```typescript
import { CompressedFileAdapter } from 'emdb/adapters/CompressedFile-Adapter';

const db = new EmDB('./data-dir', { adapter: CompressedFileAdapter });
```

## API Reference

### EmDB Class

#### Constructor

```typescript
constructor(dbPath: string, dbOpts?: EmDBOptions)
```

**Parameters:**
- `dbPath: string` - Path to the database file or directory
- `dbOpts?: EmDBOptions` - Database options

#### EmDBOptions

```typescript
interface EmDBOptions {
  append_if_exists?: boolean;    // Append to existing data (default: true)
  verbose?: boolean;            // Enable verbose logging (default: false)
  adapter?: AdapterConstructor; // Storage adapter class (default: CompressedJSONAdapter)
  appendMode?: boolean;         // Enable append mode for deserialization
}
```

#### Methods

##### `put(key: string, val: string | Buffer): void`

Stores a value with the given key.

**Parameters:**
- `key: string` - The key to store the value under
- `val: string | Buffer` - The value to store

##### `get(key: string): string | Buffer | undefined`

Retrieves a value by key.

**Parameters:**
- `key: string` - The key to retrieve

**Returns:** The stored value or `undefined` if not found

##### `keys(): string[]`

Returns an array of all keys in the database.

**Returns:** Array of key strings

##### `size(): number`

Returns the number of key-value pairs in the database.

**Returns:** Number of entries

##### `sync(): void`

Manually synchronizes data to disk.

##### `open(): void`

Starts automatic synchronization every 1 second.

##### `close(): void`

Stops automatic synchronization and performs final sync.

## Development

### Prerequisites

- Node.js >= 12.0.0
- npm >= 6.0.0

### Setup

```bash
git clone https://github.com/serendipious/Node-EmDB.git
cd Node-EmDB
npm install
```

### Available Scripts

```bash
# Build the project
npm run build

# Build in watch mode
npm run build:watch

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run benchmark
npm run benchmark

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Clean build artifacts
npm run clean
```

### Test Coverage

This project maintains **100% test coverage** across all metrics:

- **Lines**: 100%
- **Functions**: 100%
- **Branches**: 100%
- **Statements**: 100%

Coverage reports are generated in the `coverage/` directory and can be viewed by running:

```bash
npm run test:coverage:report
```

## Performance

The library is optimized for high performance:

- **Put Operations**: ~0.1-1ms per operation
- **Get Operations**: ~0.05-0.5ms per operation
- **Memory Usage**: Minimal, with efficient data structures
- **Bundle Size**: ~5KB minified and gzipped

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to contribute to this project.

## Changelog

### v1.0.0
- **BREAKING**: Migrated to TypeScript with full type safety
- Added comprehensive test coverage (100%)
- Added multiple storage adapters (JSON, CompressedJSON, File, CompressedFile)
- Added pre-commit hooks for quality assurance
- Enhanced documentation and examples
- Added performance optimizations
- Added process cleanup handling
- Added automatic data synchronization
