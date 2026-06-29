const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const XLSX_PATH = 'C:/Users/FLIA LIPARI/Downloads/BASE-DATOS.xlsx';
const DB_DIR = 'C:/Users/FLIA LIPARI/Desktop/db';

console.log('Leyendo archivo Excel...');
const wb = XLSX.readFile(XLSX_PATH);
console.log('Hojas encontradas:', wb.SheetNames);

const MESES_ES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
  'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];

// ── helpers ──────────────────────────────────────────────────────────────────

function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number' || serial < 20000) return null;
  const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return d.toISOString().split('T')[0];
}

function periodoToString(periodoVal, fechaVal) {
  if (typeof periodoVal === 'string' && periodoVal.trim()) return periodoVal.trim();
  if (typeof periodoVal !== 'number' || periodoVal < 20000) return '';
  let d = new Date(Math.round((periodoVal - 25569) * 86400 * 1000));
  if (typeof fechaVal === 'number' && fechaVal > 20000) {
    const fd = new Date(Math.round((fechaVal - 25569) * 86400 * 1000));
    if (Math.abs(d.getFullYear() - fd.getFullYear()) > 3) {
      // Fix 25-year offset: keep month, use fecha's year
      d = new Date(fd.getFullYear(), d.getMonth(), 1);
    }
  }
  return `${MESES_ES[d.getMonth()]} ${d.getFullYear()}`;
}

function parseMoney(str) {
  if (str === null || str === undefined || str === '') return 0;
  if (typeof str === 'number') return str;
  const cleaned = str.toString()
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')   // thousands separator (Argentine: dot)
    .replace(',', '.');   // decimal separator (Argentine: comma)
  const v = parseFloat(cleaned);
  return isNaN(v) ? 0 : v;
}

function normalizeIndice(val) {
  if (!val || val === '') return null;
  const v = val.toString().trim().toUpperCase();
  if (v === 'CASA PROPIA') return 'CASA_PROPIA';
  if (v === 'NINGUNO' || v === '') return null;
  if (v === 'ICL' || v === 'IPC') return v;
  return v || null;
}

function toAccountNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val === 0 ? null : val;
  const digits = val.toString().replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return n === 0 ? null : n;
}

function norm(val) {
  return (val != null && val !== '') ? val.toString().trim() : '';
}

function dateFieldToString(val) {
  if (typeof val === 'number' && val > 20000) return excelDateToISO(val) || '';
  return norm(val);
}

// ── 1. NROS-CLIENTE-SERVICIOS → lookup por alquilerId ────────────────────────
const nrosSheet = wb.Sheets['NROS-CLIENTE-SERVICIOS'];
if (!nrosSheet) { console.error('ERROR: Hoja NROS-CLIENTE-SERVICIOS no encontrada'); process.exit(1); }
const nrosRaw = XLSX.utils.sheet_to_json(nrosSheet, { header: 1, defval: '' });
console.log(`NROS-CLIENTE-SERVICIOS: ${nrosRaw.length - 1} filas`);

const nrosMap = {};
nrosRaw.slice(1).forEach(r => {
  const id = Number(r[0]);
  if (id) {
    nrosMap[id] = {
      AGIP:     toAccountNumber(r[5]),
      METROGAS: toAccountNumber(r[6]),
      EDESUR:   toAccountNumber(r[7]),
      AYSA:     toAccountNumber(r[8]),
    };
  }
});

// ── 2. ALQUILERES → data.json ─────────────────────────────────────────────────
const alqSheet = wb.Sheets['ALQUILERES'];
if (!alqSheet) { console.error('ERROR: Hoja ALQUILERES no encontrada'); process.exit(1); }
const alqRaw = XLSX.utils.sheet_to_json(alqSheet, { header: 1, defval: '' });
console.log(`ALQUILERES: ${alqRaw.length - 1} filas`);

const dataJSON = alqRaw.slice(1)
  .filter(r => r[0])   // debe tener id
  .map(r => {
    const id = Number(r[0]);

    // Montos: columnas 9–13 (hasta 5 valores)
    const montoSources = [r[9], r[10], r[11], r[12], r[13]];
    const montos = [];
    let monto_inicial = 0;
    montoSources.forEach((m, i) => {
      if (m === '' || m === null || m === undefined) return;
      const v = parseMoney(m);
      if (v > 0) {
        montos.push({ numero: montos.length + 1, monto: v });
        if (i === 0) monto_inicial = v;
      }
    });

    const nros = nrosMap[id] || { AGIP: null, METROGAS: null, EDESUR: null, AYSA: null };

    return {
      createdAt: new Date().toISOString(),
      id,
      locador: {
        apellido:  norm(r[1]),
        nombre:    norm(r[2]),
        direccion: norm(r[3]),
        telefono:  norm(r[4]),
      },
      locatario: {
        apellido: norm(r[5]),
        nombre:   norm(r[6]),
      },
      inmueble: {
        direccion: norm(r[7]),
        telefono:  norm(r[8]),
      },
      impuestos: nros,
      monto_inicial,
      fecha_inicio:        excelDateToISO(r[14]),
      fecha_fin:           excelDateToISO(r[15]),
      deposito_garantia:   parseMoney(r[16]),
      actualizacion_meses: r[18] !== '' ? Number(r[18]) : null,
      honorario:           5,
      indice:              normalizeIndice(r[19]),
      montos,
    };
  });

