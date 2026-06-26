import { useCallback, useEffect, useRef } from "react";
import ImpuestosImprimir from "../Impuestos/ImpuestosImprimir";
import PrinterIcon from "../../components/PrinterIcon";
import ScrollTopTable from "../../components/ScrollTopTable/ScrollTopTable.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import ContratoCards from "../../components/ContratoCards.jsx";
import ContratoSeleccionado from "../../components/ContratoSeleccionado.jsx";
import VolverModal from "../../components/VolverModal.jsx";
import { fmtDate } from "../../utils/formatters.js";
import { thStyle, tdStyle, trStyle } from "../../utils/tableStyles.js";
import { usePrint } from "../../hooks/usePrint.jsx";
import { useListadoPage } from "../../hooks/useListadoPage.js";
import { useContratoSearch } from "../../hooks/useContratoSearch.js";

const COLS = [
  { label: "N° Contrato",     render: (i) => i.alquilerId ?? "-" },
  { label: "Fecha",           render: (i) => fmtDate(i.fecha) },
  { label: "AYSA Vto.",       render: (i) => i.aysaVto || "-" },
  { label: "Metrogas Vto.",   render: (i) => i.metrogasVto || "-" },
  { label: "Inmob/ABL Cuota", render: (i) => i.inmobAblCuota || "-" },
  { label: "Edesur",          render: (i) => i.edesur || "-" },
  { label: "Teléfono",        render: (i) => i.telefono || "-" },
  { label: "Expensas",        render: (i) => i.expensasPeriodo || "-" },
  { label: "Otros",           render: (i) => i.otros || "-" },
];

export default function ListadoImpuestos() {
  const fetchRecords = useCallback(async (alqId) => {
    const all = await window.store.getImpuestos();
    return (all ?? [])
      .filter((i) => String(i.alquilerId ?? "") === alqId)
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, []);

  const {
    searchInput, setSearchInput,
    contratos, searched,
    selected, records: impuestos, loading,
    handleSearch, handleSelect, clearSelection,
  } = useContratoSearch(fetchRecords);

  const { showVolver, setShowVolver, goBack } = useListadoPage();
  const firstInputRef = useRef(null);
  const { triggerPrint, portal } = usePrint();
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de impuestos</h2>
      </div>

      <SearchBar
        ref={firstInputRef}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={handleSearch}
      />

      <VolverModal open={showVolver} onConfirm={goBack} onCancel={() => setShowVolver(false)} />

      {loading && <p className="thin">Buscando...</p>}

      {!loading && !selected && (
        <>
          {searched && contratos.length === 0 && (
            <p className="thin">No se encontraron contratos.</p>
          )}
          {contratos.length > 0 && (
            <ContratoCards alquileres={contratos} selectedId={null} onSelect={handleSelect} />
          )}
        </>
      )}

      {!loading && selected && (
        <>
          <ContratoSeleccionado alquiler={selected} onCambiar={clearSelection} />

          {impuestos.length === 0 ? (
            <p className="thin">No hay impuestos para el contrato N° {selected.id}.</p>
          ) : (
            <ScrollTopTable>
              <table style={{ borderCollapse: "collapse", width: "auto" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Imprimir</th>
                    {COLS.map((col) => <th key={col.label} style={thStyle}>{col.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {impuestos.map((item, i) => (
                    <tr
                      key={`${item.alquilerId}-${item.fecha}-${i}`}
                      style={trStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => triggerPrint(
                            <ImpuestosImprimir form={item} alquiler={selected} alquilerId={String(item.alquilerId)} />
                          )}
                        >
                          <PrinterIcon />
                        </button>
                      </td>
                      {COLS.map((col) => <td key={col.label} style={tdStyle}>{col.render(item)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollTopTable>
          )}
        </>
      )}

      {portal}
    </div>
  );
}
