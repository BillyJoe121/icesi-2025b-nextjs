// src/components/NewCommentForm.tsx
//
// FORMULARIO PARA CREAR UN NUEVO COMENTARIO EN UN POST.
//
// ¿Qué hace?
// - Muestra un textarea donde el usuario escribe un comentario.
// - Al enviar:
//     * Verifica que haya token (usuario autenticado).
//     * Verifica que el comentario no esté vacío.
//     * Llama a la API (createCommentApi) para guardar el comentario en el servidor.
//     * Si todo va bien:
//         - Limpia el textarea.
//         - Llama al callback onCommentCreated con el nuevo comentario.
//
// ¿Quién lo usa?
// - PostDetailPage (src/app/(general)/posts/[id]/page.tsx)
//
// ¿Con qué se conecta?
// - useAuthStore (para leer el token)
// - createCommentApi de src/lib/api.ts
// - Tipo Comment de src/lib/types.ts

"use client";

import { FormEvent, useState } from "react";
import { createCommentApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Comment } from "@/lib/types";

// Props que recibe el componente:
// - postId: el id del post al que pertenece el comentario.
// - onCommentCreated: callback opcional que se ejecuta cuando el comentario
//   se crea exitosamente en el servidor.
interface NewCommentFormProps {
    postId: number;
    onCommentCreated?: (comment: Comment) => void;
}

export default function NewCommentForm({
    postId,
    onCommentCreated,
}: NewCommentFormProps) {
    // Leemos el token del store global de autenticación.
    // Si no hay token, no deberíamos permitir crear comentarios.
    const token = useAuthStore((state) => state.token);

    // Estado local para el contenido del comentario
    const [body, setBody] = useState("");

    // Estado de carga para deshabilitar el botón mientras se envía
    const [loading, setLoading] = useState(false);

    // Mensaje de error si algo falla
    const [error, setError] = useState<string | null>(null);

    // Esta función se ejecuta cuando se envía el formulario
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        // Validación: no hay token → usuario no autenticado
        if (!token) {
            setError("No hay token de autenticación.");
            return;
        }

        // Validación: comentario vacío
        if (!body.trim()) {
            setError("El comentario no puede estar vacío.");
            return;
        }

        try {
            setLoading(true);

            // Llamamos a la API para crear el comentario asociado al postId
            const newComment = await createCommentApi(token, postId, { body });

            // Limpiamos el textarea
            setBody("");

            // Si el padre (PostDetailPage) pasó un callback, lo llamamos
            // para que actualice el estado de comentarios en la página.
            onCommentCreated?.(newComment);
        } catch {
            setError("No se pudo crear el comentario.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="border rounded-md p-3 mt-4 mb-4">
            <h3 className="font-semibold mb-2">Nuevo comentario</h3>

            {/* Formulario controlado */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <textarea
                    placeholder="Escribe tu comentario..."
                    className="border rounded px-2 py-1 text-sm min-h-[60px]"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />

                {/* Mensaje de error, si lo hay */}
                {error && (
                    <p className="text-xs text-red-600">
                        {error}
                    </p>
                )}

                {/* Botón de enviar comentario */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white text-sm px-3 py-1 rounded disabled:opacity-60"
                >
                    {loading ? "Enviando..." : "Comentar"}
                </button>
            </form>
        </section>
    );
}
