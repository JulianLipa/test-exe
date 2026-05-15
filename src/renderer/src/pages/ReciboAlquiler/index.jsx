import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const MONTHS = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

function NuevoRecibo({ alquiler }) {
  const thisYear = useMemo(
    () => new Date().getFullYear(),
    [],
  );

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState({
    id: {
      value: alquiler?.id || "",
      type: "number",
    },

    importe: {
      value: "",
      type: "money",
    },

    fecha: {
      value: today,
      type: "date",
    },

    periodo: {
      month: "",
      year: "",
      type: "period",
    },
  });

  // =========================
  // HELPERS
  // =========================

  const formatCurrency = (value) => {
    if (!value) return "";

    return new Intl.NumberFormat(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      },
    ).format(Number(value));
  };

  const formatLabel = (text) => {
    if (!text) return "";

    const spaced =
      text.replace(/([A-Z])/g, " $1");

    return (
      spaced.charAt(0).toUpperCase() +
      spaced.slice(1)
    );
  };

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,

      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const setPeriodo = (field, value) => {
    setForm((prev) => ({
      ...prev,

      periodo: {
        ...prev.periodo,
        [field]: value,
      },
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      id: form.id.value,

      importe: Number(
        form.importe.value,
      ),

      fecha: form.fecha.value,

      periodo:
        form.periodo.month &&
        form.periodo.year
          ? `${form.periodo.month} ${form.periodo.year}`
          : "",

      alquiler,
    };

    try {
      const res =
        await window.store.addRecibo(
          data,
        );

      if (res?.ok) {
        alert(
          "Recibo guardado correctamente",
        );

        setForm({
          id: {
            value:
              alquiler?.id || "",
            type: "number",
          },

          importe: {
            value: "",
            type: "money",
          },

          fecha: {
            value: today,
            type: "date",
          },

          periodo: {
            month: "",
            year: "",
            type: "period",
          },
        });
      } else {
        alert(
          "Error al guardar recibo",
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error inesperado");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
      >
        <input
          type="number"
          placeholder={formatLabel(
            "id",
          )}
          value={form.id.value}
          readOnly
          className="bg-gray-100 border p-2 rounded"
        />

        <input
          type="text"
          placeholder={formatLabel(
            "importe",
          )}
          value={formatCurrency(
            form.importe.value,
          )}
          onChange={(e) => {
            const raw =
              e.target.value.replace(
                /[^\d]/g,
                "",
              );

            setField(
              "importe",
              raw,
            );
          }}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={form.fecha.value}
          onChange={(e) =>
            setField(
              "fecha",
              e.target.value,
            )
          }
          className="border p-2 rounded"
        />

        <div className="flex gap-2">
          <select
            value={
              form.periodo.month
            }
            onChange={(e) =>
              setPeriodo(
                "month",
                e.target.value,
              )
            }
            className="border p-2 rounded"
          >
            <option value="">
              Mes
            </option>

            {MONTHS.map((m) => (
              <option
                key={m}
                value={m}
              >
                {m}
              </option>
            ))}
          </select>

          <select
            value={
              form.periodo.year
            }
            onChange={(e) =>
              setPeriodo(
                "year",
                e.target.value,
              )
            }
            className="border p-2 rounded"
          >
            <option value="">
              Año
            </option>

            {Array.from(
              { length: 10 },
              (_, i) => {
                const year =
                  thisYear - i;

                return (
                  <option
                    key={year}
                  >
                    {year}
                  </option>
                );
              },
            )}
          </select>
        </div>

        <button
          type="submit"
          className="bg-black text-white p-2 rounded"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export default function Page() {
  const [apellido, setApellido] =
    useState("");

  const [resultados, setResultados] =
    useState([]);

  const [selectedAlquiler, setSelectedAlquiler] =
    useState(null);

  // =========================
  // BUSCAR LOCATARIO
  // =========================

  const handleSearch = async () => {
    try {
      if (!apellido.trim()) return;

      const data =
        await window.store.searchByApellidoLocatario(
          apellido,
        );

      setResultados(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="montserrat flex flex-col gap-6">
      <h2 className="text-xl">
        Ingresar recibo
      </h2>

      {/* =========================
          BUSQUEDA
      ========================= */}

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Apellido locatario"
          value={apellido}
          onChange={(e) =>
            setApellido(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={handleSearch}
          className="bg-black text-white px-4 rounded"
        >
          Buscar
        </button>

        <Link to="/">
          Volver
        </Link>
      </div>

      {/* =========================
          RESULTADOS
      ========================= */}

      <div className="flex gap-3">
        {resultados.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              setSelectedAlquiler(item)
            }
            className={`border rounded p-5 text-left transition ${
              selectedAlquiler?.id ===
              item.id
                ? "border-black bg-gray-100"
                : ""
            }`}
          >
            <div>{item.id}</div>

            <div>
              {item.locador?.apellido}
            </div>

            <div>
              {item.locatario?.apellido}
            </div>

            <div>
              {item.inmueble?.direccion}
            </div>
          </button>
        ))}
      </div>

      {/* =========================
          NUEVO RECIBO
      ========================= */}

      {selectedAlquiler && (
        <NuevoRecibo
          alquiler={selectedAlquiler}
        />
      )}
    </div>
  );
}