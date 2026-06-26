import logo from "../imgs/LOGOTIPO-NEGATIVO-BG.svg";

export default function PrintHeader() {
  return (
    <div className="flex justify-between items-start mb-[6px]">
      <img src={logo} alt="Logo" className="h-[65px] w-auto" />
      <div className="flex flex-col items-end text-[0.85em] font-medium leading-[1.5] text-[#222]">
        <span>Ministro Brin 505 (1158) CABA</span>
        <span>Buenos Aires,</span>
        <span>CUIT 27 - 22294095 - 3</span>
        <span>Ing. Brutos 1522635 - 2</span>
        <span>Inicio de Actividades 08/2004</span>
      </div>
    </div>
  );
}
