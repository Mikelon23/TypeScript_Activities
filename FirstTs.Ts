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

//objetos : "contrato" o "molde" (usualmente llamado interface o type)
interface Producto {
    nombre: string;
    precio: number;
    enStock: boolean;
}

let miProducto: Producto = {
    nombre: "Zapatillas",
    precio: 120,
    enStock: true
};

//el símbolo que usamos para indicar que algo es opcional es el signo de interrogación ?.

interface Producto {
    nombre: string;
    precio: number;
    enStock: boolean;
    descuento?: number; // ¡Aquí está la magia!
}

//Gracias a ese ?, ahora puedes crear un producto con descuento y otro sin descuento

let zapatillas: Producto = { nombre: "Zapatillas", precio: 120, enStock: true };
let camiseta: Producto = { nombre: "Camiseta", precio: 30, enStock: true, descuento: 10 };

//Union Types útiles cuando los datos pueden venir en diferentes 
//formatos, pero aún así quieres mantener el control estricto sobre ellos

let miID: string | number;

