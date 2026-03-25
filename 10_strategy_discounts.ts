/**
 * Ejercicio 10: Patrón Strategy — Motor de Descuentos Dinámicos para E-Commerce
 * Dificultad: Media
 *
 * Problema en la vida real:
 * Un e-commerce como Amazon tiene reglas de descuento que cambian constantemente:
 * Black Friday, cupones VIP, descuentos por volumen, membresía Prime, etc.
 * Codificar estas reglas con if/else es un desastre de mantenimiento.
 *
 * Solución: Strategy Pattern — cada política de descuento es un objeto intercambiable.
 * El carrito no sabe CÓMO se calcula, solo que existe una estrategia activa.
 */

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface PricingStrategy {
  readonly name: string;
  apply(items: CartItem[]): number; // Retorna el monto de descuento
}

