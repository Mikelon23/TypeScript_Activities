/**
 * Ejercicio 17: Patrón Proxy — Sistema de Caché Inteligente con Control de Acceso
 * Dificultad: Media-Alta
 *
 * Problema en la vida real:
 * Las llamadas a APIs externas o bases de datos son lentas y costosas.
 * Además, datos sensibles (salarios, datos médicos) solo deben ser accesibles por roles específicos.
 * Un Proxy puede añadir caché Y control de acceso transparentemente sin tocar el servicio real.
 *
 * Solución: Proxy Pattern — el cliente llama a la misma interfaz pero el proxy
 * intercepta las llamadas para añadir caché en memoria + validación de permisos.
 */

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  name: string;
  role: string;
