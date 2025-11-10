// src/app/(general)/layout.tsx
//
// LAYOUT DEL GRUPO (general)
//
// Todas las rutas dentro de app/(general)/... se renderizan dentro de este layout.
// Ejemplos:
//   - /login
//   - /events
//   - /events/[id]
//   - /profile
//   - /users/new
//
// Responsabilidad:
// - Definir un "marco" visual común para estas páginas.
// - (Opcional) Mostrar un navbar simple con enlaces básicos.
//
// Importante:
// - NO metemos lógica de autenticación aquí; esa vive en cada página
//   usando useAuthStore y redirecciones.
// - Este layout es un Server Component (no usamos hooks), por eso NO lleva "use client".

import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Zona general",
  description: "Páginas principales con autenticación",
};

export default function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100">
        {/* Navbar muy simple, suficiente para navegar en el parcial */}
        <header className="bg-white border-b mb-4">
          <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-sm">
              Gestor de eventos
            </div>
            <div className="flex gap-3 text-sm">
              <Link href="/events" className="hover:underline">
                Eventos
              </Link>
              <Link href="/profile" className="hover:underline">
                Perfil
              </Link>
              <Link href="/users/new" className="hover:underline">
                Nuevo usuario
              </Link>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </div>
          </nav>
        </header>

        {/* Contenido específico de cada página */}
        <div className="max-w-4xl mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
