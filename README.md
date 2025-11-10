## 1. Comandos que debes ejecutar apenas te sientes

Sin inventar:

1. `npm install`
2. `npm run dev` para ver que el proyecto levanta (y ver rutas ejemplo en el navegador).
3. `npm test` para ver:

   * qué se rompe
   * qué rutas/archivos espera el profe
   * qué textos exactos buscan los tests

Ese `npm test` es tu oráculo. Lo corres muchas veces, no solo al final.

---

## 2. Archivos que tienes que revisar antes de crear nada

En este orden:

1. **`package.json`**

   * Qué scripts existen (`test`, `dev`, etc.)
   * Si hay algo tipo `"test": "jest"` o `"vitest"`, etc.

Si el alias @/ no existe, revienta en todos lados.
En Next normalmente ya viene configurado, pero si no, en tu tsconfig.json debe haber algo de este estilo:

   {
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}


2. **`src/app/layout.tsx`**

   * Cómo está estructurado el layout base.
   * Si ya hay algún `AuthProvider` o similar.
   * Qué CSS global está usando.

3. **Páginas de ejemplo**

   * `src/app/about/page.tsx`
   * `src/app/counter/page.tsx`
   * `src/app/user/page.tsx`
   * `src/app/user/[id]/page.tsx`

   Cosas que debes **copiar**:

   * Cómo exportan:

     ```ts
     export default function Page() { ... }
     ```

     o si el componente se llama `UserPage`, etc.
   * Si usan `"use client"` arriba.
   * Cómo leen params:

     ```ts
     type Props = { params: { id: string } }
     export default function Page({ params }: Props) { ... }
     ```
   * Cómo usan `Link` y `useRouter`.

4. **Carpeta de tests**

   Busca algo tipo:

   * `src/__tests__`
   * `__tests__/`
   * o archivos `*.test.tsx`

   Abre especialmente:

   * Tests de login
   * Tests de feed
   * Tests de detalle de comentarios

   Lo que veas ahí manda:

   * Qué rutas esperan (`/login`, `/feed`, `/posts/[id]`, etc.)
   * Qué componentes importan (`import FeedPage from "@/app/feed/page";`)
   * Qué textos exactos esperan (`getByText("Login")`, `getByRole("button", { name: /publicar/i })`…)

---

## 3. Qué archivos vas a tener que crear (estructura mínima)

Te marco lo típico que te van a exigir según el enunciado, usando App Router:

### Páginas

Probable mínimo:

* `src/app/login/page.tsx`
* `src/app/feed/page.tsx`
* `src/app/posts/page.tsx` (a veces no la usan)
* `src/app/posts/[id]/page.tsx`

Pueden usar otro nombre en lugar de `posts`, por eso tienes que mirar los tests:
Si ahí sale `"/comments/[id]"`, entonces será `src/app/comments/[id]/page.tsx`.
No adivines, **copia lo de los tests**.

### Componentes

En `src/components/` algo así:

* `AuthUser.tsx`            → muestra info del usuario autenticado
* `NewPostForm.tsx`         → formulario para crear post
* `PostList.tsx`            → lista de posts
* `PostItem.tsx` (opcional) → un solo post
* `NewCommentForm.tsx`      → formulario nuevo comentario
* `CommentList.tsx`         → lista de comentarios

Pero otra vez: **nombres iguales a los que usen los tests**.
Si ves en el test:

```ts
import NewPost from "@/components/NewPost";
```

entonces el archivo se llama `NewPost.tsx`, no `NewPostForm.tsx`.

### Helpers de API

Algo tipo:

* `src/lib/api.ts`
  con funciones como:

```ts
export async function login(email: string, password: string) { ... }
export async function getPosts(token: string) { ... }
export async function createPost(token: string, data: NewPost) { ... }
export async function getPostWithComments(token: string, id: string) { ... }
export async function createComment(token: string, id: string, data: NewComment) { ... }
```

El nombre exacto del archivo también puede venir forzado por los tests.

---

## 4. Qué es lo **mínimo** que debe tener para “funcionar” (compilar y no morir)

