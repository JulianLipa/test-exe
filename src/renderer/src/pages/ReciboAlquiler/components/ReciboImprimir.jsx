import { formatCurrency } from "./form.utils";
import PrintHeader from "../../../components/PrintHeader";
import PrintPage from "../../../components/PrintPage";

export default function ReciboImprimir({ form, alquiler }) {
  if (!alquiler) return null;

  const fecha = form.fecha
    ? new Date(form.fecha + "T00:00:00").toLocaleDateString("es-AR")
    : "";

  const importe = Number(form.importe) || 0;
  const honorarioPct = Number(alquiler.honorario) || 0;
  const honorarios = importe * (honorarioPct / 100);
  const neto = importe - honorarios;

  const locatarioNombre = [alquiler.locatario?.apellido, alquiler.locatario?.nombre]
    .filter(Boolean).join(", ");
  const locadorNombre = [alquiler.locador?.apellido, alquiler.locador?.nombre]
    .filter(Boolean).join(", ");

  return (
    <PrintPage>

      {/* ── RECIBO (1ra copia) ── */}
      <ReciboSection
        fecha={fecha}
        alquiler={alquiler}
        locatarioNombre={locatarioNombre}
        locadorNombre={locadorNombre}
        periodo={form.periodo}
        importe={importe}
      />

      {/* ── RECIBO (2da copia) ── */}
      <ReciboSection
        fecha={fecha}
        alquiler={alquiler}
        locatarioNombre={locatarioNombre}
        locadorNombre={locadorNombre}
        periodo={form.periodo}
        importe={importe}
      />

      {/* ── LIQUIDACION (página nueva, 2 copias) ── */}
      <div className="break-before-page">
        <LiquidacionSection
          fecha={fecha}
          alquiler={alquiler}
          locadorNombre={locadorNombre}
          periodo={form.periodo}
          neto={neto}
        />

        <LiquidacionSection
          fecha={fecha}
          alquiler={alquiler}
          locadorNombre={locadorNombre}
          periodo={form.periodo}
          neto={neto}
        />
      </div>

    </PrintPage>
  );
}

function ReciboSection({ fecha, alquiler, locatarioNombre, locadorNombre, periodo, importe }) {
  return (
    <div className="recibo-mitad">
      <PrintHeader />

      <hr className="border-0 border-t border-[#333] my-[5px]" />
      <h2 className="text-[1.15em] font-bold mb-[4px] uppercase tracking-[1px]">
        Recibo de Alquiler por Cuenta de Tercero
      </h2>
      <hr className="border-0 border-t border-[#333] my-[5px]" />

      <div className="flex flex-col gap-[5px] my-[5px]">
        <Row label="Fecha" value={fecha} />
        <div className="h-[8px]" />
        <Row label="Contrato N°" value={alquiler.id} />
        <Row label="Recibí de" value={locatarioNombre} />
        <Row label="Locador" value={locadorNombre} />
        <Row label="Inmueble" value={alquiler.inmueble?.direccion} />
        <Row label="Período" value={periodo} />
      </div>

      <hr className="border-0 border-t border-[#333] mt-[5px]" />

      <Footer total={formatCurrency(importe)} firmaLabel="Firma" />
    </div>
  );
}

function LiquidacionSection({ fecha, alquiler, locadorNombre, periodo, neto }) {
  return (
    <div className="recibo-mitad">
      <PrintHeader />

      <hr className="border-0 border-t border-[#333] my-[5px]" />
      <h2 className="text-[1.15em] font-bold mb-[4px] uppercase tracking-[1px]">
        Liquidación de Alquiler
      </h2>
      <hr className="border-0 border-t border-[#333] my-[5px]" />

      <div className="flex flex-col gap-[5px] my-[5px]">
        <Row label="Fecha" value={fecha} />
        <div className="h-[8px]" />
        <Row label="Contrato N°" value={alquiler.id} />
        <Row label="Señor/a" value={locadorNombre} />
        <Row label="Dirección" value={alquiler.locador?.direccion} />
        <Row label="Inmueble" value={alquiler.inmueble?.direccion} />
        <Row label="Período" value={periodo} />
      </div>

      <hr className="border-0 border-t border-[#333] mt-[5px]" />

      <Footer total={formatCurrency(neto)} firmaLabel="Firma del propietario" />
    </div>
  );
}

function Footer({ total, firmaLabel }) {
  return (
    <div className="flex justify-between items-start">
      <span className="mt-2 text-[1.08em] font-bold">Total {total}</span>
      <div className="flex flex-col items-center text-[0.92em] font-semibold min-w-[180px]">
        <div className="w-full h-[52px] border-x border-b border-[#333]" />
        <span>{firmaLabel}</span>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-[8px]">
      <span className="font-bold min-w-[110px] text-[1em]">{label}</span>
      <span className="font-medium text-[1em]">{value}</span>
    </div>
  );
}
