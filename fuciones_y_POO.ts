/*
Para decirle a TypeScript qué tipo de dato va a devolver exactamente ç
una función, colocamos los dos puntos : y el tipo justo después de
los paréntesis de los parámetros.
*/
//Mira esta función que calcula el precio final de nuestro Producto:
/*
Aquí le estamos diciendo: "Esta función recibe un Producto y 
te prometo que siempre devolverá un number".
*/
function obtenerPrecioFinal(producto: Producto): number {
    if (producto.descuento) {
        return producto.precio - producto.descuento;
    }
