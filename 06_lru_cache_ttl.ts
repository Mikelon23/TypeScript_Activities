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
