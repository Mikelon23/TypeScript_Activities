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

// ── Documento (Receptor) ──────────────────────────────────────────────────────

class TextDocument {
  private lines: string[] = [];

  insertLine(index: number, text: string): void {
    this.lines.splice(index, 0, text);
  }

  deleteLine(index: number): string {
    const [removed] = this.lines.splice(index, 1);
    return removed;
  }

  replaceLine(index: number, newText: string): string {
    const old = this.lines[index];
    this.lines[index] = newText;
    return old;
  }
