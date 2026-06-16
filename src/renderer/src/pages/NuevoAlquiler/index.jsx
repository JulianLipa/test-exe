import { useNavigate, useLocation, Link } from "react-router-dom";
import { formConfig } from "./config/formConfig";
import { useNuevoAlquiler } from "./useNuevoAlquiler";
import { updateNestedValue } from "./utils/updateNestedValue";
import { formatForm } from "./utils/formatForm";

import Section from "./components/Section";
import FormField from "./components/FormField";
import ConfirmModal from "../../components/ConfirmModal";

import { useEffect, useState } from "react";

const calculatePeriods = (start, end, intervalMonths) => {
  if (!start || !end || !intervalMonths) return 0;

  const s = new Date(start);
  const e = new Date(end);

  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());

  if (months <= 0) return 0;

  return Math.floor(months / Number(intervalMonths));
};

const NuevoAlquiler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location.state?.editId ?? null;
  const isEditing = editId != null;
  const { form, setForm, loading } = useNuevoAlquiler(editId);

  const [showSave, setShowSave] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "-") setShowCancel(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => updateNestedValue(prev, name, value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSave(true);
  };

  const confirmSave = async () => {
    const periodos = calculatePeriods(
      form.fecha_inicio,
      form.fecha_fin,
      form.actualizacion_meses,
    );

    // Si ya existían montos ingresados (edición), se preservan por número
    // en vez de reiniciarlos en null.
    const existingMontos = Array.isArray(form.montos) ? form.montos : [];
    const montos = Array.from({ length: periodos }, (_, i) => {
      const numero = i + 1;
      const previo = existingMontos.find((m) => m.numero === numero);
      return { numero, monto: previo ? previo.monto : null };
    });

    const data = {
      ...formatForm(form),
      periodos_ajuste: periodos,
      montos,
    };

    const res = isEditing
      ? await window.store.updateItem(data)
      : await window.store.addItem(data);

    if (res.ok) navigate(isEditing ? "/listadoAlquiler" : "/");
  };

  const periodosPreview = calculatePeriods(
    form.fecha_inicio,
    form.fecha_fin,
    form.actualizacion_meses,
  );

  if (loading) {
    return (
      <div>
        <h2>Editar Alquiler</h2>
        <p>Cargando datos del contrato...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{isEditing ? "Editar Alquiler" : "Nuevo Alquiler"}</h2>

      <form onSubmit={handleSubmit} className="pb-5">
        <input name="id" value={form.id} readOnly />

        {formConfig.map((section) => (
          <Section key={section.section} title={section.section}>
            {section.fields.map((field) => {
              const value = field.name
                .split(".")
                .reduce((acc, key) => acc?.[key], form);

              if (field.type === "select") {
                return (
                  <div key={field.name}>
                    <p>{field.label}</p>
                    <select
                      name={field.name}
                      value={value}
                      onChange={handleChange}
                      required={field.required}
                    >
                      <option value="">Seleccionar</option>
                      {field.options.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <FormField
                  key={field.name}
                  {...field}
                  value={value}
                  onChange={handleChange}
                />
              );
            })}
          </Section>
        ))}

        <div className="gap-4 flex">
          <button type="submit" className="">
            Guardar
          </button>
          <button type="button" onClick={() => setShowCancel(true)}>
            Cancelar
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showSave || showCancel}
        onConfirm={showSave ? confirmSave : () => navigate(isEditing ? "/listadoAlquiler" : "/")}
        onCancel={showSave ? () => setShowSave(false) : () => setShowCancel(false)}
      >
        {showSave && (
          <>
            <p>¿Confirmar guardado?</p>
            <p>Ajustes: {periodosPreview}</p>

            <div className="flex gap-2">
              <button onClick={confirmSave} className="buttonBlack">
                Confirmar
              </button>
              <button onClick={() => setShowSave(false)}>Volver</button>
            </div>
          </>
        )}

        {showCancel && (
          <div className="flex flex-col gap-2">
            <p>¿Seguro que querés Cancelar?</p>
            <div className="flex gap-2">
              <Link to={isEditing ? "/listadoAlquiler" : "/"} className="buttonBlack">
                Sí
              </Link>
              <button className="" onClick={() => setShowCancel(false)}>
                Seguir ingresando
              </button>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default NuevoAlquiler;
