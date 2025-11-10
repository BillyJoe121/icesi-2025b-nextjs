// src/lib/api.ts
//
// ARCHIVO: capa de acceso a la REST API.
//
// Responsabilidad:
// - Centralizar TODAS las llamadas HTTP al backend.
// - Evitar repetir fetch en cada página o componente.
// - Agregar el token de autenticación cuando sea necesario.
// - Devolver datos tipados (User, Post, Comment).
//
// ¿Quién usa este archivo?
// - LoginPage → loginApi
// - FeedPage → getPostsApi, createPostApi
// - NewPostForm → createPostApi
// - PostDetailPage → getPostByIdApi, getCommentsByPostApi
// - NewCommentForm → createCommentApi
//
// Si el profe cambia las rutas de la API (/login, /posts, etc.),
// este es el archivo que tendrías que ajustar.

import { User, Post, Comment } from "./types";

// URL base de la API.
// En el parcial, probablemente te den algo tipo "http://localhost:3001" o similar.
// Aquí lo dejamos configurable por variable de entorno.
//
// En .env.local pondrías algo como:
//   NEXT_PUBLIC_API_URL=http://localhost:3001
//
// Si no hay variable, usamos un valor por defecto para desarrollo local.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Helper genérico para llamar a la API con token opcional.
// T = tipo de dato que esperas recibir (User, Post[], etc.).
//
// Parámetros:
// - path: ruta relativa, por ejemplo "/login" o "/posts/1".
// - options: método, body, headers extra, etc.
// - token: string con el token JWT (si hay), o null/undefined.
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
    // Usamos un objeto plano para los headers para que TS nos deje indexar
    // con "Authorization" sin llorar.
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
    };

    // Si hay token, lo agregamos al header Authorization.
    // Esto permite que el backend sepa qué usuario está haciendo la petición.
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers, // compatible con HeadersInit
    });

    if (!res.ok) {
        // En un parcial real, podrías distinguir 401/403/500 aquí si quieres.
        // Para simplificar, lanzamos un error genérico con el status y el texto.
        const text = await res.text();
        throw new Error(`Error API ${res.status}: ${text}`);
    }

    // Devolvemos el cuerpo parseado como JSON tipado T
    return res.json();
}

// LOGIN
// Envía credenciales (email + password) y espera que la API devuelva:
//   { token: string; user: User }
//
// ¿Dónde lo usamos?
// - LoginPage (cuando el usuario envía el formulario de login)
export async function loginApi(
    email: string,
    password: string
): Promise<{ token: string; user: User }> {
    return apiFetch<{ token: string; user: User }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// OBTENER USUARIO ACTUAL (si la API lo soporta)
// Hace GET /me con el token en el header.
// Podrías usarlo en futuros escenarios para refrescar info del usuario.
export async function getMeApi(token: string): Promise<User> {
    return apiFetch<User>("/me", {}, token);
}

// OBTENER LISTA DE POSTS
// Hace GET /posts con el token.
// ¿Quién lo llama?
// - FeedPage (para llenar el feed al cargar la página).
export async function getPostsApi(token: string): Promise<Post[]> {
    return apiFetch<Post[]>("/posts", {}, token);
}

// CREAR NUEVO POST
// Hace POST /posts con { title, body } en el body.
// ¿Quién lo llama?
// - NewPostForm (usado dentro de FeedPage).
export async function createPostApi(
    token: string,
    data: { title: string; body: string }
): Promise<Post> {
    return apiFetch<Post>(
        "/posts",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        token
    );
}

// OBTENER UN POST POR ID
// Hace GET /posts/:id
// ¿Quién lo llama?
// - PostDetailPage, para mostrar el post principal antes de los comentarios.
export async function getPostByIdApi(
    token: string,
    id: number
): Promise<Post> {
    return apiFetch<Post>(`/posts/${id}`, {}, token);
}

// OBTENER COMENTARIOS DE UN POST
// Hace GET /posts/:postId/comments
// ¿Quién lo llama?
// - PostDetailPage, para cargar la lista de comentarios del post.
export async function getCommentsByPostApi(
    token: string,
    postId: number
): Promise<Comment[]> {
    return apiFetch<Comment[]>(`/posts/${postId}/comments`, {}, token);
}

// CREAR COMENTARIO PARA UN POST
// Hace POST /posts/:postId/comments con { body }.
// ¿Quién lo llama?
// - NewCommentForm (en la página de detalle de post).
export async function createCommentApi(
    token: string,
    postId: number,
    data: { body: string }
): Promise<Comment> {
    return apiFetch<Comment>(
        `/posts/${postId}/comments`,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        token
    );
}
