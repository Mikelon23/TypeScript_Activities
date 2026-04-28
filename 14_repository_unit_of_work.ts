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
