// src/app/(general)/events/page.tsx
"use client";

/**
 * PÁGINA PRINCIPAL DE EVENTOS
 * Ruta: /events
 *
 * Responsabilidades:
 * - Verificar que el usuario esté autenticado (leer token desde authStore).
 * - Cargar la lista de eventos desde la API (GET /events).
 * - Mostrar filtros por ciudad y fecha.
 * - Mostrar lista de eventos con número de participantes.
 * - Mostrar formulario para crear nuevo evento.
 *
 * Conexiones:
 * - useAuthStore: para token y hydrateFromStorage().
 * - getEventsApi: para obtener eventos.
 * - AuthUser: para mostrar info del usuario logueado.
 * - EventForm: para crear un evento.
 * - EventFilters: para cambiar filtros.
 * - EventList: para renderizar la lista de eventos filtrados.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";
import { getEventsApi } from "@/lib/api";
import type { Event } from "@/lib/types";

import AuthUser from "@/components/AuthUser";
import EventForm from "@/components/EventForm";
import EventFilters from "@/components/EventFilters";
import EventList from "@/components/EventList";

export default function EventsPage() {
  const router = useRouter();

  // Leemos token y función para hidratar desde localStorage
  const { token, hydrateFromStorage } = useAuthStore((state) => ({
    token: state.token,
    hydrateFromStorage: state.hydrateFromStorage,
  }));

  // Lista completa de eventos tal como viene de la API
  const [events, setEvents] = useState<Event[]>([]);

  // Filtros
  const [cityFilter, setCityFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>(""); // puedes usar YYYY-MM-DD

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Al montar, intentamos hidratar sesión desde localStorage
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // 2) Si no hay token después de hidratar, mandamos a login
  useEffect(() => {
    if (token === null) {
      router.replace("/login");
    }
  }, [token, router]);

  // 3) Cargar eventos cuando tengamos token
  useEffect(() => {
    if (!token) return;

    async function loadEvents(currentToken: string) {
      try {
        setLoading(true);
        setError(null);

        // Llamada a la API: GET /events
        const data = await getEventsApi(currentToken);
        setEvents(data);
      } catch {
        setError("No se pudieron cargar los eventos.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents(token);
  }, [token]);

  // Handler que se pasa a EventForm.
  // Cuando se crea un evento nuevo, lo agregamos al estado.
  function handleEventCreated(newEvent: Event) {
    setEvents((prev) => [newEvent, ...prev]);
  }

  // Handler que se pasa a EventFilters.
  // Actualiza filtros de ciudad y fecha.
  function handleFilterChange(filters: { city: string; date: string }) {
    setCityFilter(filters.city);
    setDateFilter(filters.date);
  }

  // Aplicamos filtros sobre la lista completa de eventos.
  const filteredEvents = events.filter((event) => {
    const matchesCity =
      !cityFilter || event.city.toLowerCase() === cityFilter.toLowerCase();

    // Supongamos que dateFilter viene como "YYYY-MM-DD"
    // y event.date es un string tipo ISO. Hacemos comparación por "empieza con".
    const matchesDate =
      !dateFilter || event.date.startsWith(dateFilter);

    return matchesCity && matchesDate;
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Eventos</h1>

        {/* Información del usuario autenticado */}
        <AuthUser />

        {/* Formulario para crear un nuevo evento */}
        <EventForm onEventSaved={handleEventCreated} />

        {/* Filtros por ciudad y fecha */}
        <EventFilters
          city={cityFilter}
          date={dateFilter}
          onChange={handleFilterChange}
        />

        {/* Estados de carga y error */}
        {loading && (
          <p className="text-sm text-gray-500 mt-2">Cargando eventos...</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        )}

        {/* Lista de eventos filtrados */}
        {!loading && !error && (
          <EventList events={filteredEvents} />
        )}
      </div>
    </main>
  );
}
