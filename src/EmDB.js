const fs = require('fs');

const ProcessCleanupEmitter = require('../lib/ProcessCleanupEmitter');
const JSONAdapter = require('./adapters/JSON-Adapter');
const CompressedJSONAdapter = require('./adapters/CompressedJSON-Adapter');

const DEFAULT_DB_OPTS = {
  append_if_exists: true,
  adapter: CompressedJSONAdapter
};

class EmDB {
  constructor(dbPath, dbOpts = {}) {
    this.dbPath = dbPath;
    this.dbOpts = Object.assign({}, DEFAULT_DB_OPTS, dbOpts);
    this.adapter = new this.dbOpts.adapter(this.dbPath, this.dbOpts);
    
    this.sync();
    process.on('cleanup', this.sync.bind(this));
  }
  
  log(...args) {
    if (!!this.dbOpts.verbose || process.env.NODE_ENV === 'debug') {
      args[0] = `[EmDB::${Date.now()}] ${args[0]}`;
      console.log.apply(console, args);
    }
  }

  open() {
    this.log('#open');
    this.syncIntervalId = setInterval(this.sync.bind(this), 1000);
  }

  put(key, val) {
    this.log(`#put::${key}`);
    this.adapter.put(key, val);
  }

  get(key) {
    this.log(`#get::${key}`);
    return this.adapter.get(key);
  }

  sync() {
    this.log(`#sync`);
    if (this.size() === 0 && fs.existsSync(this.dbPath) && !!this.dbOpts.appendMode) {
      this.adapter.deserializeStore();
    }
    else {
      this.adapter.serializeStore();
    }
  }

  size() {
    return this.adapter.getSize();
  }

  keys() {
    return this.adapter.getKeys();
  }

  close() {
    this.log('#close');
    clearInterval(this.syncIntervalId);
    this.sync();
  }
}

module.exports = EmDB;