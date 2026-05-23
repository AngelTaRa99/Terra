'use client';

import { Terreno, TerrenoEstado } from '@/types';
import { ContactForm } from './ContactForm';
import { useTenant } from '@/lib/TenantProvider';

interface TerrainSidebarProps {
  terreno: Terreno | null;
  isLoggedIn: boolean;
  onClose: () => void;
  onEstadoChange?: (id: string, estado: TerrenoEstado) => void;
  visitaEndTimes?: Record<string, number>;
}

const ESTADO_LABEL: Record<TerrenoEstado, string> = {
  libre: 'Libre',
  en_visita: 'En visita',
  apartado: 'Apartado',
  vendido: 'Vendido',
};

const ESTADO_COLOR: Record<TerrenoEstado, string> = {
  libre: 'bg-green-100 text-green-800',
  en_visita: 'bg-yellow-100 text-yellow-800',
  apartado: 'bg-orange-100 text-orange-800',
  vendido: 'bg-green-100 text-green-800',
};

export function TerrainSidebar({
  terreno,
  isLoggedIn,
  onClose,
  onEstadoChange,
  visitaEndTimes = {},
}: TerrainSidebarProps) {
  const { tenant } = useTenant();

  if (!terreno) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-30">
      <div className="h-full w-80 overflow-y-auto border border-gray-200 bg-white p-6 shadow-xl rounded-l-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
            {terreno.id_terreno}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_COLOR[terreno.estado]}`}
          >
            {ESTADO_LABEL[terreno.estado]}
          </span>
          {terreno.estado === 'en_visita' && visitaEndTimes[terreno.id_terreno] && (
            <span className="text-xs font-mono text-gray-400">
              {Math.max(0, Math.ceil((visitaEndTimes[terreno.id_terreno] - Date.now()) / 1000))}s
            </span>
          )}
        </div>

        <div className="mt-5 space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium">Área</span>
            <span>{terreno.area_m2.toLocaleString()} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Perímetro</span>
            <span>{terreno.perimetro} m</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Precio m²</span>
            <span>${terreno.precio_metro_cuadrado.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Precio total</span>
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              ${(terreno.area_m2 * terreno.precio_metro_cuadrado).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Medidas de los lados
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {terreno.medidas_lados.map((m, i) => (
              <li key={i} className="flex justify-between">
                <span>Lado {i + 1}</span>
                <span>{m} m</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Ubicación
          </h4>
          <p className="text-sm text-gray-600">
            {terreno.ubicacion[0]?.lat.toFixed(5)}, {terreno.ubicacion[0]?.lng.toFixed(5)}
          </p>
        </div>

        <hr className="my-5 border-gray-200" />

        {isLoggedIn ? (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cambiar estado
            </label>
            <select
              value={terreno.estado}
              onChange={(e) =>
                onEstadoChange?.(terreno.id_terreno, e.target.value as TerrenoEstado)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: 'var(--color-primary)' }}
            >
              <option value="libre">Libre</option>
              <option value="en_visita">En visita</option>
              <option value="apartado">Apartado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        ) : (
          <ContactForm contactEmail={tenant.contactFormEmail} />
        )}
      </div>
    </div>
  );
}
