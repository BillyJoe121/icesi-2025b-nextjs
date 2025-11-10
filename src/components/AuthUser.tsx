// src/components/AuthUser.tsx
//
// COMPONENTE DE PRESENTACIÓN DEL USUARIO AUTENTICADO.
//
// ¿Qué hace?
// - Lee el usuario actual desde el store global de autenticación (useAuthStore).
// - Si hay usuario logueado: muestra nombre y correo.
// - Si NO hay usuario: muestra un mensaje neutro "Usuario no autenticado".
//
// ¿Quién lo usa?
// - FeedPage: arriba del feed, para mostrar quién está logueado.
// - PostDetailPage: arriba del detalle de post, por la misma razón.
//
// ¿Con qué se conecta?
// - useAuthStore de src/store/authStore.ts

"use client";
// 'use client' porque usamos hooks (zustand) en este componente.

import { useAuthStore } from "@/store/authStore";

export default function AuthUser() {
  // Leemos 'user' del store global de auth (puede ser un objeto o null)
  const user = useAuthStore((state) => state.user);

  // Si no hay usuario, mostramos algo neutro.
  // En un parcial real podría ser un skeleton o un texto tipo "No autenticado".
  if (!user) {
    return (
      <section className="border-b p-4 mb-4">
        <p className="text-sm text-gray-500">
          Usuario no autenticado
        </p>
      </section>
    );
  }

  // Si sí hay usuario, mostramos su nombre y correo.
  return (
    <section className="border-b p-4 mb-4 flex flex-col gap-1">
      <p className="text-sm text-gray-500">Sesión iniciada como:</p>
      <p className="font-semibold">
        {user.name}{" "}
        <span className="text-gray-500 text-xs">
          ({user.email})
        </span>
      </p>
    </section>
  );
}
