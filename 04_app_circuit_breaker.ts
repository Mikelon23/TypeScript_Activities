/**
 * Ejercicio 4: Patrón Circuit Breaker (Cortocircuito) para Peticiones HTTP
 * Dificultad: Media-Alta
 * 
 * Problema en la vida real: 
 * Cuando un microservicio o una API de terceros falla, si seguimos enviando peticiones 
 * provocaremos un colapso en cascada (o nos bloquearán por rate limiting). 
 * El "Circuit Breaker" monitorea las fallas. Si exceden un límite, "abre" el circuito 
 * deteniendo mágicamente las llamadas por un tiempo para dejar respirar a la API.
 */

enum CircuitState {
  CLOSED,   // Todo funciona bien, las peticiones pasan.
  OPEN,     // Fallos superados. Bloqueando peticiones.
  HALF_OPEN // El tiempo de espera terminó, permitiendo probar si ya funciona.
}

class CircuitBreaker<T, Args extends any[]> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttempt = 0;

  constructor(
    private readonly requestFn: (...args: Args) => Promise<T>,
    private readonly failureThreshold: number = 3,
    private readonly cooldownPeriodMs: number = 5000
  ) {}

  async fire(...args: Args): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
        console.log("🟠 Circuito Medio Abierto: Probando conexión de recuperación...");
      } else {
        throw new Error("🔴 Circuito Abierto: Petición bloqueada para proteger el sistema.");
      }
    }

    try {
      const result = await this.requestFn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      console.log("🟢 Circuito Cerrado: API recuperada. Flujo restablecido.");
    }
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.cooldownPeriodMs;
      console.log(`🔴 Circuito Abierto: Superados ${this.failureThreshold} fallos. Enfriando por ${this.cooldownPeriodMs}ms.`);
    }
  }
}

// ==============================================
// 🚀 DEMOSTRACIÓN DE USO
// ==============================================
async function mockDatabaseQuery(shouldFail: boolean, id: number): Promise<string> {
  await new Promise(res => setTimeout(res, 100)); // Simulando latencia
  if (shouldFail) throw new Error("Timeout de base de datos");
  return `Datos procesados para el ID ${id}`;
}

async function runCircuitBreakerDemo() {
  console.log("--- Iniciando Demo: Circuit Breaker ---");
  const secureQuery = new CircuitBreaker(mockDatabaseQuery, 2, 3000); // Falla al 2do intento, espera 3s

  try { await secureQuery.fire(false, 1); console.log("Éxito en query 1"); } catch (e: any) { console.error(e.message); }
  try { await secureQuery.fire(true, 2); console.log("Éxito en query 2"); } catch (e: any) { console.error(e.message); }
  try { await secureQuery.fire(true, 3); console.log("Éxito en query 3"); } catch (e: any) { console.error(e.message); }
  
  // Aquí el circuito debería estar abierto (ya falló 2 veces)
  try { await secureQuery.fire(false, 4); } catch (e: any) { console.error(e.message); }

  console.log("Esperando 3.5 segundos para que el circuito se reactive...");
  await new Promise(res => setTimeout(res, 3500));

  // Circuito "Half-Open", el siguiente intento funcionará y lo cerrará (Closed)
  try { await secureQuery.fire(false, 5); console.log("Éxito en query 5 (Recuperación)"); } catch (e: any) { console.error(e.message); }
}

runCircuitBreakerDemo();