fs.writeFileSync(path.join(DB_DIR, 'data.json'), JSON.stringify(dataJSON));
console.log(`✓ data.json: ${dataJSON.length} contratos`);

// Lookup para joins
const alqLookup = {};
dataJSON.forEach(a => { alqLookup[a.id] = a; });

// ── 3. IMPUESTOS-ENTREGADOS → impuestos.json ─────────────────────────────────
const impSheet = wb.Sheets['IMPUESTOS-ENTREGADOS'];
if (!impSheet) { console.error('ERROR: Hoja IMPUESTOS-ENTREGADOS no encontrada'); process.exit(1); }
const impRaw = XLSX.utils.sheet_to_json(impSheet, { header: 1, defval: '' });
console.log(`IMPUESTOS-ENTREGADOS: ${impRaw.length - 1} filas`);

const impuestosJSON = impRaw.slice(1)
  .filter(r => r[1] && r[2])   // debe tener fecha y alquilerId
  .map(r => {
    const alquilerId = Number(r[2]);
    const isoFecha = excelDateToISO(r[1]);
    const rec = { alquilerId, fecha: isoFecha };
    const aysaVto        = dateFieldToString(r[3]);
    const inmobAblCuota  = dateFieldToString(r[4]);
    const edesur         = dateFieldToString(r[5]);
    const metrogasVto    = dateFieldToString(r[6]);
    const telefono       = dateFieldToString(r[7]);
    const expensasPeriodo = norm(r[8]);
    const otros           = norm(r[9]);
    // Solo incluir campos con valor para reducir tamaño del archivo
    if (aysaVto)        rec.aysaVto        = aysaVto;
    if (inmobAblCuota)  rec.inmobAblCuota  = inmobAblCuota;
    if (edesur)         rec.edesur         = edesur;
    if (metrogasVto)    rec.metrogasVto    = metrogasVto;
    if (telefono)       rec.telefono       = telefono;
    if (expensasPeriodo) rec.expensasPeriodo = expensasPeriodo;
    if (otros)          rec.otros          = otros;
    return rec;
  });

fs.writeFileSync(path.join(DB_DIR, 'impuestos.json'), JSON.stringify(impuestosJSON));
console.log(`✓ impuestos.json: ${impuestosJSON.length} registros`);

// ── 4. RECIBOS-PAGO → recibos-alq.json ───────────────────────────────────────
// Importante: el recibo refleja lo que ABONÓ el inquilino (importe bruto), por eso
// se usa la hoja RECIBOS-PAGO ("Importe pagado"). NO usar LIQUIDACION-ALQUILERES,
// cuya columna "importe alq liquidado" es el neto que se le liquida al dueño
// (bruto menos honorarios). Columnas: 1=Idalquiler, 2=Fecha Pago, 3=Importe pagado, 4=Período pagado.
const recibosSheet = wb.Sheets['RECIBOS-PAGO'];
if (!recibosSheet) { console.error('ERROR: Hoja RECIBOS-PAGO no encontrada'); process.exit(1); }
const recibosRaw = XLSX.utils.sheet_to_json(recibosSheet, { header: 1, defval: '' });
console.log(`RECIBOS-PAGO: ${recibosRaw.length - 1} filas`);

const recibosJSON = recibosRaw.slice(1)
  .filter(r => r[1] && r[2])   // debe tener alquilerId y fecha
  .map(r => {
    const isoFecha = excelDateToISO(r[2]);
    return {
      alquilerId: Number(r[1]),
      importe:    parseMoney(r[3]),   // bruto pagado por el inquilino
      fecha:      isoFecha,
      periodo:    periodoToString(r[4], r[2]),
    };
  });

fs.writeFileSync(path.join(DB_DIR, 'recibos-alq.json'), JSON.stringify(recibosJSON));
console.log(`✓ recibos-alq.json: ${recibosJSON.length} registros`);

// ── 5. papeles-rosa.json → vacío ──────────────────────────────────────────────
fs.writeFileSync(path.join(DB_DIR, 'papeles-rosa.json'), '[]');
console.log('✓ papeles-rosa.json: vacío');

console.log('\nImportación completa.');
