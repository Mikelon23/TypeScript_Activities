/**
 * Ejercicio 18: Iterator Pattern — Motor de Pipelines de Transformación de Datos
 * Dificultad: Alta (Innovador)
 *
 * Problema en la vida real / REVOLUCIÓN:
 * Apache Spark, RxJS, y los nuevos frameworks de ML pipelines procesan millones de
 * registros de forma LAZY (sin cargar todo en memoria). La clave: cada operación
 * produce un iterador que solo calcula cuando el dato es realmente necesario.
 *
 * INNOVACIÓN: Este ejercicio construye un motor de pipelines tipo "Spark Lite" en
 * TypeScript puro usando Iteradores Nativos (Symbol.iterator). Los datos se transforman
 * en cadena SIN arrays intermedios. Con N=10M registros, la diferencia de memoria
 * vs .map().filter().reduce() es abismal.
 */

// ── Pipeline Lazy (Generator-based) ──────────────────────────────────────────

class LazyPipeline<T> implements Iterable<T> {
  constructor(private readonly source: Iterable<T>) { }

  [Symbol.iterator](): Iterator<T> {
    return this.source[Symbol.iterator]();
  }

  // Transforma cada elemento (LAZY - no ejecuta hasta collect())
  map<U>(fn: (item: T) => U): LazyPipeline<U> {
    const source = this.source;
    return new LazyPipeline<U>({
      [Symbol.iterator]: function* () {
        for (const item of source) yield fn(item);
      }
    });
  }

  // Filtra elementos (LAZY)
  filter(predicate: (item: T) => boolean): LazyPipeline<T> {
    const source = this.source;
    return new LazyPipeline<T>({
      [Symbol.iterator]: function* () {
        for (const item of source) {
          if (predicate(item)) yield item;
        }
      }
    });
  }

  // Toma solo N elementos (LAZY - cortocircuita el pipeline)
  take(n: number): LazyPipeline<T> {
    const source = this.source;
    return new LazyPipeline<T>({
      [Symbol.iterator]: function* () {
        let count = 0;
        for (const item of source) {
          if (count++ >= n) break;
          yield item;
        }
      }
    });
  }

  // Transforma y aplana (flatMap LAZY)
  flatMap<U>(fn: (item: T) => Iterable<U>): LazyPipeline<U> {
    const source = this.source;
    return new LazyPipeline<U>({
      [Symbol.iterator]: function* () {
        for (const item of source) yield* fn(item);
      }
    });
  }

  // Omite N elementos al inicio
  skip(n: number): LazyPipeline<T> {
    const source = this.source;
    return new LazyPipeline<T>({
      [Symbol.iterator]: function* () {
        let skipped = 0;
        for (const item of source) {
          if (skipped++ < n) continue;
          yield item;
        }
      }
    });
  }

  // ── Terminadores (Evalúan el pipeline) ──────────────────────────────────────

  collect(): T[] {
    return Array.from(this);
  }

  reduce<U>(fn: (acc: U, item: T) => U, initial: U): U {
    let acc = initial;
    for (const item of this) acc = fn(acc, item);
    return acc;
  }

  count(): number {
    let n = 0;
    for (const _ of this) n++;
    return n;
  }

  first(): T | undefined {
    for (const item of this) return item;
    return undefined;
  }

  forEach(fn: (item: T) => void): void {
    for (const item of this) fn(item);
  }

  // Genera un generador infinito desde 0...∞ (solo útil con .take())
  static range(start: number = 0, end: number = Infinity, step: number = 1): LazyPipeline<number> {
    return new LazyPipeline<number>({
      [Symbol.iterator]: function* () {
        for (let i = start; i < end; i += step) yield i;
      }
    });
  }

  // Crea un pipeline desde un array o iterable existente
  static from<T>(data: Iterable<T>): LazyPipeline<T> {
    return new LazyPipeline(data);
  }
}

// ── Demo ──────────────────────────────────────────────────────────────────────

interface SalesRecord {
  id: number;
  product: string;
  category: string;
  amount: number;
  region: string;
}

function runPipelineDemo() {
  console.log("--- Iniciando Demo: Iterator — Motor de Pipelines Lazy ---\n");

  // Generar datos sintéticos (simulando un dataset grande)
  const products = ["Laptop", "Mouse", "Teclado", "Monitor", "Auriculares", "Webcam", "Hub USB"];
  const categories = ["Hardware", "Periféricos", "Audio/Video"];
  const regions = ["Norte", "Sur", "Centro", "CDMX"];

  function* generateSalesData(): Generator<SalesRecord> {
    for (let i = 1; i <= 10_000; i++) {
      yield {
        id: i,
        product: products[i % products.length],
        category: categories[i % categories.length],
        amount: Math.floor(Math.random() * 5000) + 100,
        region: regions[i % regions.length],
      };
    }
  }

  console.log(" Dataset: 10,000 registros de ventas (generados lazy)");

  // 1. Pipeline: Solo ventas de "Hardware" en la región "CDMX" mayores a $1000
  const filteredSales = LazyPipeline.from(generateSalesData())
    .filter(r => r.category === "Hardware")
    .filter(r => r.region === "CDMX")
