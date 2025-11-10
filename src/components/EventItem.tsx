// src/components/EventItem.tsx
"use client";

/**
 * CARD DE EVENTO
 *
 * Muestra un evento individual:
 * - nombre, descripción corta, ciudad, fecha
 * - número de participantes (si se pasa por props)
 * - link a la página de detalle /events/[eventId]
 */

import Link from "next/link";
import type { Event } from "@/lib/types";

interface EventItemProps {
    event: Event;
    participantsCount?: number;
}

export default function EventItem({ event, participantsCount }: EventItemProps) {
    return (
        <article className="border rounded-md p-3 mb-3 bg-white">
            <h3 className="font-semibold mb-1">
                <Link href={`/events/${event.eventId}`} className="hover:underline">
                    {event.name}
                </Link>
            </h3>

            <p className="text-sm mb-1">{event.description}</p>

            <p className="text-xs text-gray-600 mb-1">
                Ciudad: {event.city}
            </p>

            <p className="text-xs text-gray-600 mb-1">
                Fecha: {event.date}
            </p>

            {typeof participantsCount === "number" && (
                <p className="text-xs text-gray-700">
                    Participantes: {participantsCount}
                </p>
            )}
        </article>
    );
}
