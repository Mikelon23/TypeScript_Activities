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
  ) { }

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

