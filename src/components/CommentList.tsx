// src/components/CommentList.tsx
//
// COMPONENTE PARA LISTAR COMENTARIOS DE UN POST.
//
// ¿Qué hace?
// - Recibe un array de comentarios (props.comments).
// - Si está vacío, muestra "Aún no hay comentarios".
// - Si tiene elementos, los recorre y muestra cada comentario con autor.
//
// ¿Quién lo usa?
// - Solo PostDetailPage (src/app/(general)/posts/[id]/page.tsx)
//
// ¿Con qué se conecta?
// - No llama a la API ni al store.
// - Solo usa el tipo Comment desde src/lib/types.ts.

"use client";

import type { Comment } from "@/lib/types";

// Definimos las props que recibe este componente:
// 'comments' es un arreglo de Comment.
interface CommentListProps {
    comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
    // Si no hay comentarios en el arreglo, mostramos un mensaje vacío.
    if (!comments.length) {
        return <p className="text-sm text-gray-500">Aún no hay comentarios.</p>;
    }

    // Si sí hay comentarios, los mostramos en una lista.
    return (
        <section className="mt-2">
            <h3 className="font-semibold mb-2">Comentarios</h3>
            <ul className="space-y-2">
                {comments.map((comment) => (
                    <li
                        key={comment.id}
                        className="border rounded-md p-2 text-sm bg-gray-50"
                    >
                        {/* Texto principal del comentario */}
                        <p className="mb-1">{comment.body}</p>

                        {/* Información del autor del comentario */}
                        <p className="text-[11px] text-gray-500">
                            Por {comment.author.name} ({comment.author.email})
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
