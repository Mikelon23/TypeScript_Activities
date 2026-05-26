/**
 * Ejercicio 16: Patrón Builder — Constructor de Consultas SQL Tipado (Mini-QueryBuilder)
 * Dificultad: Media-Alta
 *
 * Problema en la vida real:
 * ORMs como Prisma, TypeORM y Sequelize permiten construir queries de forma fluida
 * y con type-safety. Concatenar strings SQL a mano es propenso a inyección SQL
 * y errores de sintaxis difíciles de depurar.
 *
 * Solución: Builder Pattern con Fluent Interface — cada método retorna `this`
 * para encadenamiento, y el query se "compila" solo al final con .build().
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

type OrderDirection = "ASC" | "DESC";
type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL";

interface WhereCondition {
  column: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN" | "IS NULL" | "IS NOT NULL";
  value?: string | number | (string | number)[];
}

// ── Query Builder ─────────────────────────────────────────────────────────────

class QueryBuilder {
  private tableName: string = "";
  private selectedColumns: string[] = [];
  private conditions: { clause: WhereCondition; conjunction: "AND" | "OR" }[] = [];
  private joins: { type: JoinType; table: string; on: string }[] = [];
  private orderByClauses: { column: string; direction: OrderDirection }[] = [];
  private groupByColumns: string[] = [];
