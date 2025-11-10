// src/components/PostItem.tsx
//
// COMPONENTE QUE REPRESENTA UN SOLO POST.
//
// ¿Qué hace?
// - Muestra título, contenido y autor de un post.
// - El título es un link que lleva a la página de detalle del post (/posts/[id]).
//
// ¿Quién lo usa?
// - PostList (para cada post del feed).
// - PostDetailPage (para mostrar el post principal arriba de los comentarios).
//
// ¿Con qué se conecta?
// - No habla con la API ni con el store.
// - Solo recibe un objeto Post por props.

"use client";

import Link from "next/link";
import type { Post } from "@/lib/types";

// Props: un solo objeto 'post'
interface PostItemProps {
    post: Post;
}

export default function PostItem({ post }: PostItemProps) {
    return (
        <article className="border rounded-md p-3 mb-3">
            {/* 
        Título del post con enlace a su página de detalle.
        El link apunta a /posts/<id> (debe coincidir con la ruta de posts/[id]/page.tsx)
      */}
            <h3 className="font-semibold mb-1">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                    {post.title}
                </Link>
            </h3>

            {/* Contenido del post */}
            <p className="text-sm mb-2">{post.body}</p>

            {/* Información del autor */}
            <p className="text-xs text-gray-500">
                Por {post.author.name} ({post.author.email})
            </p>
        </article>
    );
}
