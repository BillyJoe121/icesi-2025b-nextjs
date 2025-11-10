// src/app/(general)/profile/page.tsx
"use client";

/**
 * PÁGINA DE PERFIL DE USUARIO
 * Ruta: /profile
 *
 * Responsabilidades:
 * - Mostrar los datos básicos del usuario autenticado.
 * - Mostrar la lista de eventos a los que se ha inscrito ese usuario.
 *
 * Flujo:
 *  1. Lee token y user desde useAuthStore.
 *  2. Si no hay token → redirige a /login.
 *  3. Si hay token y user:
 *      - GET /registrations?userId=...  → inscripciones del usuario.
 *      - GET /events                    → todos los eventos.
 *  4. Cruza ambas listas para saber a qué eventos está inscrito el usuario.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";
import { getRegistrationsByUserApi, getEventsApi } from "@/lib/api";
import type { Event, Registration } from "@/lib/types";
import EventList from "@/components/EventList";

export default function ProfilePage() {
    const router = useRouter();

    // Leemos token, user y función de hidratación desde el store global
    const { token, user, hydrateFromStorage } = useAuthStore((state) => ({
        token: state.token,
        user: state.user,
        hydrateFromStorage: state.hydrateFromStorage,
    }));

    // Estado para inscripciones y eventos
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    // Estados de carga y error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1) Al montar, intentamos hidratar desde localStorage
    useEffect(() => {
        hydrateFromStorage();
    }, [hydrateFromStorage]);

    // 2) Si después de hidratar NO hay token, mandamos a /login
    useEffect(() => {
        if (token === null) {
            router.replace("/login");
        }
    }, [token, router]);

    // 3) Cuando tenemos token Y user, cargamos inscripciones + eventos
    //
    // Nota importante:
    //   - Aquí estaba el error de TypeScript: `user` es User | null.
    //   - Comprobamos `if (!token || !user) return;` y luego extraemos userId
    //     en una constante para que dentro de la función async NO sea nullable.
    useEffect(() => {
        if (!token || !user) return; // seguridad básica

        const userId = user.userId; // string, ya no puede ser null

        async function loadProfileData(currentToken: string, currentUserId: string) {
            try {
                setLoading(true);
                setError(null);

                // Pedimos en paralelo:
                //  - las inscripciones de este usuario
                //  - todos los eventos
                const [regData, eventsData] = await Promise.all([
                    getRegistrationsByUserApi(currentToken, currentUserId),
                    getEventsApi(currentToken),
                ]);

                setRegistrations(regData);
                setEvents(eventsData);
            } catch {
                setError("No se pudo cargar la información del perfil.");
            } finally {
                setLoading(false);
            }
        }

        loadProfileData(token, userId);
    }, [token, user]);

    // Construimos la lista de eventos a los que el usuario se ha unido
    const joinedEvents = events.filter((event) =>
        registrations.some((reg) => reg.eventId === event.eventId)
    );

    // Si por alguna razón no hay user (pero no redirigió aún), mostramos algo neutro
    if (!user) {
        return (
            <main className="min-h-screen bg-gray-100">
                <div className="max-w-2xl mx-auto py-6">
                    <p className="text-sm text-gray-500">
                        No hay usuario autenticado.
                    </p>
                </div>
            </main>
        );
    }

    // Render normal del perfil
    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-2xl mx-auto py-6">
                <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>

                {/* Datos básicos del usuario */}
                <section className="border rounded-md p-4 mb-4 bg-white">
                    <h2 className="font-semibold mb-2">Datos personales</h2>
                    <p>
                        <span className="font-medium">Nombre:</span> {user.name}
                    </p>
                    <p>
                        <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p>
                        <span className="font-medium">Ciudad:</span> {user.city}
                    </p>
                    <p>
                        <span className="font-medium">ID:</span> {user.userId}
                    </p>
                </section>

                {loading && (
                    <p className="text-sm text-gray-500">Cargando inscripciones...</p>
                )}

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                {/* Lista de eventos a los que se ha unido el usuario */}
                {!loading && !error && (
                    <section className="mt-4">
                        <h2 className="font-semibold mb-2">
                            Eventos a los que te has unido
                        </h2>

                        {joinedEvents.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                Aún no te has inscrito a ningún evento.
                            </p>
                        ) : (
                            <EventList events={joinedEvents} />
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
