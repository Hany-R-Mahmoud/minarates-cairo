import { createConnection } from 'mysql2/promise';

const coords = {
  'mosque-ibn-tulun': [30.0070, 31.2296],
  'mosque-al-hakim': [30.0548, 31.2612],
  'mosque-al-aqmar': [30.0496, 31.2609],
  'mosque-al-azhar': [30.0459, 31.2626],
  'complex-qalawun': [30.0503, 31.2607],
  'complex-barquq': [30.0498, 31.2608],
  'mosque-sultan-hasan': [30.0290, 31.2573],
  'mosque-al-rifai': [30.0289, 31.2570],
  'mosque-muhammad-ali': [30.0287, 31.2594],
  'citadel-of-cairo': [30.0288, 31.2594],
  'bab-al-futuh': [30.0556, 31.2617],
  'bab-al-nasr': [30.0556, 31.2622],
  'bab-zuweila': [30.0440, 31.2607],
  'mosque-al-muayyad': [30.0441, 31.2608],
  'bayt-al-suhaymi': [30.0524, 31.2617],
  'nilometer': [29.9988, 31.2216],
  'museum-of-islamic-art': [30.0438, 31.2483],
  'mosque-amr-ibn-al-as': [29.9992, 31.2298],
  'mosque-al-salih-tala': [30.0490, 31.2610],
  'mosque-al-nasir-muhammad': [30.0289, 31.2590],
  'wakala-al-ghuri': [30.0465, 31.2617],
  'mosque-al-ghuri': [30.0466, 31.2618],
};

const conn = await createConnection(process.env.DATABASE_URL);

for (const [slug, [lat, lng]] of Object.entries(coords)) {
  await conn.execute('UPDATE places SET lat=?, lng=? WHERE slug=?', [String(lat), String(lng), slug]);
}

console.log('Coordinates updated for', Object.keys(coords).length, 'places');
await conn.end();
