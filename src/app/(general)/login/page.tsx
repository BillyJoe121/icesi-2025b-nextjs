// src/app/(general)/login/page.tsx
//
// PÁGINA DE LOGIN
// Ruta: /login
//
// Responsabilidades en este proyecto de EVENTOS:
//  - Mostrar formulario de email + contraseña.
//  - Enviar credenciales a la API (loginApi → POST /login).
//  - Guardar token y usuario en el store global (useAuthStore).
//  - Redirigir a /events si el login es exitoso.
//  - Si ya hay token (usuario logueado), redirigir automáticamente a /events.
//
// Conexiones:
//  - loginApi (src/lib/api.ts): hace la llamada real al backend.
//  - useAuthStore (src/store/authStore.ts): guarda token + user (con userId, name, email, city).
//  - Luego /events usará ese token para cargar eventos.

"use client";
// Página cliente porque usamos hooks y router.

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Función de API que hace la petición POST /login al backend.
import { loginApi } from "@/lib/api";

// Store global de autenticación: guarda token y usuario.
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  // Hook para navegar/redirigir programáticamente
  const router = useRouter();

  // Obtenemos del store:
  // - token: token actual (string | null)
  // - setAuth: función que guarda token + user en el store y en localStorage
  // - hydrateFromStorage: intenta recuperar auth desde localStorage al entrar a la página
  const { token, setAuth, hydrateFromStorage } = useAuthStore((state) => ({
    token: state.token,
    setAuth: state.setAuth,
    hydrateFromStorage: state.hydrateFromStorage,
  }));

  // Estado local del formulario de login
  const [email, setEmail] = useState("");                  // valor del input de correo
  const [password, setPassword] = useState("");            // valor del input de contraseña
  const [error, setError] = useState<string | null>(null); // mensaje de error para mostrar en pantalla
  const [loading, setLoading] = useState(false);           // indica si estamos enviando la petición al servidor

  // 1) Al montar la página, intentamos hidratar token/usuario desde localStorage.
  //    Esto es útil si el usuario ya se había logueado en otra sesión.
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // 2) Si ya hay token (usuario autenticado), no tiene sentido ver el login,
  //    así que lo redirigimos automáticamente a la LISTA DE EVENTOS (/events).
  useEffect(() => {
    if (token) {
      router.replace("/events");
    }
  }, [token, router]);

  // Manejador del submit del formulario de login
  async function handleSubmit(e: FormEvent) {
    // Previene que el formulario recargue la página
    e.preventDefault();
    // Limpiamos el error anterior (si lo había)
    setError(null);

    // Validación básica: no aceptar campos vacíos o solo espacios
    if (!email.trim() || !password.trim()) {
      setError("Correo y contraseña son obligatorios.");
      return;
    }

    try {
      setLoading(true);

      // Llamamos a la API de login, enviando email y password.
      // loginApi devuelve { token, user } tipados según src/lib/types.ts.
      const { token: newToken, user } = await loginApi(email, password);

      // Guardamos token y usuario en el store global y en localStorage.
      // Después, cualquier página (EventsPage, EventDetailPage, ProfilePage)
      // podrá leer este token/usuario.
      setAuth(newToken, user);

      // Redirigimos a /events una vez logueados correctamente.
      // Esa página será el “home” de la app: listado de eventos.
      router.push("/events");
    } catch {
      // Si la API devuelve error (credenciales inválidas, etc.)
      setError("Credenciales inválidas o error en el servidor.");
    } finally {
      // Quitamos el estado de carga independientemente del resultado
      setLoading(false);
    }
  }

  // Render de la página de login
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Tarjeta central con el formulario */}
      <section className="bg-white border rounded-md p-6 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>

        {/* Formulario de login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Campo de correo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm">Correo</label>
            <input
              type="email"
              placeholder="tu.correo@ejemplo.com"
              className="border rounded px-2 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campo de contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-sm">Contraseña</label>
            <input
              type="password"
              placeholder="********"
              className="border rounded px-2 py-1 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Mensaje de error si algo salió mal */}
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Botón de enviar el formulario */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white text-sm px-3 py-2 rounded mt-2 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
