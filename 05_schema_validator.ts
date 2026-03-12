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

// Validador de Números
class NumberValidator extends Validator<number> {
  parse(val: unknown): number {
    if (typeof val !== 'number' || isNaN(val)) throw new Error(`El valor '${val}' no es un numero valido.`);
    return val;
  }
}

// Validador de Objetos completo (Recursivo)
class ObjectValidator<Shape extends Record<string, Validator<any>>> extends Validator<{ [K in keyof Shape]: Infer<Shape[K]> }> {
  constructor(private readonly shape: Shape) { super(); }

  parse(val: unknown): { [K in keyof Shape]: Infer<Shape[K]> } {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      throw new Error(`Se esperaba un objeto, se recibió ${typeof val}`);
    }

    const result: any = {};
    for (const key in this.shape) {
      try {
        result[key] = this.shape[key].parse((val as any)[key]);
      } catch (err: any) {
        throw new Error(`[Clave: ${key}] -> ${err.message}`);
      }
    }
    return result;
  }
}

// Objeto "z" amigable como builder API
const z = {
  string: () => new StringValidator(),
  number: () => new NumberValidator(),
  object: <T extends Record<string, Validator<any>>>(shape: T) => new ObjectValidator(shape)
};

// ==============================================
//   DEMOSTRACIÓN DE USO
// ==============================================

// 1. Definimos el Schema a nivel Runtime
const userSchema = z.object({
  username: z.string(),
  age: z.number(),
  preferences: z.object({
    theme: z.string()
  })
});

// 2. MAGIA SUPERIOR: Infiere el tipo (Interface) en tiempo de desarrollo.
// Intenta usar 'UserType' y verás que TS sabe la estructura perfecta.
type UserType = Infer<typeof userSchema>;

console.log("--- Iniciando Demo: Mini-Zod Schema Builder ---");

const invalidDataFromApi = {
  username: "Miguelon99",
  age: "veinte", // <- Uh oh, problema aquí
  preferences: { theme: "dark" }
};

try {
  console.log("Parseando datos inválidos...");
  userSchema.parse(invalidDataFromApi);
} catch (e: any) {
  console.error(" Error de validación capturado:", e.message);
}

const validDataFromApi = {
  username: "Miguel TS Master",
  age: 26,
  preferences: { theme: "dracula" }
};

