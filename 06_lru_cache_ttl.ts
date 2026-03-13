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

