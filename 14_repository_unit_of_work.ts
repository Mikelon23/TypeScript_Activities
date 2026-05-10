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

  findAll(): T[] {
    const merged: Map<string, T> = new Map(this.committed);
    this.staging.forEach((val, key) => {
      if (val === null) merged.delete(key);
      else merged.set(key, val);
    });
    return Array.from(merged.values());
  }

  add(entity: T): void { this.staging.set(entity.id, entity); }
  update(entity: T): void { this.staging.set(entity.id, entity); }
  delete(id: string): void { this.staging.set(id, null); }

  /** Persiste los cambios en staging al almacén confirmado */
  commit(): void {
    this.staging.forEach((val, key) => {
      if (val === null) this.committed.delete(key);
      else this.committed.set(key, val);
    });
    this.staging.clear();
  }

  /** Descarta todos los cambios pendientes */
  rollback(): void {
    this.staging.clear();
  }
}

// ── Unit of Work ──────────────────────────────────────────────────────────────

class UnitOfWork {
  private repos: InMemoryRepository<any>[] = [];

  register<T extends Entity>(repo: InMemoryRepository<T>): InMemoryRepository<T> {
    this.repos.push(repo);
    return repo;
  }

  commit(): void {
    try {
      this.repos.forEach(r => r.commit());
      console.log("Transacción confirmada");
    } catch (err) {
      this.rollback();
      throw err;
    }
  }

  rollback(): void {
    this.repos.forEach(r => r.rollback());
    console.log("Transacción revertida");
  }
}

// ── Entidades de Ejemplo ──────────────────────────────────────────────────────

interface User extends Entity { name: string; email: string; balance: number; }
interface Wallet extends Entity { userId: string; transactions: string[]; }

// ── Servicio de Aplicación ────────────────────────────────────────────────────

function transferFunds(
  userRepo: IRepository<User>,
  walletRepo: IRepository<Wallet>,
  uow: UnitOfWork,
  fromId: string,
  toId: string,
  amount: number
): void {
  const sender = userRepo.findById(fromId);
  const receiver = userRepo.findById(toId);

  if (!sender || !receiver) throw new Error("Usuario no encontrado.");
  if (sender.balance < amount) throw new Error(`Saldo insuficiente: $${sender.balance} < $${amount}`);

  userRepo.update({ ...sender, balance: sender.balance - amount });
  userRepo.update({ ...receiver, balance: receiver.balance + amount });

  const senderWallet = walletRepo.findById(fromId)!;
  const receiverWallet = walletRepo.findById(toId)!;

  walletRepo.update({ ...senderWallet, transactions: [...senderWallet.transactions, `DEBITO $${amount} hacia ${toId}`] });
  walletRepo.update({ ...receiverWallet, transactions: [...receiverWallet.transactions, `CREDITO $${amount} desde ${fromId}`] });

  uow.commit();
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function runRepositoryDemo() {
  console.log("Iniciando Demo: Repository + Unit of Work \n");

  const uow = new UnitOfWork();
  const userRepo = uow.register(new InMemoryRepository<User>());
  const walletRepo = uow.register(new InMemoryRepository<Wallet>());

  userRepo.add({ id: "u1", name: "Miguel", email: "miguel@dev.io", balance: 500 });
  userRepo.add({ id: "u2", name: "Ana", email: "ana@dev.io", balance: 200 });
  walletRepo.add({ id: "u1", userId: "u1", transactions: [] });
  walletRepo.add({ id: "u2", userId: "u2", transactions: [] });
  uow.commit();

  const printBalances = () => {
    userRepo.findAll().forEach(u => console.log(`    ${u.name}: $${u.balance}`));
  };

  console.log("Balances iniciales:");
  printBalances();

  console.log("Transferencia exitosa: Miguel → Ana ($150):");
  try {
    transferFunds(userRepo, walletRepo, uow, "u1", "u2", 150);
    printBalances();
  } catch (e: any) { console.error("Error:", e.message); }

  console.log("Transferencia fallida: Ana → Miguel ($9999) — Saldo insuficiente:");
  try {
    transferFunds(userRepo, walletRepo, uow, "u2", "u1", 9999);
