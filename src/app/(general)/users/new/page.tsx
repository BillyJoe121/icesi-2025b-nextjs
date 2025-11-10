// src/app/(general)/users/new/page.tsx
"use client";

/**
 * PÁGINA PARA CREAR NUEVOS USUARIOS
 * Ruta: /users/new  (o la que definas)
 *
 * Requisito del parcial:
 * - "Un usuario debe ser creado por otro usuario."
 *
 * Responsabilidades:
 * - Mostrar formulario con: name, email, city, password.
 * - Enviar datos a la API (POST /users).
 * - Requiere que el usuario que crea esté autenticado.
 */

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";
import { createUserApi } from "@/lib/api";

export default function NewUserPage() {
    const router = useRouter();

    const { token, hydrateFromStorage } = useAuthStore((state) => ({
        token: state.token,
        hydrateFromStorage: state.hydrateFromStorage,
    }));

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        hydrateFromStorage();
    }, [hydrateFromStorage]);

    useEffect(() => {
        if (token === null) {
            router.replace("/login");
        }
    }, [token, router]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!token) {
            setError("No hay token de autenticación.");
            return;
        }

        if (!name.trim() || !email.trim() || !city.trim() || !password.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        try {
            setLoading(true);
            await createUserApi(token, { name, email, city, password });

            setSuccessMsg("Usuario creado exitosamente.");
            setName("");
            setEmail("");
            setCity("");
            setPassword("");
        } catch {
            setError("No se pudo crear el usuario.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-md mx-auto py-6">
                <h1 className="text-2xl font-bold mb-4">Crear nuevo usuario</h1>

                <form onSubmit={handleSubmit} className="bg-white p-4 border rounded-md flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Nombre</label>
                        <input
                            className="border rounded px-2 py-1 text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Email</label>
                        <input
                            type="email"
                            className="border rounded px-2 py-1 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Ciudad</label>
                        <input
                            className="border rounded px-2 py-1 text-sm"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Contraseña</label>
                        <input
                            type="password"
                            className="border rounded px-2 py-1 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-600">
                            {error}
                        </p>
                    )}

                    {successMsg && (
                        <p className="text-xs text-green-600">
                            {successMsg}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white text-sm px-3 py-2 rounded disabled:opacity-60"
                    >
                        {loading ? "Creando..." : "Crear usuario"}
                    </button>
                </form>
            </div>
        </main>
    );
}
