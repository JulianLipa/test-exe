import { useCallback, useEffect, useRef } from "react";
import ReciboImprimir from "../ReciboAlquiler/components/ReciboImprimir";
import { formatCurrency } from "../ReciboAlquiler/components/form.utils";
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

const normalizeRecibo = (r) => ({
  ...r,
  alquilerId: r.alquilerId ?? r.id ?? null,
  periodo: typeof r.periodo === "string" || typeof r.periodo === "number" ? r.periodo : "",
});

export default function ListadoRecibos() {
  const fetchRecords = useCallback(async (alqId) => {
    const all = await window.store.getRecibos();
    return (all ?? [])
      .filter((r) => String(r.alquilerId ?? r.id ?? "") === alqId)
      .map(normalizeRecibo)
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, []);

  const {
    searchInput, setSearchInput,
    contratos, searched,
    selected, records: recibos, loading,
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
        <h2>Listado de recibos</h2>
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

          {recibos.length === 0 ? (
            <p className="thin">No hay recibos para el contrato N° {selected.id}.</p>
          ) : (
            <ScrollTopTable>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Imprimir</th>
                    {["N° Contrato", "Período", "Fecha", "Importe"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recibos.map((item, i) => (
                    <tr
                      key={`${item.alquilerId}-${item.fecha}-${i}`}
                      style={trStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={tdStyle}>
                        <button type="button" onClick={() => triggerPrint(<ReciboImprimir form={item} alquiler={selected} />)}>
                          <PrinterIcon />
                        </button>
                      </td>
                      <td style={tdStyle}>{item.alquilerId ?? "-"}</td>
                      <td style={tdStyle}>{item.periodo || "-"}</td>
                      <td style={tdStyle}>{fmtDate(item.fecha)}</td>
                      <td style={tdStyle}>{formatCurrency(item.importe) || "-"}</td>
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
