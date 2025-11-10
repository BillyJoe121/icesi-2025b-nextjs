// Esta es la PÁGINA de FEED.
// Ruta: /feed      (porque está en app/(general)/feed/page.tsx)
// Responsabilidad: 
//   - Pedir a la API la lista de posts del usuario autenticado
//   - Mostrar el usuario logueado (AuthUser)
//   - Mostrar formulario para crear post (NewPostForm)
//   - Mostrar lista de posts (PostList)
//   - Si no hay token, redirigir a /login

"use client"; 
// Marcamos la página como "cliente" porque usamos hooks de React (useState, useEffect)
// y useRouter de Next. Sin esto, no se puede usar nada del cliente.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Store global de autenticación (Zustand)
import { useAuthStore } from "@/store/authStore";

// Función que llama a la API para obtener los posts
import { getPostsApi } from "@/lib/api";

// Tipo Post para tipar el estado
import type { Post } from "@/lib/types";

// Componentes de UI que usamos en la página
import AuthUser from "@/components/AuthUser";       // Muestra la info del usuario autenticado
import NewPostForm from "@/components/NewPostForm"; // Formulario para crear un nuevo post
import PostList from "@/components/PostList";       // Lista que muestra varios posts

// Componente principal de la página de feed
export default function FeedPage() {
  // Hook de Next para navegar entre rutas (redirigir, etc.)
  const router = useRouter();

  // Extraemos del store de auth:
  // - token: el token actual (string | null)
  // - hydrateFromStorage: función que intenta leer token/usuario desde localStorage
  const { token, hydrateFromStorage } = useAuthStore((state) => ({
    token: state.token,
    hydrateFromStorage: state.hydrateFromStorage,
  }));

  // Estado local con la lista de posts que se muestran en el feed
  const [posts, setPosts] = useState<Post[]>([]);

  // Estado de carga para mostrar mensaje tipo "Cargando..."
  const [loading, setLoading] = useState(true);

  // Estado de error para mostrar mensajes cuando algo sale mal
  const [error, setError] = useState<string | null>(null);

  // 1) Primer efecto: al montar el componente, intentamos hidratar 
  //    la información de autenticación desde localStorage.
  //    Esto permite que si ya te habías logueado antes, se recupere el token y el usuario.
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // 2) Segundo efecto: si después de hidratar el store NO hay token,
  //    redirigimos a la pantalla de login.
  useEffect(() => {
    // token === null significa "no tengo token en el store"
    if (token === null) {
      router.replace("/login");
    }
  }, [token, router]);

  // 3) Tercer efecto: cuando tengamos un token, pedimos los posts a la API.
  useEffect(() => {
    // Si no hay token, no intentamos llamar la API.
    if (!token) return;

    // Definimos una función asíncrona que recibe un token "seguro" (string)
    async function loadPosts(currentToken: string) {
      try {
        setLoading(true);
        setError(null);

        // Llamamos a la API para obtener la lista de posts del usuario autenticado.
        // getPostsApi se conecta con la REST API que el profe dará en el examen.
        const data = await getPostsApi(currentToken);

        // Guardamos los posts en el estado local
        setPosts(data);
      } catch {
        // Si la API falla, mostramos un mensaje de error
        setError("No se pudieron cargar los posts.");
      } finally {
        // Independientemente de éxito o error, dejamos de mostrar "Cargando..."
        setLoading(false);
      }
    }

    // Llamamos a la función usando el token actual (que ya sabemos que no es null)
    loadPosts(token);
  }, [token]);

  // Esta función se pasa como prop a NewPostForm.
  // Cuando se crea un nuevo post en el servidor, NewPostForm llamará a este callback
  // para que actualicemos la lista en pantalla sin recargar todo.
  function handlePostCreated(newPost: Post) {
    // Insertamos el nuevo post al inicio de la lista existente
    setPosts((prev) => [newPost, ...prev]);
  }

  // Render de la página
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Contenedor central con ancho máximo para que la UI no se vea gigante */}
      <div className="max-w-2xl mx-auto py-6">
        {/* Título principal de la página */}
        <h1 className="text-2xl font-bold mb-4">Feed de posts</h1>

        {/* 
          Componente AuthUser:
          - Se conecta al authStore
          - Muestra el nombre y correo del usuario autenticado
        */}
        <AuthUser />

        {/*
          Formulario para crear un nuevo post:
          - Envía título y contenido a la API (createPostApi)
          - Si la creación es exitosa, llama onPostCreated(newPost),
            que viene de esta página y actualiza el estado "posts"
        */}
        <NewPostForm onPostCreated={handlePostCreated} />

        {/* Mensaje de carga mientras esperamos la respuesta de la API */}
        {loading && <p className="text-sm text-gray-500">Cargando posts...</p>}

        {/* Mensaje de error si algo salió mal */}
        {error && (
          <p className="text-sm text-red-600 mb-2">
            {error}
          </p>
        )}

        {/* 
          Lista de posts:
          - Se muestra solo cuando NO estamos cargando y NO hay error
          - Recibe el array de posts y los renderiza con PostItem internamente
        */}
        {!loading && !error && <PostList posts={posts} />}
      </div>
    </main>
  );
}
