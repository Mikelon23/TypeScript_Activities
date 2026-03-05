/**
 * EJERCICIO 1: Nivel Fácil - Sistema de Saludos Personalizados
 * 
 * OBJETIVO: 
 * Crear una función que reciba un objeto de usuario y devuelva un mensaje de bienvenida.
 * Se debe aplicar Clean Code mediante el uso de interfaces y tipos claros.
 */

enum UserRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    GUEST = 'GUEST',
}

interface UserProfile {
    name: string;
    role: UserRole;
    lastLogin?: Date;
}

/**
 * Genera un mensaje de bienvenida basado en el rol del usuario.
 * Sigue el principio de Responsabilidad Única (SRP).
 */
export const welcomeUser = (user: UserProfile): string => {
    const { name, role } = user;

    const roleMessages: Record<UserRole, string> = {
        [UserRole.ADMIN]: 'Bienvenido, administrador. Tienes acceso total al panel.',
        [UserRole.EDITOR]: 'Hola editor, tienes cambios pendientes por revisar.',
        [UserRole.GUEST]: 'Bienvenido invitado, ¡esperamos que disfrutes el contenido!',
    };

    return `Hola ${name}. ${roleMessages[role]}`;
};

// Ejemplo de uso:
const miguel: UserProfile = {
    name: 'Miguel',
    role: UserRole.ADMIN,
};


