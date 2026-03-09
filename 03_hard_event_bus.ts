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

    /**
     * Emite un evento asegurando que los datos coincidan con la interfaz AppEvents.
     */
    async emit<T extends EventName>(event: T, data: AppEvents[T]): Promise<void> {
        const handlers = this.listeners[event];
        if (!handlers) return;

        // Ejecuta todos los handlers de forma segura
        const promises = handlers.map(handler => Promise.resolve(handler(data)));
        await Promise.all(promises);
    }

    /**
     * Elimina todos los suscriptores de un evento.
     */
    off<T extends EventName>(event: T): void {
        delete this.listeners[event];
    }
}
