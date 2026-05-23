'use client';

import { Proyecto } from '@/types';
import { useState } from 'react';
import { useTenant } from '@/lib/TenantProvider';

interface HeaderProps {
  projects: Proyecto[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
}

export function Header({ projects, selectedProjectId, onProjectChange }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const current = projects.find((p) => p.id === selectedProjectId);
  const { tenant } = useTenant();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ backgroundColor: 'var(--color-map-bg)' }}>
      <div className="flex items-center gap-3">
        <img
          src={tenant.assets.logoUrl}
          alt={tenant.companyName}
          className="h-8 w-8 rounded-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          {tenant.companyName}
        </span>
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
        >
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{current?.nombre ?? 'Seleccionar proyecto'}</span>
          <svg className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white py-1 shadow-xl">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onProjectChange(p.id);
                    setOpen(false);
                  }}
                  className={`w-full px-5 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 ${
                    p.id === selectedProjectId
                      ? 'font-semibold'
                      : 'text-gray-700'
                  }`}
                  style={p.id === selectedProjectId ? { color: 'var(--color-primary)' } : undefined}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-1 justify-end">
        <button className="rounded-full border border-gray-300 bg-white p-2.5 text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-700 hover:shadow-md transition-all">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
