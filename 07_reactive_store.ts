/**
 * Ejercicio 7: Gestor de Estado Reactivo Impulsado por Proxies
 * Dificultad: Alta-Experta
 * 
 * Problema en la vida real:
 * Libraries como MobX, Vue Reactivity, o SolidJS detectan mágicamente cuando
 * cambias una variable profunda como state.user.name = "Otro", y repintan el HTML solos.
 * ¿Cómo hacen para saber que tocaste una variable en JS sin setter explícito?
 * Respuesta: Metaprogramación con el Objeto `Proxy` e interceptores de la API `Reflect`.
 */

type Listener = () => void;

class ReactiveStore<T extends object> {
  private listeners: Set<Listener> = new Set();
  public reactiveState: T;

  constructor(initialState: T) {
    this.reactiveState = this.makeDeepProxy(initialState);
  }

  // Permite suscribir componentes UI a los cambios de la store
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Devuelve un "unsubscribe" amigable (React useEffect Cleanup Friendly)
    return () => this.listeners.delete(listener);
  }

  // Notificar a todos cuando el estado cambió
  private emitChange() {
    this.listeners.forEach(cb => cb());
  }

  /**
   * Crea un Proxy recursivo profundo. Magia de TypeScript pura.
   */
  private makeDeepProxy<Obj extends object>(obj: Obj): Obj {
    return new Proxy(obj, {
      get: (target: object, property: string | symbol, receiver: any) => {
        const val = Reflect.get(target, property, receiver);
        // Si pedimos una propiedad que resulta ser OTRO objeto interno, enviarle un Proxy recursivo
        if (typeof val === 'object' && val !== null) {
          return this.makeDeepProxy(val);
        }
        return val;
      },
