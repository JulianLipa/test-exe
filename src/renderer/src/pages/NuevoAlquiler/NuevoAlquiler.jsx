import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { ConfirmModal, FormField, Section } from "@renderer/components/shared";
import {
  calculatePeriods,
  formatForm,
  updateNestedValue,
} from "@renderer/utils";
import { store } from "@renderer/services/store";

import { formConfig } from "./config/formConfig";
import { useNuevoAlquiler } from "./hooks/useNuevoAlquiler";

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

    const res = await store.addItem(data);

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
