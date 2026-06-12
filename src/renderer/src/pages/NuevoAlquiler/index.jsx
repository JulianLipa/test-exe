import { useNavigate, Link } from "react-router-dom";
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
  const { form, setForm } = useNuevoAlquiler();

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

    const montos = Array.from({ length: periodos }, (_, i) => ({
      numero: i + 1,
      monto: null,
    }));

    const data = {
      ...formatForm(form),
      periodos_ajuste: periodos,
      montos,
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

      <ConfirmModal
        open={showSave || showCancel}
        onConfirm={showSave ? confirmSave : () => navigate("/")}
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
              <Link to="/" className="buttonBlack">
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
