// src/components/AuthUser.tsx
"use client";

/**
 * COMPONENTE: AuthUser
 *
 * Responsabilidad:
 * - Leer el usuario autenticado desde el store global (useAuthStore).
 * - Mostrar su información básica: nombre, email, ciudad, userId.
 * - Si no hay usuario (no logueado o no hidratado todavía), mostrar un texto neutro.
 *
 * ¿Quién lo usa?
 * - EventsPage (/events): arriba del listado de eventos.
 * - EventDetailPage (/events/[id]): arriba del detalle del evento.
 * - (Opcional) ProfilePage: podrías reutilizarlo, aunque ahí ya mostramos más detalle.
 */

import { useAuthStore } from "@/store/authStore";

export default function AuthUser() {
  // Leemos user del store global de auth
  const user = useAuthStore((state) => state.user);

  // Si no hay usuario, mostramos algo neutro.
  if (!user) {
    return (
      <section className="border-b p-4 mb-4 bg-white">
        <p className="text-sm text-gray-500">
          Usuario no autenticado.
        </p>
      </section>
    );
  }

  return (
    <section className="border-b p-4 mb-4 bg-white flex flex-col gap-1">
      <p className="text-sm text-gray-500">Sesión iniciada como:</p>
      <p className="font-semibold text-sm">
        {user.name}
      </p>
      <p className="text-xs text-gray-600">
        Email: {user.email}
      </p>
      <p className="text-xs text-gray-600">
        Ciudad: {user.city}
      </p>
      <p className="text-[11px] text-gray-400">
        ID de usuario: {user.userId}
      </p>
    </section>
  );
}
