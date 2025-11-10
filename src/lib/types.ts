// src/lib/types.ts
//
// Aquí definimos los TIPOS compartidos que representan
// las entidades principales del sistema.
//
// Ventaja: en lugar de pasar objetos "cualquier cosa",
// todo el código trabaja con tipos claros:
//   - User
//   - Post
//   - Comment
//
// ¿Quién usa estos tipos?
// - api.ts → tipar respuestas de la API
// - authStore.ts → tipar el usuario guardado
// - componentes (PostItem, CommentList, etc.) → tipar props y estado

// Representa al usuario autenticado.
// Ajusta campos según lo que devuelva la API real del profe.
// Si la API usa otros nombres (por ejemplo "username"), simplemente
// cambias este tipo y las partes que lo usen.
export interface User {
  id: number;
  name: string;
  email: string;
}

// Representa un post en el feed.
export interface Post {
  id: number;
  title: string;
  body: string;
  author: User;      // usuario que creó el post
  createdAt?: string; // campo opcional (por si la API lo manda)
}

// Representa un comentario asociado a un post.
export interface Comment {
  id: number;
  body: string;
  author: User;     // usuario que escribió el comentario
  postId: number;   // id del post al que pertenece
  createdAt?: string;
}
