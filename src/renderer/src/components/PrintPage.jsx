// Tamaño base de tipografía para todos los recibos imprimibles.
// Modificar este valor afecta a todos los comprobantes.
const BASE_FONT_PX = 12;

export default function PrintPage({ children }) {
  return (
    <div style={{ fontSize: BASE_FONT_PX }}>
      {children}
    </div>
  );
}
