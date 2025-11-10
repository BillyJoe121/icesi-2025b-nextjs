// src/components/NewPostForm.tsx
//
// FORMULARIO PARA CREAR UN NUEVO POST EN EL FEED.
//
// ¿Qué hace?
// - Muestra inputs para título y contenido del post.
// - Al enviar:
//     * Verifica que haya token.
//     * Verifica que título y contenido no estén vacíos.
//     * Llama a createPostApi para crear el post en el servidor.
//     * Limpia el formulario.
//     * Llama a onPostCreated(newPost) para que la página de feed actualice su lista.
//
// ¿Quién lo usa?
// - FeedPage (src/app/(general)/feed/page.tsx)
//
// ¿Con qué se conecta?
// - useAuthStore (para leer el token).
// - createPostApi de src/lib/api.ts.
// - Tipo Post de src/lib/types.ts.

"use client";

import { FormEvent, useState } from "react";
import { createPostApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Post } from "@/lib/types";

// Props:
// - onPostCreated: callback opcional que usará el padre (FeedPage)
//   para actualizar la lista de posts cuando se cree uno nuevo.
interface NewPostFormProps {
    onPostCreated?: (post: Post) => void;
}

export default function NewPostForm({ onPostCreated }: NewPostFormProps) {
    // Token actual del usuario autenticado
    const token = useAuthStore((state) => state.token);

    // Estado local para campos del formulario
    const [title, setTitle] = useState("");  // título del post
    const [body, setBody] = useState("");    // contenido del post

    // Estado de carga mientras se envía la petición a la API
    const [loading, setLoading] = useState(false);

    // Mensaje de error si algo falla
    const [error, setError] = useState<string | null>(null);

    // Handler que se ejecuta al enviar el formulario
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        // Sin token no deberíamos intentar crear posts
        if (!token) {
            setError("No hay token de autenticación.");
            return;
        }

        // Validación: campos vacíos
        if (!title.trim() || !body.trim()) {
            setError("Título y contenido son obligatorios.");
            return;
        }

        try {
            setLoading(true);

            // Llamamos a la API para crear el post
            const newPost = await createPostApi(token, { title, body });

            // Limpiamos el formulario cuando el POST fue exitoso
            setTitle("");
            setBody("");

            // Avisamos al padre (FeedPage) si pasó un callback
            // para que agregue este post a la lista actual en pantalla.
            onPostCreated?.(newPost);
        } catch (err) {
            setError("No se pudo crear el post.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="border p-4 mb-4 rounded-md">
            <h2 className="font-semibold mb-2">Crear nuevo post</h2>

            {/* Formulario controlado */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {/* Campo de título */}
                <input
                    type="text"
                    placeholder="Título del post"
                    className="border rounded px-2 py-1 text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Campo de contenido */}
                <textarea
                    placeholder="Contenido del post"
                    className="border rounded px-2 py-1 text-sm min-h-[80px]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />

                {/* Mensaje de error, si existe */}
                {error && (
                    <p className="text-xs text-red-600">
                        {error}
                    </p>
                )}

                {/* Botón para enviar el formulario */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-60"
                >
                    {loading ? "Publicando..." : "Publicar"}
                </button>
            </form>
        </section>
    );
}
