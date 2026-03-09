/**
 * EJERCICIO 3: Nivel Difícil - Event Bus Genérico y Tipado Seguro
 * 
 * OBJETIVO:
 * Crear un sistema de eventos (Pub/Sub) que garantice que los datos enviados
 * correspondan exactamente al tipo definido para cada nombre de evento.
 * Usa Genéricos Avanzados y Mapped Types.
 */

/**
 * Definición de los eventos disponibles y la forma de sus datos.
 */
interface AppEvents {
    'user:login': { userId: string; timestamp: number };
    'user:logout': { userId: string };
    'product:added': { productId: string; quantity: number };
}

type EventName = keyof AppEvents;
type Handler<T extends EventName> = (data: AppEvents[T]) => void | Promise<void>;

class TypedEventBus {
    private listeners: Partial<{ [K in EventName]: Handler<K>[] }> = {};

    /**
     * Se suscribe a un evento con tipado estricto.
     */
    on<T extends EventName>(event: T, handler: Handler<T>): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]?.push(handler);
    }
