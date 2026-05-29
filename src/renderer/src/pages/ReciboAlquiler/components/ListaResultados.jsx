export default function ListaResultados({
  resultados,
  selectedAlquiler,
  setSelectedAlquiler,
}) {
  if (!resultados.length) return null;

  return (
    <div className="flex gap-3 flex-wrap">
      {resultados.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelectedAlquiler(item)}
          className={`border rounded p-5 text-left transition ${
            selectedAlquiler?.id === item.id ? "border-black bg-gray-100" : ""
          }`}
        >
          <div>{item.id}</div>

          <div>{item.locador?.apellido}</div>

          <div>{item.locatario?.apellido}</div>

          <div>{item.inmueble?.direccion}</div>
        </button>
      ))}
    </div>
  );
}
