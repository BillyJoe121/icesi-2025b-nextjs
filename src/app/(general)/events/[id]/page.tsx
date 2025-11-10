// src/app/(general)/events/[id]/page.tsx
"use client";

/**
 * PÁGINA DE DETALLE DE EVENTO
 * Ruta: /events/[id]
 *
 * Responsabilidades:
 * - Leer eventId desde la URL.
 * - Verificar autenticación (token).
 * - Cargar detalle del evento (GET /events/{id}).
 * - Cargar inscripciones a ese evento (GET /registrations?eventId=...).
 * - Mostrar botón para inscribirse si el usuario no está inscrito todavía.
 * - (Opcional) Permitir editar/eliminar evento si el usuario es el creador.
 *
 * Conexiones:
 * - useAuthStore: token + usuario.
 * - getEventByIdApi: obtener info del evento.
 * - getRegistrationsByEventApi: obtener inscripciones del evento.
 * - createRegistrationApi: inscribir al usuario.
 * - (luego) updateEventApi / deleteEventApi para CRUD completo.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import {
  getEventByIdApi,
  getRegistrationsByEventApi,
  createRegistrationApi,
} from "@/lib/api";

import type { Event, Registration } from "@/lib/types";

import AuthUser from "@/components/AuthUser";
import EventItem from "@/components/EventItem";
import RegisterButton from "@/components/RegisterButton";

interface EventDetailPageProps {
  params: {
    id: string; // eventId como string
  };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();

  const { token, user, hydrateFromStorage } = useAuthStore((state) => ({
    token: state.token,
    user: state.user,
    hydrateFromStorage: state.hydrateFromStorage,
  }));

  // Estado para el evento
  const [event, setEvent] = useState<Event | null>(null);
  // Estado para las inscripciones de este evento
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id;

  // 1) Hidratar auth al montar
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // 2) Si después de hidratar no hay token, redirigimos a login
  useEffect(() => {
    if (token === null) {
      router.replace("/login");
    }
  }, [token, router]);

  // 3) Cargar evento + inscripciones cuando tenemos token
  useEffect(() => {
    if (!token) return;

    async function loadData(currentToken: string) {
      try {
        setLoading(true);
        setError(null);

        // Pedimos en paralelo:
        // - detalle del evento
        // - inscripciones de ese evento
        const [eventData, registrationsData] = await Promise.all([
          getEventByIdApi(currentToken, eventId),
          getRegistrationsByEventApi(currentToken, eventId),
        ]);

        setEvent(eventData);
        setRegistrations(registrationsData);
      } catch {
        setError("No se pudo cargar el evento o sus inscripciones.");
      } finally {
        setLoading(false);
      }
    }

    loadData(token);
  }, [token, eventId]);

  // Calculamos si el usuario actual ya está inscrito
  const currentUserId = user?.userId;
  const isRegistered = !!(
    currentUserId &&
    registrations.some((reg) => reg.userId === currentUserId)
  );

  // Handler que se ejecuta cuando el usuario se inscribe exitosamente.
  function handleRegistered(newReg: Registration) {
    setRegistrations((prev) => [...prev, newReg]);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto py-6">
          <p className="text-sm text-gray-500">Cargando evento...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto py-6">
          <p className="text-sm text-red-600">
            {error ?? "Evento no encontrado."}
          </p>
        </div>
      </main>
    );
  }

  const participantsCount = registrations.length;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Detalle del evento</h1>

        <AuthUser />

        {/* Detalle del evento (reutilizamos EventItem como “card” principal) */}
        <EventItem event={event} participantsCount={participantsCount} />

        {/* Botón para unirse al evento */}
        <RegisterButton
          eventId={event.eventId}
          isRegistered={isRegistered}
          onRegistered={handleRegistered}
        />

        {/* Aquí podrías listar participantes si el backend expone sus datos */}
        <section className="mt-6">
          <h3 className="font-semibold mb-2 text-sm">
            Total de participantes: {participantsCount}
          </h3>
          {/* Podrías mostrar nombres si el backend da info de usuario */}
        </section>
      </div>
    </main>
  );
}
