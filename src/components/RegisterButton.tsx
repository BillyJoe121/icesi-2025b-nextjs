// src/components/RegisterButton.tsx
"use client";

/**
 * BOTÓN DE INSCRIPCIÓN A EVENTO
 *
 * Props:
 * - eventId: id del evento al que se quiere inscribir.
 * - isRegistered: boolean → si ya está inscrito, deshabilita el botón.
 * - onRegistered: callback cuando la inscripción es exitosa.
 *
 * Conexiones:
 * - useAuthStore: token y user.
 * - createRegistrationApi: POST /registrations
 */

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { createRegistrationApi } from "@/lib/api";
import type { Registration } from "@/lib/types";

interface RegisterButtonProps {
    eventId: string;
    isRegistered: boolean;
    onRegistered?: (reg: Registration) => void;
}

export default function RegisterButton({
    eventId,
    isRegistered,
    onRegistered,
}: RegisterButtonProps) {
    const { token, user } = useAuthStore((state) => ({
        token: state.token,
        user: state.user,
    }));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleClick() {
        setError(null);

        if (!token || !user) {
            setError("Debes iniciar sesión para inscribirte.");
            return;
        }

        if (isRegistered) {
            setError("Ya estás inscrito en este evento.");
            return;
        }

        try {
            setLoading(true);

            const newReg = await createRegistrationApi(token, {
                eventId,
                userId: user.userId,
            });

            onRegistered?.(newReg);
        } catch {
            setError("No se pudo registrar al evento.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mt-4">
            <button
                type="button"
                disabled={loading || isRegistered}
                onClick={handleClick}
                className="bg-green-600 text-white text-sm px-4 py-2 rounded disabled:opacity-60"
            >
                {isRegistered ? "Ya estás inscrito" : loading ? "Inscribiendo..." : "Unirme al evento"}
            </button>

            {error && (
                <p className="text-xs text-red-600 mt-1">
                    {error}
                </p>
            )}
        </section>
    );
}
