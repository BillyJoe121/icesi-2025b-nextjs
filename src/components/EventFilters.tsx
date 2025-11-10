// src/components/EventFilters.tsx
"use client";

/**
 * FILTROS PARA LISTA DE EVENTOS
 *
 * - Filtro por ciudad
 * - Filtro por fecha (YYYY-MM-DD)
 *
 * No hace la lógica de filtrado; simplemente notifica al padre vía onChange().
 */

interface EventFiltersProps {
    city: string;
    date: string;
    onChange: (filters: { city: string; date: string }) => void;
}

export default function EventFilters({ city, date, onChange }: EventFiltersProps) {
    function handleCityChange(value: string) {
        onChange({ city: value, date });
    }

    function handleDateChange(value: string) {
        onChange({ city, date: value });
    }

    return (
        <section className="border rounded-md p-3 mb-4 bg-white flex flex-col gap-3">
            <h2 className="font-semibold text-sm">Filtros de eventos</h2>

            <div className="flex flex-col gap-1">
                <label className="text-xs">Ciudad</label>
                <input
                    className="border rounded px-2 py-1 text-sm"
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    placeholder="Ej: Bogotá"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs">Fecha</label>
                <input
                    type="date"
                    className="border rounded px-2 py-1 text-sm"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                />
            </div>
        </section>
    );
}
