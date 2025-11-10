// src/components/PostList.tsx
//
// LISTA DE POSTS.
//
// ¿Qué hace?
// - Recibe un array de posts.
// - Si el array está vacío, muestra "No hay posts todavía".
// - Si tiene elementos, dibuja un PostItem por cada post.
//
// ¿Quién lo usa?
// - Solo FeedPage (src/app/(general)/feed/page.tsx)
//
// ¿Con qué se conecta?
// - No usa API ni store.
// - Se apoya en PostItem y en el tipo Post de src/lib/types.ts.

"use client";

import type { Post } from "@/lib/types";
import PostItem from "./PostItem";

interface PostListProps {
    posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
    // Si no hay posts, mostramos mensaje vacío
    if (!posts.length) {
        return <p className="text-sm text-gray-500">No hay posts todavía.</p>;
    }

    // Recorremos el array y mostramos un PostItem por cada post
    return (
        <section>
            {posts.map((post) => (
                <PostItem key={post.id} post={post} />
            ))}
        </section>
    );
}
