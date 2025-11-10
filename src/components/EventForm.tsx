// src/components/EventForm.tsx
"use client";

/**
 * FORMULARIO DE EVENTO (CREAR / EDITAR)
 *
 * Se puede usar en modo:
 * - crear: sin initialEvent → hace POST /events
 * - editar: con initialEvent → hace PUT /events/{id}
 *
 * Props:
 * - initialEvent?: Event   → datos para edición (opcional).
 * - onEventSaved?: (event: Event) => void → se llama cuando la API responde OK.
 */

import { FormEvent, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { createEventApi, updateEventApi } from "@/lib/api";
import type { Event } from "@/lib/types";

interface EventFormProps {
    initialEvent?: Event;
    onEventSaved?: (event: Event) => void;
}

export default function EventForm({ initialEvent, onEventSaved }: EventFormProps) {
    const { token } = useAuthStore((state) => ({
        token: state.token,
    }));

    // Estado local de los campos.
    const [name, setName] = useState(initialEvent?.name ?? "");
    const [description, setDescription] = useState(initialEvent?.description ?? "");
    const [date, setDate] = useState(
        initialEvent ? initialEvent.date.slice(0, 16) : "" // si viene ISO, recortamos para input datetime-local
    );
    const [city, setCity] = useState(initialEvent?.city ?? "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!initialEvent;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError("No hay token de autenticación.");
            return;
        }

        if (!name.trim() || !description.trim() || !date.trim() || !city.trim()) {
            setError("Todos los campos del evento son obligatorios.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name,
                description,
                // Para el parcial, la fecha se maneja como string.
                // Ajusta el formato si el backend espera ISO completo.
                date,
                city,
            };

            let savedEvent: Event;

            if (isEditMode && initialEvent) {
                // PUT /events/{id}
                savedEvent = await updateEventApi(token, initialEvent.eventId, payload);
            } else {
                // POST /events
                savedEvent = await createEventApi(token, payload);
            }

            onEventSaved?.(savedEvent);

            if (!isEditMode) {
                // Si es creación, limpiamos el formulario
                setName("");
                setDescription("");
                setDate("");
                setCity("");
            }
        } catch {
            setError("No se pudo guardar el evento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="border rounded-md p-4 mb-4 bg-white">
            <h2 className="font-semibold mb-2">
                {isEditMode ? "Editar evento" : "Crear nuevo evento"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-sm">Nombre</label>
                    <input
                        className="border rounded px-2 py-1 text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm">Descripción</label>
                    <textarea
                        className="border rounded px-2 py-1 text-sm min-h-[60px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm">Fecha</label>
                    <input
                        type="datetime-local"
                        className="border rounded px-2 py-1 text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
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

                {error && (
                    <p className="text-xs text-red-600">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-60 mt-1"
                >
                    {loading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Crear evento"}
                </button>
            </form>
        </section>
    );
}
