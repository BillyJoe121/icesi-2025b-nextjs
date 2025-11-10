// src/components/EventList.tsx
"use client";

/**
 * LISTA DE EVENTOS
 *
 * Recibe un arreglo de eventos y los renderiza usando EventItem.
 * Puede recibir, si quieres, un mapa de "eventId → #participantes".
 */

import type { Event } from "@/lib/types";
import EventItem from "./EventItem";

interface EventListProps {
    events: Event[];
    participantsByEventId?: Record<string, number>;
}

export default function EventList({ events, participantsByEventId }: EventListProps) {
    if (!events.length) {
        return <p className="text-sm text-gray-500">No hay eventos todavía.</p>;
    }

    return (
        <section className="mt-4">
            {events.map((event) => (
                <EventItem
                    key={event.eventId}
                    event={event}
                    participantsCount={
                        participantsByEventId?.[event.eventId] ?? undefined
                    }
                />
            ))}
        </section>
    );
}
