// src/lib/types.ts
//
// TIPOS PRINCIPALES DEL SISTEMA DE EVENTOS.
//
// Aquí definimos las entidades que maneja la app:
//
//  - User          → usuario del sistema
//  - Event         → evento creado por un usuario
//  - Registration  → inscripción de un usuario a un evento
//
// ¿Quién usa estos tipos?
//  - api.ts           → para tipar respuestas de la API
//  - authStore.ts     → tipo del usuario autenticado
//  - componentes      → props y estado (EventList, RegisterButton, etc.)
//  - páginas          → EventsPage, EventDetailPage, ProfilePage, etc.

///////////////////////
// USUARIO (User)
///////////////////////

// Representa a un usuario del sistema según el enunciado:
//
// {
//   "userId": "U001",
//   "name": "Juan Pérez",
//   "email": "juan.perez@example.com",
//   "city": "Bogotá",
//   "password": "Hola1234**"
// }
//
// Nota: por higiene normalmente NO devolveríamos el password desde el backend,
// pero el enunciado dice explícitamente que no va cifrado. Por si el backend
// lo devuelve, lo dejamos como opcional.
export interface User {
  userId: string;
  name: string;
  email: string;
  city: string;
  password?: string;
}

///////////////////////
// EVENTO (Event)
///////////////////////

// Representa un evento:
//
// {
//   "eventId": "E001",
//   "name": "Encuentro de IA",
//   "description": "...",
//   "date": "2025-12-05T18:00:00Z",
//   "city": "Bogotá",
//   "createdBy": "U001"
// }
//
// createdBy es el userId del creador del evento.
// Solo ese usuario puede editar/borrar el evento (regla del parcial).
export interface Event {
  eventId: string;
  name: string;
  description: string;
  date: string;      // string en formato ISO o similar
  city: string;
  createdBy: string; // userId del creador

  // Campo opcional que puedes usar para mostrar el número de participantes
  // sin tener que hacer un GET extra. Si el backend no lo manda, lo calculas
  // tú usando las registrations.
  participantsCount?: number;
}

///////////////////////
// INSCRIPCIÓN (Registration)
///////////////////////

// Representa la inscripción de un usuario a un evento:
//
// {
//   "regId": "R001",
//   "eventId": "E001",
//   "userId": "U002",
//   "registeredAt": "2025-10-10T09:15:00Z"
// }
export interface Registration {
  regId: string;
  eventId: string;     // id del evento al que se inscribe
  userId: string;      // id del usuario que se inscribe
  registeredAt: string;
}
