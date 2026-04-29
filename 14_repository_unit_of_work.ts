/**
 * Ejercicio 14: Repository Pattern + Unit of Work — Capa de Datos Genérica
 * Dificultad: Alta
 *
 * Problema en la vida real:
 * En aplicaciones empresariales (bancarias, ERP, SaaS), las operaciones sobre múltiples
 * entidades deben ser atómicas: si falla UNA, se revierten TODAS.
 * Escribir SQL/ORM directamente en los servicios viola el Principio de Responsabilidad Única.
 *
 * Solución:
 * - Repository: abstrae el acceso a datos de una entidad (CRUD genérico)
 * - Unit of Work: agrupa múltiples repositorios bajo una sola "transacción"
 *   y hace commit/rollback de todos juntos.
 */

// ── Tipos Base ────────────────────────────────────────────────────────────────

type Entity = { id: string };

// ── Repositorio Genérico ──────────────────────────────────────────────────────

interface IRepository<T extends Entity> {
  findById(id: string): T | undefined;
  findAll(): T[];
  add(entity: T): void;
  update(entity: T): void;
  delete(id: string): void;
}

class InMemoryRepository<T extends Entity> implements IRepository<T> {
  // Guardamos el "snapshot" original y los cambios pendientes
  private committed: Map<string, T> = new Map();
  private staging: Map<string, T | null> = new Map(); // null = marcado para eliminar

  findById(id: string): T | undefined {
    if (this.staging.has(id)) {
      const staged = this.staging.get(id);
      return staged === null ? undefined : staged;
    }
    return this.committed.get(id);
  }

