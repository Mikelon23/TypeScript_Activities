/**
 * Ejercicio 13: State Machine — Gestión del Ciclo de Vida de un Pedido
 * Dificultad: Alta
 *
 * Problema en la vida real:
 * Un pedido en Amazon pasa por estados: Pendiente → Pagado → Empacado → Enviado → Entregado.
 * Ciertas transiciones son ilegales (no puedes "Enviar" un pedido sin "Pagar").
 * Un simple switch/case crece caóticamente. Las State Machines son la solución elegante.
 *
 * Solución: State Pattern — cada estado es una clase que sabe qué transiciones permite.
 * El objeto pedido delega su comportamiento al estado actual, no tiene lógica propia.
 */

// ── Interfaz del Estado ───────────────────────────────────────────────────────

interface OrderState {
  readonly stateName: string;
  pay(order: Order): void;
  pack(order: Order): void;
  ship(order: Order): void;
  deliver(order: Order): void;
  cancel(order: Order): void;
}

// ── Estados Concretos ─────────────────────────────────────────────────────────

function illegalTransition(from: string, action: string): void {
  console.log(` [${from}] Transición inválida: no puedes "${action}" desde este estado.`);
}

class PendingState implements OrderState {
  readonly stateName = "PENDIENTE";

  pay(order: Order): void {
    console.log(` [${this.stateName}] Pago procesado correctamente.`);
    order.setState(new PaidState());
  }
  pack(order: Order): void { illegalTransition(this.stateName, "empacar"); }
  ship(order: Order): void { illegalTransition(this.stateName, "enviar"); }
  deliver(order: Order): void { illegalTransition(this.stateName, "entregar"); }
  cancel(order: Order): void {
    console.log(` [${this.stateName}] Pedido cancelado antes del pago.`);
    order.setState(new CancelledState());
  }
}

class PaidState implements OrderState {
  readonly stateName = "PAGADO";

  pay(order: Order): void { illegalTransition(this.stateName, "pagar de nuevo"); }
  pack(order: Order): void {
    console.log(` [${this.stateName}] Pedido empacado en el almacén.`);
    order.setState(new PackedState());
  }
