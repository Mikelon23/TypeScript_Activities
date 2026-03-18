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

