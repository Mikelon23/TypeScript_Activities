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

// ==============================================
//  DEMOSTRACIÓN DE USO
// ==============================================

// Función dummy para simular descargas o procesamientos con demoras variables
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runSchedulerDemo() {
  console.log("--- Iniciando Demo: Limitador de Concurrencia ---");
  // Limitado para solo realizar 2 tareas a la misma vez
  const scheduler = new AsyncTaskScheduler(2);

  // Configuramos tareas
  const t1 = scheduler.enqueue(async () => { await delay(2000); return "Tarea 1 Lista"; }, 1);
  const t2 = scheduler.enqueue(async () => { await delay(1000); return "Tarea 2 Lista"; }, 1);
  const t3 = scheduler.enqueue(async () => { await delay(500); return "Tarea 3 (URGENTE) Lista"; }, 99);
  const t4 = scheduler.enqueue(async () => { await delay(800); return "Tarea 4 Lista"; }, 1);

  // La magia: t1 y t2 arrancan porque hay 2 hilos libres.
  // PERO, la Tarea 3 fue lanzada después y tiene PRIORIDAD 99. 
  // En lo que t2 termine, el scheduler seleccionará t3 inmediatamente por encima de la t4.

  const result = await Promise.all([t1, t2, t3, t4]);
  console.log(" Todas las tareas finalizadas correctamente!");
  console.log("Resultados:", result);
}

runSchedulerDemo();
