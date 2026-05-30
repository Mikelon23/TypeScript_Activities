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
  private havingClause: string = "";
  private limitValue?: number;
  private offsetValue?: number;

  // ── DSL Fluent ─────────────────────────────────────────────────────────────

  from(table: string): this {
    this.tableName = table;
    return this;
  }

  select(...columns: string[]): this {
    this.selectedColumns.push(...columns);
    return this;
  }

  where(column: string, operator: WhereCondition["operator"], value?: WhereCondition["value"]): this {
    this.conditions.push({ clause: { column, operator, value }, conjunction: "AND" });
    return this;
  }

  orWhere(column: string, operator: WhereCondition["operator"], value?: WhereCondition["value"]): this {
    this.conditions.push({ clause: { column, operator, value }, conjunction: "OR" });
    return this;
  }

  join(type: JoinType, table: string, on: string): this {
    this.joins.push({ type, table, on });
    return this;
  }

  orderBy(column: string, direction: OrderDirection = "ASC"): this {
    this.orderByClauses.push({ column, direction });
    return this;
  }

  groupBy(...columns: string[]): this {
    this.groupByColumns.push(...columns);
    return this;
  }

  having(clause: string): this {
    this.havingClause = clause;
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  offset(n: number): this {
    this.offsetValue = n;
    return this;
  }

  // ── Compilación ────────────────────────────────────────────────────────────

  private formatValue(value: WhereCondition["value"]): string {
    if (value === undefined) return "";
    if (Array.isArray(value)) return `(${value.map(v => `'${v}'`).join(", ")})`;
    if (typeof value === "string") return `'${value}'`;
    return String(value);
  }

  build(): string {
    if (!this.tableName) throw new Error("Debes especificar una tabla con .from()");

    const cols = this.selectedColumns.length > 0 ? this.selectedColumns.join(", ") : "*";
    let query = `SELECT ${cols} FROM ${this.tableName}`;

    // JOINs
    this.joins.forEach(j => {
      query += ` ${j.type} JOIN ${j.table} ON ${j.on}`;
    });

    // WHERE
    if (this.conditions.length > 0) {
      const whereParts = this.conditions.map(({ clause, conjunction }, idx) => {
        const { column, operator, value } = clause;
        let part = "";
        if (operator === "IS NULL" || operator === "IS NOT NULL") {
          part = `${column} ${operator}`;
        } else if (operator === "IN") {
          part = `${column} IN ${this.formatValue(value)}`;
        } else {
          part = `${column} ${operator} ${this.formatValue(value)}`;
        }
        return idx === 0 ? part : `${conjunction} ${part}`;
      });
      query += ` WHERE ${whereParts.join(" ")}`;
    }

    // GROUP BY
    if (this.groupByColumns.length > 0) {
      query += ` GROUP BY ${this.groupByColumns.join(", ")}`;
    }
