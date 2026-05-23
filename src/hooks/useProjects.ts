'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Proyecto, Terreno, TerrenoEstado } from '@/types';
import { getSortedProjects, MOCK_PROYECTOS } from '@/lib/mockData';
import { fetchKmlAsProyecto } from '@/lib/kmlParser';

async function fetchEstadosFromDb(): Promise<Map<string, TerrenoEstado>> {
  try {
    const res = await fetch('/api/terrenos');
    if (!res.ok) return new Map();
    const proyectos: Proyecto[] = await res.json();
    const map = new Map<string, TerrenoEstado>();
    for (const p of proyectos) {
      for (const t of p.terrenos) {
        map.set(t.id_terreno, t.estado);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

async function patchEstado(id_terreno: string, proyecto_id: string, estado: TerrenoEstado) {
  await fetch('/api/terrenos', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_terreno, proyecto_id, estado }),
  });
}

const VISITA_TIMEOUT_MS = 6_000;

export function useProjects() {
  const [projects, setProjects] = useState<Proyecto[]>(() => getSortedProjects());
  const [kmlProject, setKmlProject] = useState<Proyecto | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    MOCK_PROYECTOS[0]?.id ?? ''
  );
  const [selectedTerrenoId, setSelectedTerrenoId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [visitaEndTimes, setVisitaEndTimes] = useState<Record<string, number>>({});
  const [, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    fetchEstadosFromDb().then((estados) => {
      if (estados.size === 0) return;
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          terrenos: p.terrenos.map((t) => ({
            ...t,
            estado: estados.get(t.id_terreno) ?? t.estado,
          })),
        }))
      );
    });
  }, []);

  useEffect(() => {
    setKmlProject(null);
    const p = projects.find((pr) => pr.id === selectedProjectId);
    if (p) {
      fetchKmlAsProyecto(p.archivo_kmz_url.replace(/\.kmz$/, '.kml'), p.id)
        .then((result) => {
          if (!result) return;
          const estados = projects
            .find((pr) => pr.id === selectedProjectId)
            ?.terrenos.reduce((acc, t) => {
              acc[t.id_terreno] = t.estado;
              return acc;
            }, {} as Record<string, TerrenoEstado>);
          if (estados) {
            result.terrenos = result.terrenos.map((t) => ({
              ...t,
              estado: estados[t.id_terreno] ?? t.estado,
            }));
          }
          setKmlProject(result);
        });
    }
  }, [selectedProjectId]);

  const clearVisitaTimer = useCallback((id_terreno: string) => {
    const existing = timersRef.current.get(id_terreno);
    if (existing) {
      clearTimeout(existing);
      timersRef.current.delete(id_terreno);
    }
    setVisitaEndTimes((prev) => {
      const next = { ...prev };
      delete next[id_terreno];
      return next;
    });
  }, []);

  const updateTerrenoEstado = useCallback((id_terreno: string, estado: TerrenoEstado) => {
    const p = projects.find((pr) => pr.id === selectedProjectId);
    if (!p) return;

    clearVisitaTimer(id_terreno);

    patchEstado(id_terreno, p.id, estado);

    setKmlProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        terrenos: prev.terrenos.map((t) =>
          t.id_terreno === id_terreno ? { ...t, estado } : t
        ),
      };
    });

    setProjects((prev) =>
      prev.map((pr) =>
        pr.id === selectedProjectId
          ? {
              ...pr,
              terrenos: pr.terrenos.map((t) =>
                t.id_terreno === id_terreno ? { ...t, estado } : t
              ),
            }
          : pr
      )
    );

    if (estado === 'en_visita') {
      const endAt = Date.now() + VISITA_TIMEOUT_MS;
      setVisitaEndTimes((prev) => ({ ...prev, [id_terreno]: endAt }));
      const timer = setTimeout(() => {
        patchEstado(id_terreno, p.id, 'libre');

        setKmlProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            terrenos: prev.terrenos.map((t) =>
              t.id_terreno === id_terreno ? { ...t, estado: 'libre' as TerrenoEstado } : t
            ),
          };
        });

        setProjects((prev) =>
          prev.map((pr) =>
            pr.id === selectedProjectId
              ? {
                  ...pr,
                  terrenos: pr.terrenos.map((t) =>
                    t.id_terreno === id_terreno ? { ...t, estado: 'libre' as TerrenoEstado } : t
                  ),
                }
              : pr
          )
        );

        timersRef.current.delete(id_terreno);
        setVisitaEndTimes((prev) => {
          const next = { ...prev };
          delete next[id_terreno];
          return next;
        });
      }, VISITA_TIMEOUT_MS);
      timersRef.current.set(id_terreno, timer);
    }
  }, [projects, selectedProjectId, clearVisitaTimer]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const currentProject = useMemo(
    () => kmlProject ?? projects.find((p) => p.id === selectedProjectId) ?? null,
    [kmlProject, projects, selectedProjectId]
  );

  const selectedTerreno = useMemo(
    () =>
      currentProject?.terrenos.find(
        (t) => t.id_terreno === selectedTerrenoId
      ) ?? null,
    [currentProject, selectedTerrenoId]
  );

  return {
    projects,
    currentProject,
    selectedProjectId,
    selectedTerreno,
    selectedTerrenoId,
    isLoggedIn,
    setSelectedProjectId,
    setSelectedTerrenoId,
    setIsLoggedIn,
    updateTerrenoEstado,
    visitaEndTimes,
  };
}
