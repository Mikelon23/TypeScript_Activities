/**
 * Ejercicio 8: Async Task Scheduler y Limitador de Concurrencia
 * Dificultad: Alta
 * 
 * Problema en la vida real:
 * Tenemos que descargar 5,000 imágenes, procesar videos o enviar de forma masiva correos por API.
 * Si usamos `Promise.all()`, abriremos las 5,000 conexiones al mismo tiempo. Romperemos la memoria
 * o nos banearán el IP (DDoS accidental). 
 * Solución: Un motor de Encolado Asíncrono capaz de procesar 'N' hilos concurrentemente sin atorarse.
 */

type Task<T = any> = () => Promise<T>;

interface QueueItem {
  id: string;
  execute: Task;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  priority: number;
}

export class AsyncTaskScheduler {
  private queue: QueueItem[] = [];
  private activeWorkers: number = 0;

  constructor(private readonly maxConcurrency: number) { }

  /**
   * Encola una tarea. Devuelve una promesa conectada al final de la ejecución individual de ese subproceso.
   */
  public enqueue<T>(task: Task<T>, priority: number = 0): Promise<T> {
    const id = Math.random().toString(36).substring(7);

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id, execute: task, resolve, reject, priority
      });

      // Ordenar por prioridad antes de iterar (PriorityQueue sencilla)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processNext();
    });
  }

  private async processNext() {
    // Si llegamos al límite de operaciones simultáneas, no hacemos nada
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) return;

    // Tomamos la operación más importante en la cola
    const item = this.queue.shift();
    if (!item) return;

    this.activeWorkers++;
    console.log(`[Worker Ocupado] -> Arrancando Tarea [${item.id}]. Concurrencia actual: ${this.activeWorkers}/${this.maxConcurrency}`);

    try {
      // Ejecutamos la promesa. (await no bloqueante para el resto de enqueues)
      const result = await item.execute();
      item.resolve(result); // Le avisamos a quien llamó "enqueue()" que su subproceso terminó.
    } catch (err) {
      item.reject(err);
    } finally {
      this.activeWorkers--;
      // Como liberamos un hilo, tratamos de jalar la siguiente tarea recursivamente.
      this.processNext();
    }
  }
}

