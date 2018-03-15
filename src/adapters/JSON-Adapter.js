const fs = require('fs');

class JSONAdapter {
  constructor(dbPath, dbOpts) {
    this.dbPath = dbPath;
    this.dbOpts = dbOpts;
    this.db = {};
  }

  put(key, val) {
    this.db[key] = val;
  }

  get(key) {
    return this.db[key];
  }

  serializeStore() {
    let dbStore = JSON.stringify(this.db);
    fs.writeFileSync(this.dbPath, dbStore);
  }

  deserializeStore() {
    this.db = JSON.parse(fs.readFileSync(this.dbPath));
  }

  getKeys() {
    return Object.keys(this.db);
  }

  getSize() {
    return this.getKeys().length;
  }
}

module.exports = JSONAdapter;