/**
 * Ejercicio 15: Patrón Composite — Sistema de Archivos en Memoria (Mini-OS)
 * Dificultad: Media-Alta
 *
 * Problema en la vida real:
 * Los sistemas de archivos (Windows Explorer, Finder, Linux VFS) tienen una estructura
 * de árbol donde carpetas y archivos comparten operaciones (tamaño, listar, mover).
 * Tratar carpetas y archivos de forma diferente con if/else es frágil e inconsistente.
 *
 * Solución: Composite Pattern — Archivo y Carpeta implementan la misma interfaz "Nodo".
 * Las carpetas contienen colecciones de nodos (recursivo), los archivos son hojas.
 */

// ── Componente Abstracto ──────────────────────────────────────────────────────

abstract class FileSystemNode {
  constructor(public name: string) { }

  abstract getSize(): number;           // Tamaño en bytes (carpetas = suma de hijos)
  abstract print(indent?: string): void;
  abstract find(name: string): FileSystemNode | null;
}

// ── Hoja: Archivo ─────────────────────────────────────────────────────────────

class VirtualFile extends FileSystemNode {
  constructor(name: string, private readonly size: number, private content: string = "") {
    super(name);
  }

  getSize(): number { return this.size; }

  readContent(): string { return this.content; }
  writeContent(text: string): void { this.content = text; }

  find(name: string): FileSystemNode | null {
    return this.name === name ? this : null;
  }

  print(indent: string = ""): void {
    console.log(`${indent} ${this.name} (${this.size} bytes)`);
  }
}

// ── Composite: Carpeta ────────────────────────────────────────────────────────

class Directory extends FileSystemNode {
  private children: FileSystemNode[] = [];

  constructor(name: string) { super(name); }

  add(node: FileSystemNode): this {
    this.children.push(node);
    return this;
  }

  remove(name: string): boolean {
    const idx = this.children.findIndex(c => c.name === name);
    if (idx === -1) return false;
    this.children.splice(idx, 1);
    return true;
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  find(name: string): FileSystemNode | null {
    if (this.name === name) return this;
    for (const child of this.children) {
      const found = child.find(name);
      if (found) return found;
    }
    return null;
  }

  list(): FileSystemNode[] { return [...this.children]; }

  print(indent: string = ""): void {
    console.log(`${indent} ${this.name}/ (${this.getSize()} bytes total)`);
    this.children.forEach(child => child.print(indent + "   "));
  }
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function runFileSystemDemo() {
  console.log("--- Iniciando Demo: Composite — Sistema de Archivos en Memoria ---\n");

  const root = new Directory("root");

  const srcDir = new Directory("src");
  srcDir
    .add(new VirtualFile("index.ts", 1024, "console.log('Hello World')"))
    .add(new VirtualFile("utils.ts", 512))
    .add(
      new Directory("components")
        .add(new VirtualFile("Button.tsx", 2048))
        .add(new VirtualFile("Modal.tsx", 3096))
    );

