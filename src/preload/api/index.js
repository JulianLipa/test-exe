// Compone los módulos de dominio en el objeto `store` que se expone
// al renderer. Para sumar una función nueva, agregала en el archivo
// de dominio correspondiente (db / recibos / watch) o crea uno nuevo
// y sumalo al spread de abajo: el resto del preload no se toca.
import * as db from "./db";
import * as recibos from "./recibos";
import * as watch from "./watch";

export const store = {
  ...db,
  ...recibos,
  ...watch,
};
