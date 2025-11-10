// ESTE ES EL LAYOUT DEL GRUPO DE RUTAS (general)
//
// Estructura de Next:
//   - app/layout.tsx                → layout raíz de TODA la app
//   - app/(general)/layout.tsx      → layout específico para el "route group" (general)
//
// Todo lo que esté dentro de la carpeta app/(general)/
// se va a renderizar dentro de ESTE layout.
//
// Es decir, páginas como:
//   - app/(general)/login/page.tsx
//   - app/(general)/feed/page.tsx
//   - app/(general)/posts/[id]/page.tsx
// aparecerán envueltas por este layout.
//
// Responsabilidad de este archivo:
//   - Definir metadata de esta sección
//   - Envolver las páginas con providers necesarios (ej: CounterStoreProvider)
//   - Mostrar la barra de navegación (NavBar) que aparecerá en todas las páginas
//   - Renderizar {children}, que es la página concreta.

import { NavBar } from "@/components/nav-bar/NavBar";
// NavBar: componente que probablemente hizo el profe.
// Ruta típica: src/components/nav-bar/NavBar.tsx
// Se muestra en todas las páginas de (general).

import { CounterStoreProvider } from "../providers/counter-store-provider";
// CounterStoreProvider: provider que envuelve el árbol de React
// para que cualquier página dentro de (general) pueda usar un store de contador.
// Es algo de ejemplo del profe; no afecta directamente a login/feed/posts,
// pero sí sirve de plantilla para ver cómo envolver con providers.

// Metadata específica para este grupo de rutas.
export const metadata = {
  title: "General",
  description: "Paginas con autenticación",
};

// Componente de layout. Recibe 'children':
//   - 'children' es la página concreta que se esté renderizando.
//   - Por ejemplo, si visitas /feed, 'children' será <FeedPage />.
//   - Si visitas /login, 'children' será <LoginPage />.
export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Envolvemos todo con CounterStoreProvider para que los componentes dentro
    // puedan usar el contexto/store de contador si lo necesitan.
    <CounterStoreProvider>
      {/* La barra de navegación se muestra siempre en la parte superior */}
      <NavBar />

      {/* Título fijo que se verá en todas las páginas del grupo (general).
          Es solo un ejemplo; podrías quitarlo en el parcial real. */}
      <h1>Hello Root and MetaData</h1>

      {/* Aquí se inserta el contenido específico de cada ruta:
          - FeedPage
          - LoginPage
          - PostDetailPage
          etc. */}
      {children}
    </CounterStoreProvider>
  );
}
