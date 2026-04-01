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

// ── Decoradores Abstracto ─────────────────────────────────────────────────────

abstract class HttpMiddlewareDecorator implements HttpHandler {
  constructor(protected readonly inner: HttpHandler) { }
  abstract handle(ctx: HttpContext): HttpResponse;
}

// ── Middleware: Logger ─────────────────────────────────────────────────────────

class LoggerMiddleware extends HttpMiddlewareDecorator {
  handle(ctx: HttpContext): HttpResponse {
    ctx.startTime = Date.now();
    console.log(` [Logger] → ${ctx.method} ${ctx.path} recibido`);

    const response = this.inner.handle(ctx);

    const elapsed = Date.now() - (ctx.startTime ?? 0);
    console.log(` [Logger] ← Respondido con status ${response.status} en ${elapsed}ms`);
    return response;
  }
}

// ── Middleware: Autenticación ──────────────────────────────────────────────────

class AuthMiddleware extends HttpMiddlewareDecorator {
  private readonly validTokens: Map<string, string> = new Map([
    ["token-miguel-123", "Miguel"],
    ["token-admin-007", "Admin"],
  ]);

  handle(ctx: HttpContext): HttpResponse {
    const token = ctx.headers["authorization"]?.replace("Bearer ", "");

    if (!token || !this.validTokens.has(token)) {
      console.log(` [Auth] ✗ Token inválido. Acceso denegado.`);
      return { status: 401, body: { error: "Unauthorized" } };
    }

