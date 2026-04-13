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

  getContent(): string {
    return this.lines.map((l, i) => `  ${i + 1}. ${l}`).join("\n");
  }
}

// ── Comandos Concretos ────────────────────────────────────────────────────────

class InsertLineCommand implements Command {
  readonly description: string;

  constructor(private readonly doc: TextDocument, private readonly index: number, private readonly text: string) {
    this.description = `Insertar línea ${index + 1}: "${text}"`;
  }

  execute(): void { this.doc.insertLine(this.index, this.text); }
  undo(): void { this.doc.deleteLine(this.index); }
}

class DeleteLineCommand implements Command {
  readonly description: string;
  private deletedText: string = "";

  constructor(private readonly doc: TextDocument, private readonly index: number) {
    this.description = `Eliminar línea ${index + 1}`;
  }

  execute(): void { this.deletedText = this.doc.deleteLine(this.index); }
  undo(): void { this.doc.insertLine(this.index, this.deletedText); }
}

class ReplaceLineCommand implements Command {
  readonly description: string;
  private oldText: string = "";

  constructor(private readonly doc: TextDocument, private readonly index: number, private readonly newText: string) {
    this.description = `Reemplazar línea ${index + 1} con: "${newText}"`;
  }

  execute(): void { this.oldText = this.doc.replaceLine(this.index, this.newText); }
  undo(): void { this.doc.replaceLine(this.index, this.oldText); }
}

// ── Editor (Invocador) ────────────────────────────────────────────────────────

class TextEditor {
  private history: Command[] = [];
  private redoStack: Command[] = [];

  constructor(public readonly document: TextDocument) { }

  run(command: Command): void {
    command.execute();
    this.history.push(command);
    this.redoStack = []; // Cualquier acción nueva borra el historial de redo
    console.log(` Ejecutado: ${command.description}`);
  }

  undo(): void {
    const command = this.history.pop();
    if (!command) { console.log(" Nada que deshacer."); return; }
    command.undo();
    this.redoStack.push(command);
    console.log(` Deshecho: ${command.description}`);
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) { console.log(" Nada que rehacer."); return; }
    command.execute();
    this.history.push(command);
    console.log(` Rehecho: ${command.description}`);
  }

  printDocument(): void {
    console.log(`\n Contenido actual del documento:\n${this.document.getContent() || "  (vacío)"}\n`);
  }
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function runEditorDemo() {
  console.log("--- Iniciando Demo: Command Pattern — Editor con Undo/Redo ---\n");

  const doc = new TextDocument();
  const editor = new TextEditor(doc);

  editor.run(new InsertLineCommand(doc, 0, "# Título del Documento"));
  editor.run(new InsertLineCommand(doc, 1, "Introducción al patrón Command."));
  editor.run(new InsertLineCommand(doc, 2, "Esta es la tercer línea."));
  editor.printDocument();

  console.log(" Reemplazando línea 2...");
  editor.run(new ReplaceLineCommand(doc, 1, "El patrón Command es extremadamente poderoso."));
  editor.printDocument();

  console.log(" Eliminando línea 3...");
  editor.run(new DeleteLineCommand(doc, 2));
  editor.printDocument();

  console.log(" Deshacer 2 veces...");
  editor.undo();
  editor.undo();
  editor.printDocument();

