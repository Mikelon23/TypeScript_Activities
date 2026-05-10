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
