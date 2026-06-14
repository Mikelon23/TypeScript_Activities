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

