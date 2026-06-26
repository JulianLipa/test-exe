// fix-excel-serials.js
// Convierte seriales de Excel en impuestos.json a fechas legibles
// Uso: node fix-excel-serials.js

const fs = require("fs");
const path = require("path");

const IMPUESTOS_PATH = path.join(
  require("os").homedir(),
  "Desktop", "db", "impuestos.json"
);

// Rango válido: Excel serial para 2000-01-01 a 2030-12-31
const SERIAL_MIN = 36526;
const SERIAL_MAX = 47483;

// Campos a revisar
const FIELDS_TO_FIX = ["expensasPeriodo", "otros"];

const MESES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre"
];

function excelSerialToLabel(serial) {
  // Excel: día 1 = 01/01/1900. Ajuste Unix epoch: restar 25569 días.
  const ms = (serial - 25569) * 86400 * 1000;
  const d = new Date(ms);
  if (isNaN(d)) return null;
  return `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function isExcelSerial(val) {
  if (!/^\d{5}$/.test(String(val).trim())) return false;
  const n = Number(val);
  return n >= SERIAL_MIN && n <= SERIAL_MAX;
}

const raw = fs.readFileSync(IMPUESTOS_PATH, "utf8");
const data = JSON.parse(raw);

let count = 0;

const fixed = data.map((record) => {
  const updated = { ...record };
  for (const field of FIELDS_TO_FIX) {
    if (record[field] !== undefined && isExcelSerial(record[field])) {
      const label = excelSerialToLabel(Number(record[field]));
      if (label) {
        console.log(
          `alquilerId=${record.alquilerId} | ${field}: "${record[field]}" → "${label}"`
        );
        updated[field] = label;
        count++;
      }
    }
  }
  return updated;
});

// Backup
const backupPath = IMPUESTOS_PATH.replace(".json", ".backup.json");
fs.writeFileSync(backupPath, raw, "utf8");
console.log(`\nBackup guardado en: ${backupPath}`);

fs.writeFileSync(IMPUESTOS_PATH, JSON.stringify(fixed, null, 2), "utf8");
console.log(`\n✓ ${count} valores convertidos y guardados en: ${IMPUESTOS_PATH}`);
