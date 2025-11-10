// Esta es la PÁGINA de DETALLE de POST con COMENTARIOS.
// Ruta: /posts/[id]    (porque está en app/(general)/posts/[id]/page.tsx)
// Responsabilidad:
//   - Leer el id del post desde la URL
//   - Verificar que el id sea válido (numérico) o mandar a 404
//   - Verificar que el usuario esté autenticado (tenga token)
//   - Llamar a la API para obtener:
//       * el post específico
//       * la lista de comentarios del post
//   - Mostrar el usuario autenticado (AuthUser)
//   - Mostrar el post (PostItem)
//   - Mostrar formulario de nuevo comentario (NewCommentForm)
//   - Mostrar lista de comentarios (CommentList)

"use client";

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Store global de autenticación
import { useAuthStore } from "@/store/authStore";

// Funciones de API para obtener post y comentarios
import {
    getPostByIdApi,
    getCommentsByPostApi,
} from "@/lib/api";

// Tipos para tipar el estado local
import type { Post, Comment } from "@/lib/types";

// Componentes de UI que reutilizamos
import AuthUser from "@/components/AuthUser";
import PostItem from "@/components/PostItem";
import NewCommentForm from "@/components/NewCommentForm";
import CommentList from "@/components/CommentList";

// Tipo de props que Next le pasa a esta página dinámica.
// 'params.id' viene del segmento [id] de la URL.
interface PostDetailPageProps {
    params: {
        id: string;
    };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
    const router = useRouter();

    // Desde el store leemos:
    // - token: para hacer llamadas autenticadas
    // - hydrateFromStorage: para recuperar auth desde localStorage
    const { token, hydrateFromStorage } = useAuthStore((state) => ({
        token: state.token,
        hydrateFromStorage: state.hydrateFromStorage,
    }));

    // Estado con el post actual
    const [post, setPost] = useState<Post | null>(null);

    // Estado con la lista de comentarios del post
    const [comments, setComments] = useState<Comment[]>([]);

    // Estado de carga
    const [loading, setLoading] = useState(true);

    // Estado de error
    const [error, setError] = useState<string | null>(null);

    // Convertimos el id de la URL (string) a número
    const numericId = Number(params.id);

    // Si no es un número, mandamos al 404 de Next
    if (Number.isNaN(numericId)) {
        notFound();
    }

    // 1) Hidratar auth desde localStorage al montar la página
    useEffect(() => {
        hydrateFromStorage();
    }, [hydrateFromStorage]);

    // 2) Si no hay token, mandamos a login
    useEffect(() => {
        if (token === null) {
            router.replace("/login");
        }
    }, [token, router]);

    // 3) Cargar post + comentarios cuando tengamos token
    useEffect(() => {
        if (!token) return;

        // Función asíncrona auxiliar que recibe un token "seguro"
        async function loadData(currentToken: string) {
            try {
                setLoading(true);
                setError(null);

                // Pedimos al mismo tiempo:
                // - los datos del post
                // - los comentarios asociados al post
                const [postData, commentsData] = await Promise.all([
                    getPostByIdApi(currentToken, numericId),
                    getCommentsByPostApi(currentToken, numericId),
                ]);

                // Guardamos las respuestas en el estado
                setPost(postData);
                setComments(commentsData);
            } catch {
                // Si algo falla, guardamos un mensaje de error
                setError("No se pudo cargar el post o sus comentarios.");
            } finally {
                // Dejamos de mostrar el estado de carga
                setLoading(false);
            }
        }

        // Llamamos la función con el token actual
        loadData(token);
    }, [token, numericId]);

    // Handler que se pasa a NewCommentForm.
    // Cuando la API crea un nuevo comentario, este callback se ejecuta
    // para agregar el comentario al estado local sin recargar toda la página.
    function handleCommentCreated(newComment: Comment) {
        setComments((prev) => [...prev, newComment]);
    }

    // Vista mientras está cargando la información del post
    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100">
                <div className="max-w-2xl mx-auto py-6">
                    <p className="text-sm text-gray-500">Cargando post...</p>
                </div>
            </main>
        );
    }

    // Vista si hubo error o no se encontró el post
    if (error || !post) {
        return (
            <main className="min-h-screen bg-gray-100">
                <div className="max-w-2xl mx-auto py-6">
                    <p className="text-sm text-red-600">
                        {error ?? "Post no encontrado."}
                    </p>
                </div>
            </main>
        );
    }

    // Vista normal cuando todo cargó bien
    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-2xl mx-auto py-6">
                <h1 className="text-2xl font-bold mb-4">Detalle del post</h1>

                {/* Muestra info del usuario autenticado */}
                <AuthUser />

                {/* Muestra el contenido del post (título, cuerpo, autor, etc.) */}
                <PostItem post={post} />

                {/* Formulario para crear un nuevo comentario */}
                <NewCommentForm postId={numericId} onCommentCreated={handleCommentCreated} />

                {/* Lista de todos los comentarios del post */}
                <CommentList comments={comments} />
            </div>
        </main>
    );
}
