/**
 * Ejercicio 12: Patrón Command + Historial — Editor de Documentos con Undo/Redo
 * Dificultad: Alta
 *
 * Problema en la vida real:
 * Todo editor (VS Code, Google Docs, Figma) debe soportar Ctrl+Z / Ctrl+Y.
 * Con sentencias if/else es imposible mantener un historial limpio y extensible.
 *
 * Solución: Command Pattern — cada acción del usuario es un objeto con execute() y undo().
 * El editor solo mantiene dos pilas: historial y papelera de rehaceres.
 */

// ── Interfaz Command ──────────────────────────────────────────────────────────

interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

