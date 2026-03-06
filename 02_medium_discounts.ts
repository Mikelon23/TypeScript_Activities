/**
 * EJERCICIO 2: Nivel Medio - Sistema de Descuentos (Patrón Strategy)
 * 
 * OBJETIVO:
 * Implementar un sistema de carrito de compras donde el cálculo del descuento
 * dependa del tipo de cliente, sin usar múltiples 'if/else' (Abierto/Cerrado).
 */

interface Product {
    id: string;
    name: string;
    price: number;
}

/**
 * Interfaz para definir la estrategia de descuento.
 */
interface DiscountStrategy {
    calculate(total: number): number;
}

// Estrategias concretas
class NoDiscount implements DiscountStrategy {
    calculate(total: number): number {
        return total;
    }
}

