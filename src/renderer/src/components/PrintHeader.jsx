import logo from "../imgs/LOGOTIPO-NEGATIVO-BG.svg";

export default function PrintHeader() {
  return (
    <div className="recibo-print__header">
      <img src={logo} alt="Logo" className="recibo-print__logo" />
      <div className="recibo-print__header-info">
        <span>Ministro Brin 505 (1158) CABA</span>
        <span>Buenos Aires,</span>
        <span>CUIT 27 - 22294095 - 3</span>
        <span>Ing. Brutos 1522635 - 2</span>
        <span>Inicio de Actividades 08/2004</span>
      </div>
    </div>
  );
}
