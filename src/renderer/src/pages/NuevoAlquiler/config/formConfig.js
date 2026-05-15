export const formConfig = [
  {
    section: "Locador",
    fields: [
      { name: "locador.apellido", label: "Apellido", required: true },
      { name: "locador.nombre", label: "Nombre", required: true },
      { name: "locador.direccion", label: "Dirección", required: true },
      { name: "locador.telefono", label: "Teléfono", type: "number" },
    ],
  },
  {
    section: "Locatario",
    fields: [
      { name: "locatario.apellido", label: "Apellido", required: true },
      { name: "locatario.nombre", label: "Nombre", required: true },
      {
        name: "inmueble.direccion",
        label: "Dirección inmueble",
        required: true,
      },
      { name: "inmueble.telefono", label: "Teléfono inmueble", type: "number" },
    ],
  },
  {
    section: "Impuestos",
    fields: [
      { name: "impuestos.AGIP", label: "AGIP", type: "number" },
      { name: "impuestos.AYSA", label: "AYSA", type: "number" },
      { name: "impuestos.EDESUR", label: "EDESUR", type: "number" },
      { name: "impuestos.METROGAS", label: "METROGAS", type: "number" },
    ],
  },
  {
    section: "Contrato",
    fields: [
      {
        name: "monto_inicial",
        label: "Monto inicial",
        type: "number",
        required: true,
      },
      {
        name: "fecha_inicio",
        label: "Fecha inicio",
        type: "date",
        required: true,
      },
      { name: "fecha_fin", label: "Fecha fin", type: "date", required: true },
      {
        name: "deposito_garantia",
        label: "Depósito",
        type: "number",
        required: true,
      },
      {
        name: "actualizacion_meses",
        label: "Actualización (Meses)",
        type: "number",
        required: true,
      },
      {
        name: "honorario",
        label: "Honorario",
        type: "number",
        required: true,
      },

      {
        name: "indice",
        label: "Índice",
        type: "select",
        options: ["ICL", "IPC", "CASA_PROPIA"],
        required: true,
      },
    ],
  },
];
