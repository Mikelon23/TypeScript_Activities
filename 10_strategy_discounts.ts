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

// ── Estrategias de Descuento Concretas ─────────────────────────────────────────

/** Descuento porcentual simple: ej. 20% off */
class PercentageDiscount implements PricingStrategy {
  readonly name: string;

  constructor(private readonly percent: number) {
    this.name = `Descuento ${percent}%`;
  }

  apply(items: CartItem[]): number {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return subtotal * (this.percent / 100);
  }
}

/** Descuento por volumen: X unidades → Y% de descuento */
class BulkDiscount implements PricingStrategy {
  readonly name: string;

  constructor(private readonly minQty: number, private readonly percent: number) {
    this.name = `Descuento volumen (≥${minQty} unidades → ${percent}% off)`;
  }

  apply(items: CartItem[]): number {
    return items.reduce((disc, item) => {
      if (item.quantity >= this.minQty) {
        disc += item.price * item.quantity * (this.percent / 100);
      }
      return disc;
    }, 0);
  }
}

/** Cupón de descuento fijo: ej. $50 off */
class FixedCoupon implements PricingStrategy {
  readonly name: string;
  private used = false;

  constructor(private readonly code: string, private readonly amount: number) {
    this.name = `Cupón "${code}" ($${amount} off)`;
  }

  apply(items: CartItem[]): number {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    if (this.used) {
      console.log(`  El cupón "${this.code}" ya fue utilizado.`);
      return 0;
    }
    if (subtotal < this.amount) {
      console.log(`  Subtotal insuficiente para aplicar el cupón.`);
      return 0;
    }
    this.used = true;
    return this.amount;
  }
}

/** Combo: aplica múltiples estrategias y elige la de mayor beneficio */
class BestOfDiscount implements PricingStrategy {
  readonly name = "Mejor Descuento Disponible";

  constructor(private readonly strategies: PricingStrategy[]) { }

  apply(items: CartItem[]): number {
    const discounts = this.strategies.map(s => ({ name: s.name, value: s.apply(items) }));
    const best = discounts.reduce((max, d) => (d.value > max.value ? d : max), { name: "", value: 0 });
    console.log(`  Mejor estrategia elegida: "${best.name}" → -$${best.value.toFixed(2)}`);
    return best.value;
  }
}

// ── Carrito de Compras ─────────────────────────────────────────────────────────

class ECommerceCart {
  private items: CartItem[] = [];
  private strategy: PricingStrategy | null = null;

  addItem(item: CartItem): this {
    this.items.push(item);
    return this;
  }

  setDiscountStrategy(strategy: PricingStrategy): this {
    this.strategy = strategy;
    console.log(`  Estrategia aplicada: "${strategy.name}"`);
    return this;
  }

  checkout(): void {
    const subtotal = this.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = this.strategy ? this.strategy.apply(this.items) : 0;
    const total = subtotal - discount;

