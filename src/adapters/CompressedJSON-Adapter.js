const fs = require('fs');
const zlib = require('zlib');

class CompressedJSONAdapter {
  constructor(dbPath, dbOpts) {
    this.dbPath = dbPath;
    this.dbOpts = dbOpts;
    this.db = {};
  }

  put(key, val) {
    this.db[key] = zlib.deflateSync(val);
  }

  get(key) {
    let val = this.db[key];
    return zlib.inflateSync(new Buffer(val));
  }

  serializeStore() {
    let dbStore = zlib.deflateSync(JSON.stringify(this.db));
    fs.writeFileSync(this.dbPath, dbStore);
  }

  deserializeStore() {
    let dbStoreBuf = fs.readFileSync(this.dbPath);
    this.db = JSON.parse(zlib.inflateSync(dbStoreBuf));
  }

  getKeys() {
    return Object.keys(this.db);
  }

  getSize() {
    return this.getKeys().length;
  }
}

module.exports = CompressedJSONAdapter;