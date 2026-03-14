/**
 * Ejercicio 6: In-Memory LRU Cache con TTL (Time-To-Live)
 * Dificultad: Alta
 * 
 * Problema en la vida real:
 * Nuestro frontend pide métricas muy pesadas al servidor. Para acelerarlo, guardamos la 
 * información en la memoria (RAM) de nuestro backend Node.js.
 * Pero la RAM es limitada: El sistema LRU (Least Recently Used) borra automáticamente los records
 * más viejos que nadie consulta cuando se llena; y el TTL borra la info caducada para que los 
 * usuarios no vean "datos zombies" viejos.
 */

interface CacheNode<V> {
  value: V;
  expiry: number | null;
}

class LRUCache<K, V> {
  // En TS y JS, 'Map' recuerda el orden de inserción, ¡gran ventaja!
  private cache: Map<K, CacheNode<V>> = new Map();

  /**
   * @param maxCapacity Cantidad máxima de llaves. Cuando excede, borra la menos usada.
   * @param defaultTtlMs Tiempo de vida global (en milisegundos). -1 para datos infinitos.
   */
  constructor(
    private maxCapacity: number,
    private defaultTtlMs: number = -1
  ) { }

  set(key: K, value: V, customTtl?: number): void {
    if (this.cache.has(key)) {
      // Si la borramos y volvemos a setear, se moverá al FINAL del Map (La hace la "Recién Usada")
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxCapacity) {
      // Sacamos el PRIMER key (el Least Recently Used), porque los sets en JS insertan al final
      const firstEntryKey = this.cache.keys().next().value;
      if (firstEntryKey) this.cache.delete(firstEntryKey);
    }

    const ttlToUse = customTtl !== undefined ? customTtl : this.defaultTtlMs;
    const expiry = ttlToUse === -1 ? null : Date.now() + ttlToUse;

    this.cache.set(key, { value, expiry });
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    // Validación TTL
    if (node.expiry !== null && Date.now() > node.expiry) {
      this.cache.delete(key);
      return undefined; // Caducó
    }

    // Fue accedido! Borramos y re-creamos para setearlo como "Recién Usado" (hasta abajo del Map)
    this.cache.delete(key);
    this.cache.set(key, node);

    return node.value;
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  get stats() {
    return { currentSize: this.cache.size, capacity: this.maxCapacity };
  }
}

