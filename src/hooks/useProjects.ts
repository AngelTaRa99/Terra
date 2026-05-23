'use client';

import { useState, useMemo, useEffect } from 'react';
import { Proyecto, Terreno } from '@/types';
import { getSortedProjects, MOCK_PROYECTOS } from '@/lib/mockData';
import { fetchKmlAsProyecto } from '@/lib/kmlParser';

export function useProjects() {
  const [projects] = useState<Proyecto[]>(() => getSortedProjects());
  const [kmlProject, setKmlProject] = useState<Proyecto | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    MOCK_PROYECTOS[0]?.id ?? ''
  );
  const [selectedTerrenoId, setSelectedTerrenoId] = useState<string | null>(null);
  const [isLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const p = projects.find((pr) => pr.id === selectedProjectId);
    if (p) {
      fetchKmlAsProyecto(p.archivo_kmz_url.replace(/\.kmz$/, '.kml'))
        .then(setKmlProject)
        .catch(() => setKmlProject(null));
    }
  }, [selectedProjectId, projects]);

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

  const updateTerrenoEstado = (id_terreno: string, estado: Terreno['estado']) => {
    setKmlProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        terrenos: prev.terrenos.map((t) =>
          t.id_terreno === id_terreno ? { ...t, estado } : t
        ),
      };
    });
  };

  return {
    projects,
    currentProject,
    selectedProjectId,
    selectedTerreno,
    selectedTerrenoId,
    isLoggedIn,
    setSelectedProjectId,
    setSelectedTerrenoId,
    updateTerrenoEstado,
  };
}
