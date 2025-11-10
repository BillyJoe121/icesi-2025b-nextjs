// src/lib/api.ts
//
// CAPA DE ACCESO A LA REST API DEL PARCIAL DE EVENTOS.
//
// Responsabilidades:
// - Centralizar TODAS las llamadas HTTP al backend.
// - Agregar el token de autenticación cuando sea necesario.
// - Devolver datos tipados (User, Event, Registration).
//
// ¿Quién usa este archivo?
// - LoginPage                → loginApi
// - Página para crear usuarios → createUserApi
// - EventsPage               → getEventsApi, createEventApi
// - EventDetailPage          → getEventByIdApi, getRegistrationsByEventApi,
//                              createRegistrationApi
// - ProfilePage              → getRegistrationsByUserApi, getEventsApi
// - Cualquier componente que necesite CRUD de eventos o usuarios.
//
// Si el profe cambia la URL base o los endpoints (/events, /registrations, etc.),
// este es el archivo que ajustas, NO toda la app.

import { User, Event, Registration } from "./types";

// URL base de la API.
// En el parcial te darán algo tipo "http://192.168.x.x:8000".
// Lo correcto es ponerlo en .env.local:
//
//   NEXT_PUBLIC_API_URL=http://192.168.131.42:8000
//
// y aquí usar esa variable. Si no existe, usamos http://localhost:8000 como
// valor por defecto de desarrollo.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/////////////////////////////
// Helper genérico apiFetch
/////////////////////////////

// Helper genérico para llamar a la API con token opcional.
// T = tipo de dato que esperas recibir (User, Event[], etc.).
//
// Parámetros:
// - path: ruta relativa, por ejemplo "/login" o "/events/E001".
// - options: método, body, headers extra, etc.
// - token: string con el token (si hay), o null/undefined.
//
// Esta función:
// - construye los headers,
// - añade Authorization si hay token,
// - hace la petición con fetch,
// - valida el status,
// - y devuelve res.json() tipado como T.
async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
    // Objeto plano de headers para poder indexar "Authorization" sin drama.
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
    };

    // Si hay token, lo agregamos al header Authorization.
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error API ${res.status}: ${text}`);
    }

    // Devolvemos el cuerpo parseado como JSON tipado T.
    return res.json();
}

///////////////////////
// AUTH / LOGIN
///////////////////////

// LOGIN
// Envía credenciales (email + password) y espera que la API devuelva:
//
//   { token: string; user: User }
//
// Si la API real cambia el nombre del campo (por ejemplo accessToken en lugar
// de token), ajustas SOLO esta función.
export async function loginApi(
    email: string,
    password: string
): Promise<{ token: string; user: User }> {
    return apiFetch<{ token: string; user: User }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// (Opcional) OBTENER USUARIO ACTUAL (si la API lo soporta)
// Hace GET /users/{id} o /me según cómo esté implementado el backend.
// Aquí lo dejamos como /me por si el profe lo implementa así.
export async function getMeApi(token: string): Promise<User> {
    return apiFetch<User>("/me", {}, token);
}

///////////////////////
// USERS
///////////////////////

// Crear nuevo usuario (POST /users)
// Requisito: "Un usuario debe ser creado por otro usuario autenticado."
export async function createUserApi(
    token: string,
    data: { name: string; email: string; city: string; password: string }
): Promise<User> {
    return apiFetch<User>(
        "/users",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        token
    );
}

// Listar usuarios (GET /users)
export async function getUsersApi(token: string): Promise<User[]> {
    return apiFetch<User[]>("/users", {}, token);
}

// Obtener detalles de un usuario por id (GET /users/{id})
export async function getUserByIdApi(
    token: string,
    userId: string
): Promise<User> {
    return apiFetch<User>(`/users/${userId}`, {}, token);
}

///////////////////////
// EVENTS (CRUD)
///////////////////////

// Obtener lista de eventos (GET /events)
export async function getEventsApi(token: string): Promise<Event[]> {
    return apiFetch<Event[]>("/events", {}, token);
}

// Crear nuevo evento (POST /events)
//
// data debe incluir: name, description, date, city.
// El backend se encarga de asignar eventId y createdBy según el usuario del token.
export async function createEventApi(
    token: string,
    data: { name: string; description: string; date: string; city: string }
): Promise<Event> {
    return apiFetch<Event>(
        "/events",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        token
    );
}

// Obtener detalle de un evento (GET /events/{id})
export async function getEventByIdApi(
    token: string,
    eventId: string
): Promise<Event> {
    return apiFetch<Event>(`/events/${eventId}`, {}, token);
}

// Actualizar un evento (PUT /events/{id})
// Solo el creador debería poder hacerlo (el backend valida createdBy vs token).
export async function updateEventApi(
    token: string,
    eventId: string,
    data: { name: string; description: string; date: string; city: string }
): Promise<Event> {
    return apiFetch<Event>(
        `/events/${eventId}`,
        {
            method: "PUT",
            body: JSON.stringify(data),
        },
        token
    );
}

// Eliminar un evento (DELETE /events/{id})
// Solo el creador debería poder hacerlo.
export async function deleteEventApi(
    token: string,
    eventId: string
): Promise<void> {
    await apiFetch<unknown>(
        `/events/${eventId}`,
        {
            method: "DELETE",
        },
        token
    );
}

///////////////////////
// REGISTRATIONS
///////////////////////

// Crear inscripción (POST /registrations)
//
// El parcial dice que una inscripción tiene:
// { regId, eventId, userId, registeredAt }
//
// Aquí mandamos eventId + userId y el backend genera regId / registeredAt.
export async function createRegistrationApi(
    token: string,
    data: { eventId: string; userId: string }
): Promise<Registration> {
    return apiFetch<Registration>(
        "/registrations",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        token
    );
}

// Obtener TODAS las inscripciones (GET /registrations)
// Probablemente no lo uses directo, pero lo dejamos por si acaso.
export async function getRegistrationsApi(
    token: string
): Promise<Registration[]> {
    return apiFetch<Registration[]>("/registrations", {}, token);
}

// Obtener inscripciones filtradas por eventId:
// GET /registrations?eventId=E001
//
// Usado en EventDetailPage para saber:
// - cuántos participantes tiene el evento.
// - si el usuario actual ya está inscrito.
export async function getRegistrationsByEventApi(
    token: string,
    eventId: string
): Promise<Registration[]> {
    return apiFetch<Registration[]>(`/registrations?eventId=${eventId}`, {}, token);
}

// Obtener inscripciones filtradas por userId:
// GET /registrations?userId=U002
//
// Usado en ProfilePage para listar los eventos a los que el usuario se ha unido.
export async function getRegistrationsByUserApi(
    token: string,
    userId: string
): Promise<Registration[]> {
    return apiFetch<Registration[]>(`/registrations?userId=${userId}`, {}, token);
}
