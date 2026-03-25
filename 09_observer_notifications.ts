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

  subscribe(event: string, observer: Observer<T>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(observer);
    console.log(`📻 [${observer.constructor.name}] se suscribió al evento "${event}"`);
  }

  unsubscribe(event: string, observer: Observer<T>): void {
    this.listeners.get(event)?.delete(observer);
    console.log(` [${observer.constructor.name}] se desuscribió del evento "${event}"`);
  }

  notify(event: string, payload: T): void {
    const subs = this.listeners.get(event);
    if (!subs || subs.size === 0) {
      console.log(`  Nadie escucha el evento "${event}"`);
      return;
    }
    subs.forEach(obs => obs.update(event, payload));
  }
}

// ── Tipos de mensajes ──────────────────────────────────────────────────────────

interface ChatMessage {
  from: string;
  text: string;
  channel: string;
}

// ── Observadores Concretos ─────────────────────────────────────────────────────

class UINotifier implements Observer<ChatMessage> {
  update(_event: string, { from, text, channel }: ChatMessage): void {
    console.log(`    [UI]    Mostrando mensaje en #${channel}: "${text}" — de ${from}`);
  }
}

class SoundPlayer implements Observer<ChatMessage> {
  update(_event: string, { channel }: ChatMessage): void {
    console.log(`  [Audio]  *ding* — Nuevo mensaje en #${channel}`);
  }
}

