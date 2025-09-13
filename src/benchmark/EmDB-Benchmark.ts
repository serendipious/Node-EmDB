import * as fs from 'fs-extra';
import { EmDB } from '../EmDB';
import { Timer } from '../../lib/Timer';
import { ShortUID } from 'short-uid';

const NUM_SAMPLES = Math.pow(10, 5);
const UID_GEN = new ShortUID();

const ADAPTER_DIR = `${__dirname}/../adapters`;
const ADAPTERS = fs.readdirSync(ADAPTER_DIR)
  .filter((file: string) => file.endsWith('.ts') && !file.includes('.d.ts'))
  .map((adapterName: string) => {
    const adapterPath = `${ADAPTER_DIR}/${adapterName}`;
    return require(adapterPath);
  });

for (let adapterIdx = 0; adapterIdx < ADAPTERS.length; adapterIdx++) {
  const Adapter = ADAPTERS[adapterIdx];
  console.info(`Running benchmark for Adapter: ${Adapter.name}`);

  const dbInitTimer = new Timer('DB::init');
  const dbKeysTimer = new Timer('DB::keys');
  const dbPutTimer = new Timer('DB::put');
  const dbGetTimer = new Timer('DB::get');
  const dbSyncTimer = new Timer('DB::sync');

  const dbPath = `test_${adapterIdx}.db`;
  fs.removeSync(dbPath);
  
  const db = dbInitTimer.measureFn(() => new EmDB(dbPath, {
    append_if_exists: false,
    verbose: false,
    adapter: Adapter
  }));

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const randKey = UID_GEN.randomUUID(36);
    const randVal = UID_GEN.randomUUID(1024);
    dbPutTimer.measureFn(() => db.put(randKey, randVal));
  }
  console.info(`${NUM_SAMPLES} records inserted`);

  const dbKeyList = dbKeysTimer.measureFn(() => db.keys());
  dbKeyList.forEach((k: string) => dbGetTimer.measureFn(() => db.get(k)));
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
