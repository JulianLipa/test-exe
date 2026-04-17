import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import style from "./NuevoAlquiler.module.css";

import Section from "./components/Section";
import FormField from "./components/FormField";
import ConfirmModal from "./components/ConfirmModal";
import { formatForm } from "./utils/formatForm";

const NuevoAlquiler = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const [form, setForm] = useState({
    id: "",
    locador: {
      apellido: "",
      nombre: "",
      direccion: "",
      telefono: "",
    },
    locatario: {
      apellido: "",
      nombre: "",
    },
    inmueble: {
      direccion: "",
      telefono: "",
    },
    impuestos: {
      AGIP: "",
      AYSA: "",
      EDESUR: "",
      METROGAS: "",
    },
    monto_inicial: "",
    fecha_inicio: "",
    fecha_fin: "",
    deposito_garantia: "",
    actualizacion_meses: "",
    indice: "",
  });

  useEffect(() => {
    const load = async () => {
      const db = await window.store.loadDB();

      setData(db);

      const maxId = db.length ? Math.max(...db.map((e) => e.id)) : 0;

      setForm((prev) => ({
        ...prev,
        id: maxId + 1,
      }));
    };

    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [p, c] = name.split(".");

      setForm((prev) => ({
        ...prev,
        [p]: {
          ...prev[p],
          [c]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmSave(true);
  };

  const confirmSave = async () => {
    const res = await window.store.addItem(formatForm(form));

    if (res.ok) {
      navigate("/");
    }

    setShowConfirmSave(false);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setShowConfirmCancel(true);
  };

  if (!form) return null;

  return (
    <div>
      <h2 className="mb-5">Nuevo Alquiler</h2>

      <form onSubmit={handleSubmit}>
        <input name="id" value={form.id} readOnly />

        {/* ================= LOCADOR ================= */}
        <Section title="Locador">
          <FormField
            label="Apellido"
            name="locador.apellido"
            value={form.locador.apellido}
            onChange={handleChange}
            required
          />
          <FormField
            label="Nombre"
            name="locador.nombre"
            value={form.locador.nombre}
            onChange={handleChange}
            required
          />
          <FormField
            label="Direccion"
            name="locador.direccion"
            value={form.locador.direccion}
            onChange={handleChange}
            required
          />
          <FormField
            label="Telefono"
            name="locador.telefono"
            value={form.locador.telefono}
            onChange={handleChange}
            type="number"
          />
        </Section>

        {/* ================= LOCATARIO ================= */}
        <Section title="Locatario">
          <FormField
            label="Apellido"
            name="locatario.apellido"
            value={form.locatario.apellido}
            onChange={handleChange}
            required
          />
          <FormField
            label="Nombre"
            name="locatario.nombre"
            value={form.locatario.nombre}
            onChange={handleChange}
            required
          />
          <FormField
            label="Direccion inmueble"
            name="inmueble.direccion"
            value={form.inmueble.direccion}
            onChange={handleChange}
            required
          />
          <FormField
            label="Telefono inmueble"
            name="inmueble.telefono"
            value={form.inmueble.telefono}
            onChange={handleChange}
            type="number"
          />
        </Section>

        {/* ================= IMPUESTOS ================= */}
        <Section title="Impuestos">
          <FormField
            label="AGIP"
            name="impuestos.AGIP"
            value={form.impuestos.AGIP}
            onChange={handleChange}
            type="number"
          />
          <FormField
            label="AYSA"
            name="impuestos.AYSA"
            value={form.impuestos.AYSA}
            onChange={handleChange}
            type="number"
          />
          <FormField
            label="EDESUR"
            name="impuestos.EDESUR"
            value={form.impuestos.EDESUR}
            onChange={handleChange}
            type="number"
          />
          <FormField
            label="METROGAS"
            name="impuestos.METROGAS"
            value={form.impuestos.METROGAS}
            onChange={handleChange}
            type="number"
          />
        </Section>

        {/* ================= CONTRATO ================= */}
        <Section title="Contrato">
          <FormField
            label="Monto inicial"
            name="monto_inicial"
            value={form.monto_inicial}
            onChange={handleChange}
            type="number"
            required
          />
          <FormField
            label="Fecha inicio"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            type="date"
            required
          />
          <FormField
            label="Fecha fin"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            type="date"
            required
          />
          <FormField
            label="Deposito garantia"
            name="deposito_garantia"
            value={form.deposito_garantia}
            onChange={handleChange}
            type="number"
            required
          />
          <FormField
            label="Actualizacion meses"
            name="actualizacion_meses"
            value={form.actualizacion_meses}
            onChange={handleChange}
            type="number"
            required
          />

          <div className="flex flex-col">
            <p>Índice</p>
            <select
              name="indice"
              value={form.indice}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar índice</option>
              <option value="ICL">ICL</option>
              <option value="IPC">IPC</option>
              <option value="CASA_PROPIA">CASA PROPIA</option>
            </select>
          </div>
        </Section>

        {/* ================= ACTIONS ================= */}
        <div className="mt-5 gap-5 flex">
          <button type="submit">Guardar</button>
          <button type="button" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>

      {/* ================= MODAL ================= */}
      <ConfirmModal open={showConfirmSave || showConfirmCancel}>
        {showConfirmSave && (
          <>
            <div className="text-left">
              <p>
                <strong>Locador:</strong> {form.locador.apellido},{" "}
                {form.locador.nombre}
              </p>
              <p>
                <strong>Locatario:</strong> {form.locatario.apellido},{" "}
                {form.locatario.nombre}
              </p>
              <p>
                <strong>Dirección:</strong> {form.inmueble.direccion}
              </p>
              <p>
                <strong>Fecha inicio:</strong> {form.fecha_inicio}
              </p>
              <p>
                <strong>Fecha fin:</strong> {form.fecha_fin}
              </p>
              <p>
                <strong>Monto inicial:</strong> ${form.monto_inicial}
              </p>
              <p>
                <strong>Depósito:</strong> ${form.deposito_garantia}
              </p>
              <p>
                <strong>Actualización:</strong> cada {form.actualizacion_meses}{" "}
                meses ({form.indice})
              </p>
            </div>

            <div className="gap-5 mt-5 flex w-full justify-center">
              <button onClick={confirmSave}>Confirmar</button>
              <button onClick={() => setShowConfirmSave(false)}>Volver</button>
            </div>
          </>
        )}

        {showConfirmCancel && (
          <>
            <h3>¿Cancelar operación?</h3>
            <p>Se perderán los datos ingresados</p>

            <div className="gap-5 mt-5 flex w-full justify-center">
              <Link to="/">Sí, cancelar</Link>
              <button onClick={() => setShowConfirmCancel(false)}>
                Volver
              </button>
            </div>
          </>
        )}
      </ConfirmModal>
    </div>
  );
};

export default NuevoAlquiler;
