import { useNavigate, Link } from "react-router-dom";
import { formConfig } from "./config/formConfig";
import { useNuevoAlquiler } from "./useNuevoAlquiler";
import { updateNestedValue } from "./utils/updateNestedValue";
import { formatForm } from "./utils/formatForm";

import Section from "./components/Section";
import FormField from "./components/FormField";
import ConfirmModal from "./components/ConfirmModal";

import { useState } from "react";

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
  const { form, setForm } = useNuevoAlquiler();

  const [showSave, setShowSave] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  if (!form) return null;

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

    const data = {
      ...formatForm(form),
      periodos_ajuste: periodos,
    };

    const res = await window.store.addItem(data);

    if (res.ok) navigate("/");
  };

  const periodosPreview = calculatePeriods(
    form.fecha_inicio,
    form.fecha_fin,
    form.actualizacion_meses,
  );

  return (
    <div>
      <h2>Nuevo Alquiler</h2>

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

      <ConfirmModal open={showSave || showCancel}>
        {showSave && (
          <>
            <p>¿Confirmar guardado?</p>
            <p>Ajustes: {periodosPreview}</p>

            <button onClick={confirmSave}>Confirmar</button>
            <button onClick={() => setShowSave(false)}>Volver</button>
          </>
        )}

        {showCancel && (
          <>
            <p>¿Cancelar?</p>
            <Link to="/">Sí</Link>
            <button onClick={() => setShowCancel(false)}>Volver</button>
          </>
        )}
      </ConfirmModal>
    </div>
  );
};

export default NuevoAlquiler;
