const fs = require('fs-extra');
const EmDB = require('../src/EmDB');
const Timer = require('../lib/Timer');
const ShortUID = require('short-uid');

const NUM_SAMPLES = Math.pow(10,5);
const UID_GEN = new ShortUID;

const ADAPTER_DIR = `${__dirname}/../src/adapters`;
const ADAPTERS = fs.readdirSync(ADAPTER_DIR).map((adapterName) => {
  return require(`${ADAPTER_DIR}/${adapterName}`);
});

for (let adapterIdx = 0; adapterIdx < ADAPTERS.length; adapterIdx++) {
  let Adapter = ADAPTERS[adapterIdx];
  console.info(`Running benchmark for Adapter: ${Adapter.name}`);

  let dbInitTimer = new Timer('DB::init');
  let dbKeysTimer = new Timer('DB::keys');
  let dbPutTimer = new Timer('DB::put');
  let dbGetTimer = new Timer('DB::get');
  let dbSyncTimer = new Timer('DB::sync');

  let dbPath = `test_${adapterIdx}.db`;
  fs.removeSync(dbPath);
  
  let db = dbInitTimer.measureFn(() => new EmDB(dbPath, {
    append_if_exists: false,
    verbose: false,
    adapter: Adapter
  }));

  for (let i = 0; i < NUM_SAMPLES; i++) {
    let randKey = UID_GEN.randomUUID(36);
    let randVal = UID_GEN.randomUUID(1024);
    dbPutTimer.measureFn(() => db.put(randKey, randVal));
  }
  console.info(`${NUM_SAMPLES} records inserted`);

  let dbKeyList = dbKeysTimer.measureFn(() => db.keys());
  dbKeyList.forEach((k, i) => dbGetTimer.measureFn(() => db.get(k)));
  console.info(`${NUM_SAMPLES} records read`);

  dbSyncTimer.measureFn(() => db.sync());

  console.info(`
    SUMMARY for ${Adapter.name}:
    * init: ${dbInitTimer.avg()}ms
    * put: ${dbPutTimer.avg()}ms
    * get: ${dbGetTimer.avg()}ms
    * keys: ${dbKeysTimer.avg()}ms
    * sync: ${dbSyncTimer.avg()}ms
  `);
}