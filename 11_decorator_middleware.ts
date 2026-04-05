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

    ctx.user = this.validTokens.get(token);
    console.log(` [Auth] ✓ Usuario autenticado: ${ctx.user}`);
    return this.inner.handle(ctx);
  }
}

// ── Middleware: Rate Limiter ───────────────────────────────────────────────────

class RateLimiter extends HttpMiddlewareDecorator {
  private requestCounts: Map<string, { count: number; windowStart: number }> = new Map();

  constructor(inner: HttpHandler, private readonly maxRequests: number, private readonly windowMs: number) {
    super(inner);
  }

  handle(ctx: HttpContext): HttpResponse {
    const ip = ctx.headers["x-forwarded-for"] ?? "unknown";
    const now = Date.now();
    const entry = this.requestCounts.get(ip) ?? { count: 0, windowStart: now };

    if (now - entry.windowStart > this.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    entry.count++;
    this.requestCounts.set(ip, entry);

    if (entry.count > this.maxRequests) {
      console.log(` [RateLimit] ✗ IP ${ip} excedió el límite (${entry.count}/${this.maxRequests})`);
      return { status: 429, body: { error: "Too Many Requests" } };
    }

    console.log(` [RateLimit] ✓ IP ${ip} — petición ${entry.count}/${this.maxRequests}`);
    return this.inner.handle(ctx);
  }
}

// ── Demo ───────────────────────────────────────────────────────────────────────

function runMiddlewareDemo() {
  console.log("--- Iniciando Demo: Decorator — Mini-Framework Middleware ---\n");

  // Construir la "cebolla": Logger → RateLimiter → Auth → Controller
  const pipeline: HttpHandler = new LoggerMiddleware(
    new RateLimiter(
      new AuthMiddleware(new DataController()),
      3,    // máx 3 peticiones
      5000  // ventana de 5 segundos
    )
  );

  const makeCtx = (token: string, ip: string): HttpContext => ({
    method: "GET",
    path: "/api/dashboard",
    headers: { authorization: `Bearer ${token}`, "x-forwarded-for": ip },
  });

  console.log(" Petición 1 — Token válido:");
  console.log(pipeline.handle(makeCtx("token-miguel-123", "192.168.1.1")));

  console.log("\n Petición 2 — Token inválido:");
  console.log(pipeline.handle(makeCtx("token-hackeado", "192.168.1.1")));

  console.log("\n Petición 3 — Token válido:");
  console.log(pipeline.handle(makeCtx("token-miguel-123", "192.168.1.1")));

  console.log("\n Petición 4 — Rate Limit excedido:");
  console.log(pipeline.handle(makeCtx("token-miguel-123", "192.168.1.1")));
}

runMiddlewareDemo();
