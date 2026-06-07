/**
 * Ejercicio 17: Patrón Proxy — Sistema de Caché Inteligente con Control de Acceso
 * Dificultad: Media-Alta
 *
 * Problema en la vida real:
 * Las llamadas a APIs externas o bases de datos son lentas y costosas.
 * Además, datos sensibles (salarios, datos médicos) solo deben ser accesibles por roles específicos.
 * Un Proxy puede añadir caché Y control de acceso transparentemente sin tocar el servicio real.
 *
 * Solución: Proxy Pattern — el cliente llama a la misma interfaz pero el proxy
 * intercepta las llamadas para añadir caché en memoria + validación de permisos.
 */

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  department: string;
}

interface IEmployeeService {
  findById(id: string, requesterRole: string): Employee | null;
  findAll(requesterRole: string): Employee[];
}


class EmployeeDatabase implements IEmployeeService {
  private db: Employee[] = [
    { id: "e1", name: "Miguel Hernández", role: "developer", salary: 85000, department: "Engineering" },
    { id: "e2", name: "Ana López", role: "designer", salary: 72000, department: "Design" },
    { id: "e3", name: "Carlos Ruiz", role: "manager", salary: 120000, department: "Engineering" },
    { id: "e4", name: "Laura Torres", role: "developer", salary: 90000, department: "Engineering" },
  ];

  private slowQuery<T>(fn: () => T): T {
    // Simulación de latencia (síncrona para este ejemplo)
    const start = Date.now();
    const result = fn();
    console.log(`[DB] Query completada en ~${Date.now() - start}ms`);
    return result;
  }

  findById(id: string, _requesterRole: string): Employee | null {
    console.log(`[DB] Ejecutando SELECT * FROM employees WHERE id = '${id}'`);
    return this.slowQuery(() => this.db.find(e => e.id === id) ?? null);
  }

  findAll(_requesterRole: string): Employee[] {
    console.log(`[DB] Ejecutando SELECT * FROM employees`);
    return this.slowQuery(() => [...this.db]);
  }
}

// ── Proxy: Caché + Control de Acceso ──────────────────────────────────────────

class SecuredCachedEmployeeProxy implements IEmployeeService {
  private cache: Map<string, { data: Employee | null; expiresAt: number }> = new Map();
  private allCacheExpiry: number = 0;
  private cachedAll: Employee[] | null = null;

  constructor(
    private readonly service: IEmployeeService,
    private readonly ttlMs: number = 5000 // caché por 5 segundos
  ) { }

  private canViewSalary(role: string): boolean {
    return ["admin", "hr", "manager"].includes(role.toLowerCase());
  }

  private sanitize(employee: Employee, requesterRole: string): Employee {
    if (!this.canViewSalary(requesterRole)) {
      return { ...employee, salary: -1 }; // Ocultar salario
    }
    return employee;
  }

  findById(id: string, requesterRole: string): Employee | null {
    const cacheKey = `findById:${id}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      console.log(`[Proxy Cache] HIT para ID "${id}". Sin llamada a DB.`);
      return cached.data ? this.sanitize(cached.data, requesterRole) : null;
    }

    console.log(`[Proxy Cache] MISS para ID "${id}". Consultando DB...`);
    const result = this.service.findById(id, requesterRole);
    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.ttlMs });

    return result ? this.sanitize(result, requesterRole) : null;
  }

  findAll(requesterRole: string): Employee[] {
    if (this.cachedAll && Date.now() < this.allCacheExpiry) {
      console.log(`[Proxy Cache] HIT para findAll. Sin llamada a DB.`);
      return this.cachedAll.map(e => this.sanitize(e, requesterRole));
    }

    console.log(`[Proxy Cache] MISS para findAll. Consultando DB...`);
    const result = this.service.findAll(requesterRole);
    this.cachedAll = result;
    this.allCacheExpiry = Date.now() + this.ttlMs;

    return result.map(e => this.sanitize(e, requesterRole));
  }
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function runProxyDemo() {
  console.log("--- Iniciando Demo: Proxy — Caché + Control de Acceso ---\n");

