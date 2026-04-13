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

