import { useCallback, useEffect, useRef } from "react";
import PapelRosaImprimir from "../PapelRosa/PapelRosaImprimir";
import PrinterIcon from "../../components/PrinterIcon";
import { formatCurrency } from "../ReciboAlquiler/components/form.utils";
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

export default function ListadoPapelRosa() {
  const fetchRecords = useCallback(async (alqId) => {
    const all = await window.store.getPapelRosa();
    return (all ?? [])
      .filter((p) => String(p.alquilerId ?? "") === alqId)
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, []);

  const {
    searchInput, setSearchInput,
    contratos, searched,
    selected, records: papeles, loading,
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
        <h2>Listado de papeles rosa</h2>
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

          {papeles.length === 0 ? (
            <p className="thin">No hay papeles rosa para el contrato N° {selected.id}.</p>
          ) : (
            <ScrollTopTable>
              <table style={{ borderCollapse: "collapse", width: "auto" }}>
                <thead>
                  <tr>
                    <th style={thStyle}><PrinterIcon /></th>
                    {["N° Contrato", "Período", "Fecha", "Monto total", "Total a cobrar"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {papeles.map((item, i) => (
                    <tr
                      key={`${item.alquilerId}-${item.createdAt ?? i}`}
                      style={trStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,242,248,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={tdStyle}>
                        <button type="button" onClick={() => triggerPrint(<PapelRosaImprimir data={item} />)}>
                          <PrinterIcon />
                        </button>
                      </td>
                      <td style={tdStyle}>{item.alquilerId ?? "-"}</td>
                      <td style={tdStyle}>{item.periodo || "-"}</td>
                      <td style={tdStyle}>{fmtDate(item.fecha)}</td>
                      <td style={tdStyle}>{formatCurrency(item.montoTotal)}</td>
                      <td style={tdStyle}>{formatCurrency(item.totalACobrar)}</td>
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
