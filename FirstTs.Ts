let mensaje: string = "Hola, Gracias por darme la vida";
console.log(mensaje);

//tipado con number
function sumarPrecios(precio1: number, precio2: number) {
    return precio1 + precio2;
}

let resultado = sumarPrecios(10, 20);
console.log(resultado);

/*
Tipos explícitos (ej. : number).

Tipos primitivos (string, number, boolean).

Inferencia de tipos.

*/

//Recuerda el patrón estricto de TypeScript: variable : tipo = valor.

//Módulo 2: Estructuras de Datos

//listas
let precios: number[] = [10, 20, 30];

//objetos
interface Producto {
  nombre: string;
  precio: number;
  enStock: boolean;
}