### 4.1. Cada página nueva

Para que Next no se queje y los tests puedan importarla, cada `page.tsx` debe tener al menos:

```tsx
// src/app/login/page.tsx
"use client"; // si vas a usar hooks como useState, useEffect o useRouter

import React from "react";

export default function Page() {
  return (
    <main>
      <h1>Login</h1>
    </main>
  );
}
```

Cosas claves:

* `export default function Page()` o el nombre que esperen los tests
* En App Router, el archivo debe llamarse **`page.tsx` dentro de la carpeta de la ruta**.
* Si usas hooks (`useState`, `useEffect`, `useRouter`), pon `"use client"` al principio o revienta.

Ejemplo de dinámica:

```tsx
// src/app/posts/[id]/page.tsx
"use client";

type PostPageProps = {
  params: { id: string };
};

export default function Page({ params }: PostPageProps) {
  return (
    <main>
      <h1>Detalle del post {params.id}</h1>
    </main>
  );
}
```

Con esto al menos:

* la ruta existe
* los tests pueden hacer `render(<Page ... />)` sin que reviente

### 4.2. Cada componente nuevo

Mismo cuento:

```tsx
// src/components/PostList.tsx
import React from "react";

type Post = { id: string; content: string };

type Props = {
  posts: Post[];
};

export default function PostList({ posts }: Props) {
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.content}</article>
      ))}
    </div>
  );
}
```

Mientras tenga:

* export default o named export como pidan los tests
* props con los nombres que esperan
* algo renderizable

los tests ya lo pueden montar.

---

## 5. Flujo mínimo de funcionalidad que debes implementar

Resumiendo lo más agresivo y directo:

### 5.1 Login

En `src/app/login/page.tsx`:

* `"use client";`
* `form` con inputs:

  * email/username
  * password
* botón con el texto que digan los tests (“Login”, “Iniciar sesión”…)
* `onSubmit`:

  * `preventDefault`
  * `fetch` al endpoint de login
  * si responde OK:

    * guardar token en `localStorage` (`localStorage.setItem("token", token)`)
    * redirigir a `/feed` con `useRouter().push("/feed")`

### 5.2 Feed

En `src/app/feed/page.tsx`:

* `"use client";`
* leer token desde `localStorage` en un `useEffect`
* si no hay token → redirigir a `/login`
* si hay token:

  * `useEffect` que haga `GET /posts`
  * guardar posts en `useState`
* render:

  * componente de usuario autenticado (`<AuthUser ... />`)
  * formulario para crear post (`<NewPostForm ... />`, con `POST /posts` y actualizar lista)
  * `<PostList posts={posts} />` con cada post linkeado a `/posts/[id]`

### 5.3 Detalle de comentarios

En `src/app/posts/[id]/page.tsx`:

* `"use client";`
* leer `params.id`
* leer token
* `useEffect`:

  * `GET /posts/:id` o `/posts/:id/comments`
* render:

  * `<AuthUser ... />`
  * `<PostItem post={post} />`
  * `<NewCommentForm ... />` con `POST /posts/:id/comments`
  * `<CommentList comments={comments} />`

---

## 6. Orden recomendado durante el parcial

Para que no te ahogues:

1. `npm install` → `npm run dev` → `npm test`
2. Revisar `src/app/about`, `user`, `user/[id]` para copiar estructura.
3. Revisar tests y anotar:

   * rutas exactas
   * nombres de componentes y archivos
   * textos que buscan
4. Crear **solo las rutas que los tests exigen**:

   * ej. `login/page.tsx`, `feed/page.tsx`, `posts/[id]/page.tsx`
     con componentes mínimos que ya compilen.
5. Volver a `npm test` → ir implementando funcionalidad de login/feeds/comentarios en ese orden.
6. Cada cambio importante → `npm test` otra vez.

Si sigues eso, aunque el profe se ponga creativo, no deberías salir del parcial en modo “no compila nada”. Te toca sudar el código tú, pero por lo menos ya sabes qué tocar y en qué orden.
