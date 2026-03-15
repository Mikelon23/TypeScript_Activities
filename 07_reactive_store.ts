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

