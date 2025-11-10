// src/store/authStore.ts
//
// ESTE ES EL STORE GLOBAL DE AUTENTICACIÓN usando Zustand.
//
// Responsabilidad:
// - Guardar el token de autenticación y el usuario actual.
// - Exponer funciones para:
//     * setAuth(token, user): guardar credenciales al hacer login.
//     * logout(): limpiar estado y localStorage.
//     * hydrateFromStorage(): leer token/usuario guardados en localStorage.
//
// ¿Quién usa este store?
// - LoginPage:
//     * setAuth(...) → cuando el login es exitoso.
//     * token        → para ver si ya está logueado y redirigir a /feed.
//     * hydrateFromStorage().
// - FeedPage:
//     * token        → para llamadas a getPostsApi y createPostApi.
//     * hydrateFromStorage().
// - PostDetailPage:
//     * token        → para getPostByIdApi, getCommentsByPostApi, createCommentApi.
//     * hydrateFromStorage().
// - AuthUser:
//     * user         → para mostrar nombre/correo.
// - NewPostForm y NewCommentForm:
//     * token        → para poder llamar a la API.
//
// En cualquier componente cliente puedes hacer:
//   const { token, user, setAuth, logout, hydrateFromStorage } = useAuthStore();

"use client";
// Esta línea indica que este módulo solo se usa en el cliente.
// Zustand utiliza hooks, así que cualquier componente que lo use
// también debe estar marcado con "use client".

import { create } from "zustand";
import type { User } from "@/lib/types";

// Definimos la forma del estado de autenticación.
interface AuthState {
    token: string | null;              // token JWT o similar (si no hay, es null)
    user: User | null;                 // información del usuario actual
    setAuth: (token: string, user: User) => void; // establece token + usuario
    logout: () => void;                            // limpia token + usuario
    hydrateFromStorage: () => void;                // intenta leer desde localStorage
}

// Store global de autenticación.
// 'useAuthStore' es un hook que permite leer y actualizar este estado
// desde cualquier componente cliente.
export const useAuthStore = create<AuthState>((set) => ({
    // Estado inicial: no hay token ni usuario
    token: null,
    user: null,

    // setAuth:
    // - Actualiza el estado en memoria con el token y el usuario.
    // - Guarda estos datos en localStorage para que persistan
    //   aunque el usuario recargue la página.
    setAuth: (token, user) => {
        // Actualizar estado en memoria
        set({ token, user });

        // Guardar en localStorage para persistencia básica
        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
        }
    },

    // logout:
    // - Limpia el estado (token y usuario a null).
    // - Borra los datos guardados en localStorage.
    logout: () => {
        set({ token: null, user: null });

        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },

    // hydrateFromStorage:
    // - Intenta leer token y usuario previamente guardados en localStorage.
    // - Si se encuentran y se pueden parsear correctamente, los coloca en el estado.
    // - Si hay problema al parsear, limpia localStorage.
    //
    // ¿Cuándo se llama?
    // - Al montar páginas como LoginPage, FeedPage, PostDetailPage,
    //   para restaurar la sesión si el usuario ya se había logueado.
    hydrateFromStorage: () => {
        // En servidor (SSR) no existe window ni localStorage, así que salimos.
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        // Si encontramos token y usuario guardado, intentamos parsear.
        if (token && userStr) {
            try {
                const user: User = JSON.parse(userStr);
                set({ token, user });
            } catch {
                // Si algo sale mal parseando, limpiamos por seguridad.
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
    },
}));
