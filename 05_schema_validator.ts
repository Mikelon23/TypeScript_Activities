/**
 * Ejercicio 5: TypeScript Schema Validator (Mini-Zod) 
 * Dificultad: Alta (Requiere entender fuertemente inferencia condicional)
 * 
 * Problema en la vida real: 
 * Cuando recibimos un JSON de una API externa o un formulario (express.body), 
 * TypeScript no nos protege en tiempo de ejecución. 
 * Con este validador, construimos esquemas que validan la data en runtime Y ADEMÁS
 * deduce estáticamente (compile-time) la interfaz de TypeScript, matando dos pájaros de un tiro.
 */

// Extrae el tipo inferido de un Validador. ¡Magia negra de TypeScript!
type Infer<T> = T extends Validator<infer U> ? U : never;

// Clase base abstracta
abstract class Validator<T> {
  abstract parse(val: unknown): T;
}

// Validador de Strings
class StringValidator extends Validator<string> {
  parse(val: unknown): string {
    if (typeof val !== 'string') throw new Error(`El valor '${val}' no es un string valido.`);
    return val;
  }
}

