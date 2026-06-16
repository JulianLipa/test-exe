import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

const fmt = (value) => {
  if (!value && value !== 0) return "-";
  return Number(value).toLocaleString("es-AR");
};

const fmtDate = (value) => {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("es-AR");
};

const selectStyle = {
  background: "rgba(237,242,248,0.08)",
  color: "rgb(237,242,248)",
  border: "1px solid rgba(237,242,248,0.2)",
  borderRadius: "0.4em",
  padding: "4px 8px",
  fontSize: "0.88em",
  cursor: "pointer",
};

const inputStyle = {
  background: "rgba(237,242,248,0.08)",
  color: "rgb(237,242,248)",
  border: "1px solid rgba(237,242,248,0.2)",
  borderRadius: "0.4em",
  padding: "4px 8px",
  fontSize: "0.88em",
  width: "100px",
};

export default function ListadoAlquileres() {
  const [data, setData] = useState([]);
  const [showVolver, setShowVolver] = useState(false);
  const [montoEdits, setMontoEdits] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "-") setShowVolver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const db = await window.store.loadDB();
        const list = Array.isArray(db)
          ? db
          : Object.values(db || {}).find((v) => Array.isArray(v)) || [];
        setData(list);
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, []);

  // Precarga el monto seleccionado (o el primero) para cada alquiler.
  const getMontoEdit = (a) => {
    const edit = montoEdits[a.id];
    if (edit) return edit;
    const primero = a.montos?.[0];
    return { numero: primero?.numero ?? "", value: primero?.monto ?? "" };
  };

  const handleMontoSelect = (a, numero) => {
    const encontrado = a.montos.find((m) => String(m.numero) === String(numero));
    setMontoEdits((prev) => ({
      ...prev,
      [a.id]: { numero, value: encontrado?.monto ?? "" },
    }));
  };

  const handleMontoValueChange = (a, value) => {
    setMontoEdits((prev) => ({
      ...prev,
      [a.id]: { ...getMontoEdit(a), value },
    }));
  };

  const handleMontoSave = async (a) => {
    const edit = getMontoEdit(a);
    if (!edit.numero) return;
    try {
      const res = await window.store.updateMonto(a.id, Number(edit.numero), Number(edit.value));
      if (!res?.ok) { alert("Error al guardar el monto"); return; }
      setData((prev) =>
        prev.map((item) =>
          item.id === a.id
            ? {
                ...item,
                montos: item.montos.map((m) =>
                  m.numero === Number(edit.numero) ? { ...m, monto: Number(edit.value) } : m,
                ),
              }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Error al guardar el monto");
    }
  };

  const COLS = [
    { label: "N°",         render: (a) => a.id },
    { label: "Locador",    render: (a) => `${a.locador?.apellido || "-"}, ${a.locador?.nombre || "-"}` },
    { label: "Locatario",  render: (a) => `${a.locatario?.apellido || "-"}, ${a.locatario?.nombre || "-"}` },
    { label: "Inmueble",   render: (a) => a.inmueble?.direccion || "-" },
    { label: "Inicio",     render: (a) => fmtDate(a.fecha_inicio) },
    { label: "Fin",        render: (a) => fmtDate(a.fecha_fin) },
    {
      label: "Montos",
      render: (a) => {
        if (!a.montos?.length) return `$${fmt(a.monto_inicial)}`;
        const edit = getMontoEdit(a);
        return (
          <div className="flex items-center gap-2">
            <select
              style={selectStyle}
              value={edit.numero}
              onChange={(e) => handleMontoSelect(a, e.target.value)}
            >
              {a.montos.map((m) => (
                <option key={m.numero} value={m.numero} style={{ color: "rgb(14,25,37)" }}>
                  {`Monto N°${m.numero}`}
                </option>
              ))}
            </select>
            <input
              type="number"
              style={inputStyle}
              value={edit.value}
              placeholder="Monto"
              onChange={(e) => handleMontoValueChange(a, e.target.value)}
            />
            <button type="button" onClick={() => handleMontoSave(a)}>
              Guardar
            </button>
          </div>
        );
      },
    },
    { label: "Honorario",  render: (a) => a.honorario ? `${a.honorario}%` : "-" },
    { label: "Índice",     render: (a) => a.indice || "-" },
    { label: "Actualiz.",  render: (a) => a.actualizacion_meses ? `${a.actualizacion_meses}m` : "-" },
    {
      label: "Editar",
      render: (a) => (
        <Link to="/nuevoAlquiler" state={{ editId: a.id }}>
          <button type="button">Editar</button>
        </Link>
      ),
    },
  ];

  return (
    <div className="montserrat flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <button onClick={() => setShowVolver(true)}>[-] Volver</button>
        <h2>Listado de alquileres</h2>
      </div>

      <ConfirmModal
        open={showVolver}
        onConfirm={() => navigate("/")}
        onCancel={() => setShowVolver(false)}
      >
        <div className="p-4">
          <p className="mb-4">¿Seguro que querés volver al menú?</p>
          <div className="flex gap-2">
            <button onClick={() => navigate("/")} className="buttonBlack">Sí</button>
            <button onClick={() => setShowVolver(false)}>Cancelar</button>
          </div>
        </div>
      </ConfirmModal>

      {data.length === 0 ? (
        <p className="thin">No hay alquileres registrados.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {COLS.map((col) => (
                  <th
                    key={col.label}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(237,242,248,0.2)",
                      color: "rgba(237,242,248,0.5)",
                      fontWeight: 600,
                      fontSize: "0.78em",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr
                  key={item.id ?? i}
                  style={{
                    borderBottom: "1px solid rgba(237,242,248,0.08)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(237,242,248,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {COLS.map((col) => (
                    <td
                      key={col.label}
                      style={{
                        padding: "10px 14px",
                        color: "rgb(237,242,248)",
                        fontWeight: 500,
                        fontSize: "0.9em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
