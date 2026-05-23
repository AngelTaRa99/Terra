'use client';

import { Header } from '@/components/Header';
import { MapContainer } from '@/components/MapContainer';
import { TerrainSidebar } from '@/components/TerrainSidebar';
import { useProjects } from '@/hooks/useProjects';

export default function Home() {
  const {
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
  } = useProjects();

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-map-bg)' }}>
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        isLoggedIn={isLoggedIn}
        onToggleRole={() => setIsLoggedIn((v) => !v)}
      />
      <div className="relative flex flex-1">
        <MapContainer
          project={currentProject}
          onTerrenoClick={setSelectedTerrenoId}
          selectedTerrenoId={selectedTerrenoId}
        />
        <div className="fixed bottom-4 left-4 z-50 flex gap-4 rounded-lg bg-white/90 px-4 py-2 text-xs text-gray-600 shadow-sm">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-green-500/30 border border-green-600" /> Libre
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-yellow-500/30 border border-yellow-600" /> En visita
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-orange-500/30 border border-orange-600" /> Apartado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-green-600" /> Vendido
          </span>
        </div>
        <TerrainSidebar
          terreno={selectedTerreno}
          isLoggedIn={isLoggedIn}
          onClose={() => setSelectedTerrenoId(null)}
          onEstadoChange={updateTerrenoEstado}
          visitaEndTimes={visitaEndTimes}
        />
      </div>
    </div>
  );
}
