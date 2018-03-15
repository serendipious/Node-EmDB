const fs = require('fs');
const zlib = require('zlib');

class FileAdapter {
  constructor(dbPath, dbOpts) {
    this.dbPath = dbPath;
    this.dbOpts = dbOpts;

    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath);
    }
    else {
      let dbPathStats = fs.lstatSync(dbPath);
      if (dbPathStats.isFile()) {
        fs.unlinkSync(dbPath);
        fs.mkdirSync(dbPath);
      }
    }
  }

  put(key, val) {
    fs.writeFileSync(`${this.dbPath}/${key}`, val);
  }

  get(key) {
    fs.readFileSync(`${this.dbPath}/${key}`);
  }

  serializeStore() {
    
  }

  deserializeStore() {
    
  }

  getKeys() {
    return fs.readdirSync(this.dbPath);
  }

  getSize() {
    return this.getKeys().length;
  }
}

module.exports = FileAdapter;