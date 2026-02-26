/*
Para decirle a TypeScript qué tipo de dato va a devolver exactamente ç
una función, colocamos los dos puntos : y el tipo justo después de
los paréntesis de los parámetros.
*/
//Mira esta función que calcula el precio final de nuestro Producto:
function obtenerPrecioFinal(producto: Producto): number {
    if (producto.descuento)
