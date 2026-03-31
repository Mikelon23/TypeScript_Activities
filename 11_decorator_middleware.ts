/**
 * Ejercicio 11: Patrón Decorator — Sistema de Middleware Encadenable (Mini-Express)
 * Dificultad: Alta
 *
 * Problema en la vida real:
 * Frameworks como Express o NestJS aplican capas de procesamiento (autenticación, logging,
 * compresión, rate-limiting) de forma modulable a cada petición HTTP.
 * ¿Cómo encadenar responsabilidades sin modificar el handler original?
 *
 * Solución: Decorator Pattern puro en OOP — cada middleware envuelve al anterior
 * añadiendo su comportamiento, formando una "cebolla" de procesamiento.
 */

// ── Contexto de Petición/Respuesta ─────────────────────────────────────────────

interface HttpContext {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  user?: string;
  startTime?: number;
}

interface HttpResponse {
  status: number;
  body: unknown;
}

// ── Handler Base (interfaz común) ─────────────────────────────────────────────

interface HttpHandler {
  handle(ctx: HttpContext): HttpResponse;
}

// ── Handler Concreto (el "controlador" original) ───────────────────────────────

class DataController implements HttpHandler {
  handle(ctx: HttpContext): HttpResponse {
    console.log(` [Controlador] Procesando ${ctx.method} ${ctx.path}`);
    return {
      status: 200,
      body: { message: `Hola ${ctx.user ?? "Anónimo"}! Datos procesados correctamente.`, path: ctx.path },
    };
  }
}

