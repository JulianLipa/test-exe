import { useState } from "react";
import AlquilerSelector from "../../components/AlquilerSelector";
import NuevoRecibo from "./components/NuevoRecibo";

export default function Page() {
  const [alquiler, setAlquiler]     = useState(null);
  const [alquilerId, setAlquilerId] = useState("");

  const handleChange = (a, id) => {
    setAlquiler(a);
    setAlquilerId(id);
  };

  return (
    <div className="montserrat flex flex-col gap-6">
      <h2 className="text-xl">Ingresar recibo</h2>

      <AlquilerSelector onChange={handleChange} />

      <NuevoRecibo alquiler={alquiler} alquilerId={alquilerId} />
    </div>
  );
}
