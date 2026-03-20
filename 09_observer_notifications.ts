/**
 * Ejercicio 9: Patrón Observer — Sistema de Notificaciones en Tiempo Real
 * Dificultad: Media
 *
 * Problema en la vida real:
 * Aplicaciones como Slack, Discord o cualquier dashboard necesitan que múltiples
 * componentes reaccionen al mismo evento sin acoplarse entre sí.
 * (ej: un mensaje llega → actualiza la UI, reproduce sonido, incrementa badge, guarda en DB)
 *
 * Solución: Observer Pattern con tipado genérico fuerte y soporte de múltiples canales.
 */

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface Observer<T> {
  update(event: string, payload: T): void;
}

interface Subject<T> {
  subscribe(event: string, observer: Observer<T>): void;
  unsubscribe(event: string, observer: Observer<T>): void;
  notify(event: string, payload: T): void;
}

// ── Implementación ──────────────────────────────────────────────────────────────

class EventBus<T> implements Subject<T> {
  private listeners: Map<string, Set<Observer<T>>> = new Map();

